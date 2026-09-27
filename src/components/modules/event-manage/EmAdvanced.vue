<script>
import EhubDialog from '@/components/modals/EhubDialog.vue';
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import { toast } from '@/helpers/toast.js';
import { apiError } from './store.js';

export default {
  name: 'EmAdvanced',
  components: { EhubDialog },
  inject: ['em'],
  data() {
    return { delOpen: false, confirmName: '', busy: false };
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
      this.confirmName = '';
      this.delOpen = true;
    },
    async remove() {
      if (this.confirmName.trim() !== this.ev.name) return;
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
      <p v-if="ev.finished" class="hint m-0"><font-awesome-icon :icon="['fas', 'flag-checkered']" />{{ $t('pages.event.manage.adv.finish_done') }}</p>
      <template v-else>
        <button class="btn btn-outline-secondary round px-3" :disabled="busy || !ev.initialized" @click="finish">
          <font-awesome-icon :icon="['fas', 'flag-checkered']" class="me-2" />{{ $t('pages.event.manage.adv.finish_btn') }}
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
      <button class="btn btn-outline-danger round px-3" :disabled="busy" @click="openDelete">
        <font-awesome-icon :icon="['fas', 'trash']" class="me-2" />{{ $t('pages.event.manage.adv.del') }}
      </button>
    </div>

    <EhubDialog v-model="delOpen" :title="$t('pages.event.manage.adv.del')" size="sm">
      <p class="del-warn">
        <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="me-2" />{{ $t('pages.event.manage.adv.del_hint') }}
      </p>
      <label class="form-label mb-1" style="font-size:.84rem">{{ $t('pages.event.manage.adv.type_name', { n: ev.name }) }}</label>
      <input v-model="confirmName" class="form-control" autocomplete="off" @keyup.enter="remove" />
      <template #footer>
        <button class="btn btn-outline-secondary round px-3" @click="delOpen = false">{{ $t('pages.event.manage.c.cancel') }}</button>
        <button class="btn btn-danger round px-3" :disabled="busy || confirmName.trim() !== ev.name" @click="remove">
          <font-awesome-icon :icon="['fas', 'trash']" class="me-2" />{{ $t('pages.event.manage.adv.del_btn') }}
        </button>
      </template>
    </EhubDialog>
  </section>
</template>

<style scoped>
.del-warn { font-size: .85rem; color: #e23b3b; background: color-mix(in srgb, #e23b3b 7%, transparent); border: 1px solid color-mix(in srgb, #e23b3b 25%, var(--ehub-line)); border-radius: 10px; padding: 12px 14px; margin-bottom: 16px; text-wrap: pretty; }
</style>
