<script>
import EhubMgmtLayout from '@/components/general/EhubMgmtLayout.vue';
import SystemVars from '@/helpers/General/SystemVars';
import EhubDialog from '@/components/modals/EhubDialog.vue';
import { createEventManageStore, stageState } from '@/components/modules/event-manage/store.js';
import EmOverview from '@/components/modules/event-manage/EmOverview.vue';
import EmRegistrations from '@/components/modules/event-manage/EmRegistrations.vue';
import EmStages from '@/components/modules/event-manage/EmStages.vue';
import EmResults from '@/components/modules/event-manage/EmResults.vue';
import EmNews from '@/components/modules/event-manage/EmNews.vue';
import EmLive from '@/components/modules/event-manage/EmLive.vue';
import EmFinance from '@/components/modules/event-manage/EmFinance.vue';
import EmAdvanced from '@/components/modules/event-manage/EmAdvanced.vue';

const PANELS = [
  { key: 'overview', icon: 'gauge-high', comp: 'EmOverview' },
  { key: 'regs', icon: 'id-card', comp: 'EmRegistrations' },
  { key: 'stages', icon: 'flag-checkered', comp: 'EmStages' },
  { key: 'results', icon: 'ranking-star', comp: 'EmResults' },
  { key: 'news', icon: 'bullhorn', comp: 'EmNews' },
  { key: 'live', icon: 'tower-broadcast', comp: 'EmLive' },
  { key: 'finance', icon: 'wallet', comp: 'EmFinance' },
  { key: 'advanced', icon: 'sliders', comp: 'EmAdvanced' },
];

export default {
  name: 'EventManage',
  components: { EhubMgmtLayout, EhubDialog, EmOverview, EmRegistrations, EmStages, EmResults, EmNews, EmLive, EmFinance, EmAdvanced },
  provide() {
    return { em: this.em };
  },
  data() {
    return {
      em: createEventManageStore(this.$route.params.orgRoute, this.$route.params.eventRoute),
      baseUrl: SystemVars.baseUrl,
    };
  },
  computed: {
    /** Panels this user can open (the API decides; see EventPermissions). */
    visiblePanels() {
      return PANELS.filter((x) => this.em.canPanel(x.key));
    },
    panel() {
      const p = this.$route.params.panel;
      const allowed = this.visiblePanels;
      if (allowed.some((x) => x.key === p)) return p;
      return allowed[0]?.key || 'overview';
    },
    current() {
      return PANELS.find((x) => x.key === this.panel);
    },
    event() {
      return this.em.event;
    },
    pendingCount() {
      return this.em.regs.filter((r) => r.payment_status === 'pending').length;
    },
    hasLiveStage() {
      return (this.event?.stages || []).some((s) => stageState(s) === 'live');
    },
    logoUrl() {
      return this.event?.logo_image ? this.baseUrl + 'storage/' + this.event.logo_image : null;
    },
    initials() {
      return (this.event?.name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    },
    navItems() {
      return this.visiblePanels.map((p) => ({
        key: p.key,
        icon: p.icon,
        label: this.$t('pages.event.manage.nav.' + p.key),
        badge: p.key === 'regs' && this.pendingCount ? this.pendingCount : null,
        badgeClass: 'warn',
        live: p.key === 'stages' && this.hasLiveStage,
      }));
    },
    navLinks() {
      const links = [];
      if (this.event && !this.event.initialized && this.em.can('event.manage')) {
        links.push({ to: { name: 'manage-organization-events-create', params: { orgRoute: this.em.orgRoute, eventRoute: this.em.eventRoute }, query: { return: 'manage' } }, icon: 'pen', label: this.$t('pages.event.manage.nav.edit') });
      }
      links.push({ to: `/org/${this.em.orgRoute}/event/${this.em.eventRoute}`, icon: 'arrow-up-right-from-square', label: this.$t('pages.event.manage.nav.public') });
      links.push({ to: `/org/${this.em.orgRoute}/manage`, icon: 'arrow-left', label: this.$t('pages.event.manage.nav.back') });
      return links;
    },
    accent() {
      const c = this.event?.color || this.event?.organization?.color || '#0098D8';
      return `linear-gradient(135deg, ${c}, color-mix(in srgb, ${c}, #fff 35%))`;
    },
  },
  watch: {
    '$route.params.panel'() {
      window.scrollTo(0, 0);
    },
  },
  async mounted() {
    await this.em.loadAll();
    if (this.event) document.title = 'eHub — ' + this.event.name;
  },
  methods: {
    go(key) {
      this.$router.push({ name: 'manage-event', params: { orgRoute: this.em.orgRoute, eventRoute: this.em.eventRoute, panel: key === 'overview' ? undefined : key } });
    },
  },
};
</script>

<template>
  <EhubMgmtLayout
    :name="event?.name || ''"
    :subtitle="event?.organization?.name || ''"
    :logo-url="logoUrl || ''"
    :initials="initials"
    :logo-bg="accent"
    :loading="!event"
    :items="navItems"
    :active="panel"
    :links="navLinks"
    @select="go"
  >
    <div v-if="em.loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    <div v-else-if="em.notFound" class="cc">
      <div class="cc-empty">
        <font-awesome-icon :icon="['fas', 'lock']" class="ico" />
        {{ $t('pages.event.manage.c.not_found') }}
      </div>
    </div>
    <component :is="current.comp" v-else :key="panel" />

    <!-- Shared confirm -->
    <EhubDialog :model-value="em.confirm.open" :title="$t('pages.event.manage.c.confirm')" :icon="em.confirm.danger ? 'triangle-exclamation' : 'circle-info'" :tone="em.confirm.danger ? 'danger' : 'primary'" centered size="sm" @close="em.answer(false)">
      <p style="margin:0 auto;max-width:340px;font-size:.88rem;color:var(--ehub-muted);line-height:1.5;text-wrap:pretty">{{ em.confirm.message }}</p>
      <template #footer>
        <button class="btn btn-outline-secondary round" @click="em.answer(false)">{{ $t('pages.event.manage.c.cancel') }}</button>
        <button class="btn round" :class="em.confirm.danger ? 'btn-danger' : 'btn-primary'" @click="em.answer(true)">{{ em.confirm.label }}</button>
      </template>
    </EhubDialog>
  </EhubMgmtLayout>
</template>
