<script>
import EhubConfirmNameDialog from '@/components/modals/EhubConfirmNameDialog.vue';
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import { toast } from '@/helpers/toast.js';
import { apiError } from './store.js';

export default {
  name: 'EmAdvanced',
  components: { EhubConfirmNameDialog },
  inject: ['em'],
  data() {
    return { delOpen: false, busy: false };
  },
  computed: {
    ev() { return this.em.event; },
  },
  methods: {
    async finish() {
      const ok = await this.em.ask(this.$t('pages.event.manage.adv.finish_q'), this.$t('pages.event.manage.adv.finish_btn'), true);
      if (!ok) return;
      this.busy = true;
      const res = await OrganizationEvent.control(this.em.orgRoute, this.em.eventRoute, 'finish');
      this.busy = false;
      if (res.code === 200) {
        Object.assign(this.ev, res.data);
        toast.success(this.$t('pages.event.manage.toast.ev_finished'));
      } else toast.error(apiError(this, res.data));
    },
    async duplicate() {
      this.busy = true;
      const res = await OrganizationEvent.duplicate(this.em.orgRoute, this.em.eventRoute);
      this.busy = false;
      if (res.code === 201) {
        toast.success(this.$t('pages.event.manage.toast.dup'));
        this.$router.push({ name: 'manage-organization-events-create', params: { orgRoute: this.em.orgRoute, eventRoute: res.data.route } });
      } else toast.error(apiError(this, res.data));
    },
    openDelete() {
      this.delOpen = true;
    },
    async remove() {
      this.busy = true;
      const res = await OrganizationEvent.destroy(this.em.orgRoute, this.em.eventRoute);
      this.busy = false;
      if (res.code === 200) {
        this.delOpen = false;
        toast.success(this.$t('pages.event.manage.toast.ev_deleted'));
        this.$router.push(`/org/${this.em.orgRoute}/manage`);
      } else if (res.code === 401) {
        toast.error(this.$t('pages.event.manage.adv.del_owner_only'));
      } else toast.error(apiError(this, res.data));
    },
  },
};
</script>

<template>
  <section>
    <div class="pnl-hd">
      <div>
        <h1>{{ $t('pages.event.manage.adv.title') }}</h1>
        <p>{{ $t('pages.event.manage.adv.sub') }}</p>
      </div>
    </div>

    <div class="set-card">
      <h3>{{ $t('pages.event.manage.adv.finish') }}</h3>
      <p class="set-desc">{{ $t('pages.event.manage.adv.finish_hint') }}</p>
      <p v-if="ev.finished" class="hint m-0"><font-awesome-icon :icon="['fas', 'flag']" />{{ $t('pages.event.manage.adv.finish_done') }}</p>
      <template v-else>
        <button class="btn btn-outline-secondary round px-3" :disabled="busy || !ev.initialized" @click="finish">
          <font-awesome-icon :icon="['fas', 'flag']" class="me-2" />{{ $t('pages.event.manage.adv.finish_btn') }}
        </button>
        <p v-if="!ev.initialized" class="hint mt-2 mb-0"><font-awesome-icon :icon="['fas', 'circle-info']" />{{ $t('pages.event.manage.adv.finish_not_started') }}</p>
      </template>
    </div>

    <div class="set-card">
      <h3>{{ $t('pages.event.manage.adv.dup') }}</h3>
      <p class="set-desc">{{ $t('pages.event.manage.adv.dup_hint') }}</p>
      <button class="btn btn-outline-secondary round px-3" :disabled="busy" @click="duplicate">
        <font-awesome-icon :icon="['fas', 'copy']" class="me-2" />{{ $t('pages.event.manage.adv.dup_btn') }}
      </button>
    </div>

    <div v-if="em.can('event.delete')" class="set-card danger">
      <h3>{{ $t('pages.event.manage.adv.del') }}</h3>
      <p class="set-desc">{{ $t('pages.event.manage.adv.del_hint') }}</p>
      <p v-if="ev.initialized && !ev.finished" class="hint m-0"><font-awesome-icon :icon="['fas', 'circle-info']" />{{ $t('pages.event.manage.adv.del_running') }}</p>
      <button v-else class="btn btn-outline-danger round px-3" :disabled="busy" @click="openDelete">
        <font-awesome-icon :icon="['fas', 'trash']" class="me-2" />{{ $t('pages.event.manage.adv.del') }}
      </button>
    </div>

    <EhubConfirmNameDialog
      v-model="delOpen"
      :title="$t('pages.event.manage.adv.del')"
      :message="$t('pages.event.manage.adv.del_confirm_msg')"
      :name="ev.name"
      :type-label="$t('pages.event.manage.adv.type_name_hint', { n: ev.name })"
      :confirm-label="$t('pages.event.manage.adv.del_btn')"
      :cancel-label="$t('pages.event.manage.c.cancel')"
      :loading="busy"
      @confirm="remove"
    />
  </section>
</template>

<style scoped>
</style>
