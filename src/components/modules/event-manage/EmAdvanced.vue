<script>
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import { toast } from '@/helpers/toast.js';
import { apiError } from './store.js';

export default {
  name: 'EmAdvanced',
  inject: ['em'],
  data() {
    return { confirmName: '', busy: false };
  },
  computed: {
    ev() { return this.em.event; },
  },
  methods: {
    async duplicate() {
      this.busy = true;
      const res = await OrganizationEvent.duplicate(this.em.orgRoute, this.em.eventRoute);
      this.busy = false;
      if (res.code === 201) {
        toast.success(this.$t('pages.event.manage.toast.dup'));
        this.$router.push({ name: 'manage-organization-events-create', params: { orgRoute: this.em.orgRoute, eventRoute: res.data.route } });
      } else toast.error(apiError(this, res.data));
    },
    async remove() {
      if (this.confirmName.trim() !== this.ev.name) return;
      this.busy = true;
      const res = await OrganizationEvent.destroy(this.em.orgRoute, this.em.eventRoute);
      this.busy = false;
      if (res.code === 200) {
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
      <h3>{{ $t('pages.event.manage.adv.dup') }}</h3>
      <p class="set-desc">{{ $t('pages.event.manage.adv.dup_hint') }}</p>
      <button class="btn btn-outline-secondary round px-3" :disabled="busy" @click="duplicate">
        <font-awesome-icon :icon="['fas', 'copy']" class="me-2" />{{ $t('pages.event.manage.adv.dup_btn') }}
      </button>
    </div>

    <div class="set-card danger">
      <h3>{{ $t('pages.event.manage.adv.del') }}</h3>
      <p class="set-desc">{{ $t('pages.event.manage.adv.del_hint') }}</p>
      <div class="danger-box">
        <label class="form-label mb-1" style="font-size:.84rem">{{ $t('pages.event.manage.adv.type_name', { n: ev.name }) }}</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <input v-model="confirmName" class="form-control form-control-sm" style="flex:1;min-width:160px" />
          <button class="btn btn-sm btn-danger round px-3" :disabled="busy || confirmName.trim() !== ev.name" @click="remove">
            <font-awesome-icon :icon="['fas', 'trash']" class="me-2" />{{ $t('pages.event.manage.adv.del_btn') }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
