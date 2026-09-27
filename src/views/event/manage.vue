<script>
import '@/assets/ehub-mgmt.css';
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
  components: { EhubDialog, EmOverview, EmRegistrations, EmStages, EmResults, EmNews, EmLive, EmFinance, EmAdvanced },
  provide() {
    return { em: this.em };
  },
  data() {
    return {
      em: createEventManageStore(this.$route.params.orgRoute, this.$route.params.eventRoute),
      panels: PANELS,
      mobileMenuOpen: false,
      baseUrl: SystemVars.baseUrl,
    };
  },
  computed: {
    panel() {
      const p = this.$route.params.panel;
      return PANELS.some((x) => x.key === p) ? p : 'overview';
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
    accent() {
      const c = this.event?.color || this.event?.organization?.color || '#0098D8';
      return `linear-gradient(135deg, ${c}, color-mix(in srgb, ${c}, #fff 35%))`;
    },
  },
  watch: {
    '$route.params.panel'() {
      this.mobileMenuOpen = false;
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
  <div class="mgmt-wrap ehub-mgmt">
    <!-- ── SIDEBAR ── -->
    <aside class="mgmt-sidebar">
      <div class="sb-org">
        <div v-if="!event" class="sb-logo sb-skel"></div>
        <div v-else class="sb-logo" :style="{ background: accent }">
          <img v-if="logoUrl" :src="logoUrl" :alt="event.name" @error="$event.target.style.display = 'none'" />
          <span>{{ initials }}</span>
        </div>
        <div v-if="event" style="min-width:0">
          <div class="sb-name">{{ event.name }}</div>
          <div class="sb-cat">{{ event.organization?.name }}</div>
        </div>
        <div v-else style="flex:1;min-width:0">
          <div class="sb-skel" style="height:12px;border-radius:4px;width:75%;margin-bottom:6px"></div>
          <div class="sb-skel" style="height:10px;border-radius:4px;width:45%"></div>
        </div>
      </div>

      <button class="mob-menu-toggle" @click="mobileMenuOpen = !mobileMenuOpen">
        <font-awesome-icon :icon="['fas', current.icon]" style="width:15px" />
        <span>{{ $t('pages.event.manage.nav.' + panel) }}</span>
        <font-awesome-icon :icon="['fas', 'chevron-down']" class="mob-chevron" :class="{ open: mobileMenuOpen }" />
      </button>

      <nav class="sb-nav" :class="{ 'mob-open': mobileMenuOpen }">
        <button v-for="p in panels" :key="p.key" class="nav-item" :class="{ active: panel === p.key }" @click="go(p.key)">
          <font-awesome-icon :icon="['fas', p.icon]" />
          <span>{{ $t('pages.event.manage.nav.' + p.key) }}</span>
          <span v-if="p.key === 'regs' && pendingCount" class="nav-badge warn">{{ pendingCount }}</span>
          <span v-if="p.key === 'stages' && hasLiveStage" class="nav-live"></span>
        </button>
        <div class="nav-div"></div>
        <router-link v-if="event && !event.initialized"
          :to="{ name: 'manage-organization-events-create', params: { orgRoute: em.orgRoute, eventRoute: em.eventRoute } }"
          class="nav-item">
          <font-awesome-icon :icon="['fas', 'pen']" />
          <span>{{ $t('pages.event.manage.nav.edit') }}</span>
        </router-link>
        <router-link :to="`/org/${em.orgRoute}/event/${em.eventRoute}`" class="nav-item">
          <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" />
          <span>{{ $t('pages.event.manage.nav.public') }}</span>
        </router-link>
        <router-link :to="`/org/${em.orgRoute}/manage`" class="nav-item">
          <font-awesome-icon :icon="['fas', 'arrow-left']" />
          <span>{{ $t('pages.event.manage.nav.back') }}</span>
        </router-link>
      </nav>
    </aside>
    <div v-if="mobileMenuOpen" class="mob-nav-backdrop" @click="mobileMenuOpen = false"></div>

    <!-- ── MAIN ── -->
    <main class="mgmt-main">
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
    </main>

    <!-- Shared confirm -->
    <EhubDialog :model-value="em.confirm.open" :title="$t('pages.event.manage.c.confirm')" size="sm" @close="em.answer(false)">
      <p style="margin:0;font-size:.9rem;text-wrap:pretty">{{ em.confirm.message }}</p>
      <template #footer>
        <button class="btn btn-outline-secondary round px-3" @click="em.answer(false)">{{ $t('pages.event.manage.c.cancel') }}</button>
        <button class="btn round px-4" :class="em.confirm.danger ? 'btn-danger' : 'btn-primary'" @click="em.answer(true)">{{ em.confirm.label }}</button>
      </template>
    </EhubDialog>
  </div>
</template>
