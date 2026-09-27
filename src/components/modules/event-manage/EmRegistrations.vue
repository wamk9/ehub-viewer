<script>
import InitialsAvatar from '@/components/general/InitialsAvatar.vue';
import EhubDialog from '@/components/modals/EhubDialog.vue';
import OrganizationEventRegistration from '@/helpers/communication/OrganizationEventRegistration.js';
import { toast } from '@/helpers/toast.js';
import { userName, apiError } from './store.js';

export default {
  name: 'EmRegistrations',
  components: { InitialsAvatar, EhubDialog },
  inject: ['em'],
  data() {
    return { filter: 'all', q: '', sheet: null, busyId: null };
  },
  computed: {
    ev() { return this.em.event; },
    regs() { return this.em.regs; },
    counted() { return this.regs.filter((r) => r.payment_status !== 'pending').length; },
    counts() {
      const c = { all: this.regs.length, confirmed: 0, free: 0, pending: 0 };
      this.regs.forEach((r) => { c[r.payment_status] = (c[r.payment_status] || 0) + 1; });
      return c;
    },
    rows() {
      const q = this.q.trim().toLowerCase();
      return this.regs.filter((r) =>
        (this.filter === 'all' || r.payment_status === this.filter)
        && (!q || `${r.user?.name || ''} ${r.user?.username || ''}`.toLowerCase().includes(q)));
    },
    /** name → label map from the registration form template. */
    formLabels() {
      const map = {};
      (this.ev.registration_form_template || []).forEach((f) => { if (f?.name) map[f.name] = f.label || f.name; });
      return map;
    },
  },
  methods: {
    userName,
    fmtDate(d, withTime = false) {
      if (!d) return '—';
      const o = withTime ? { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' } : { day: '2-digit', month: 'short', year: 'numeric' };
      return new Intl.DateTimeFormat(this.$i18n.locale, o).format(new Date(d));
    },
    money(v) {
      return new Intl.NumberFormat(this.$i18n.locale, { style: 'currency', currency: (this.ev.currency || 'brl').toUpperCase() }).format(v || 0);
    },
    formValue(v) {
      if (typeof v === 'boolean') return v ? '✓' : '✗';
      if (Array.isArray(v)) return v.join(', ');
      if (v && typeof v === 'object') return JSON.stringify(v);
      return v ?? '—';
    },
    gatewayLabel(g) {
      if (!g) return '—';
      if (g === 'manual') return this.$t('pages.event.manage.reg.manual');
      return { mercadopago: 'Mercado Pago', stripe_connect: 'Stripe' }[g] || g;
    },
    async toggleCheck(r, e) {
      const value = e.target.checked;
      this.busyId = r.id;
      const res = await OrganizationEventRegistration.manageUpdate(this.em.orgRoute, this.em.eventRoute, r.id, { checked_in: value });
      this.busyId = null;
      if (res.code === 200) this.em.putReg(res.data);
      else { e.target.checked = !value; toast.error(apiError(this, res.data)); }
    },
    async confirmPay(r) {
      const ok = await this.em.ask(this.$t('pages.event.manage.reg.confirm_manual_q', { n: userName(r) }), this.$t('pages.event.manage.reg.confirm_manual'));
      if (!ok) return;
      const res = await OrganizationEventRegistration.manageUpdate(this.em.orgRoute, this.em.eventRoute, r.id, { confirm_payment: true });
      if (res.code === 200) {
        this.em.putReg(res.data);
        if (this.sheet?.id === r.id) this.sheet = res.data;
        toast.success(this.$t('pages.event.manage.toast.confirmed'));
      } else toast.error(apiError(this, res.data));
    },
    async remove(r) {
      const ok = await this.em.ask(this.$t('pages.event.manage.reg.remove_q', { n: userName(r) }), this.$t('pages.event.manage.reg.remove'), true);
      if (!ok) return;
      const res = await OrganizationEventRegistration.manageRemove(this.em.orgRoute, this.em.eventRoute, r.id);
      if (res.code === 200) {
        this.em.regs = this.em.regs.filter((x) => x.id !== r.id);
        this.sheet = null;
        toast.success(this.$t('pages.event.manage.toast.removed'));
      } else toast.error(apiError(this, res.data));
    },
    exportCsv() {
      const h = (k) => this.$t('pages.event.manage.reg.csv.' + k);
      const fields = Object.keys(this.formLabels);
      const head = [h('name'), h('username'), h('status'), h('date'), h('check'), ...fields.map((f) => this.formLabels[f])];
      const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const lines = this.rows.map((r) => [
        r.user?.name, r.user?.username, this.$t('pages.event.manage.reg.pay.' + r.payment_status),
        r.registered_at ? new Date(r.registered_at).toISOString() : '', r.checked_in ? '1' : '0',
        ...fields.map((f) => this.formValue(r.form_data?.[f])),
      ].map(esc).join(','));
      const blob = new Blob(['﻿' + [head.map(esc).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${this.em.eventRoute}-registrations.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    },
  },
};
</script>

<template>
  <section>
    <div class="pnl-hd">
      <div>
        <h1>{{ $t('pages.event.manage.reg.title') }}</h1>
        <p>{{ ev.max_registrations ? $t('pages.event.manage.reg.sub', { a: counted, b: ev.max_registrations }) : $t('pages.event.manage.reg.sub_nomax', { a: counted }) }}</p>
      </div>
      <div class="spacer"></div>
      <div class="hd-acts">
        <button class="btn btn-outline-secondary round px-3" :disabled="!rows.length" @click="exportCsv">
          <font-awesome-icon :icon="['fas', 'file-arrow-down']" class="me-2" />{{ $t('pages.event.manage.c.export') }}
        </button>
      </div>
    </div>

    <div class="sum-grid">
      <div class="sum-cell">
        <div class="sum-lbl">{{ $t('pages.event.manage.reg.capacity') }}</div>
        <div style="display:flex;align-items:center;gap:12px">
          <div v-if="ev.max_registrations" class="prog" style="flex:1"><div :style="{ width: Math.min(100, counted / ev.max_registrations * 100) + '%' }"></div></div>
          <span class="sum-val td-num">{{ counted }}{{ ev.max_registrations ? '/' + ev.max_registrations : '' }}</span>
        </div>
      </div>
      <div class="sum-cell">
        <div class="sum-lbl">{{ $t('pages.event.manage.reg.deadline') }}</div>
        <div class="sum-val">{{ fmtDate(ev.registration_deadline) }}</div>
      </div>
      <div class="sum-cell">
        <div class="sum-lbl">{{ $t('pages.event.manage.reg.entry') }}</div>
        <div class="sum-val">{{ $t('pages.event.manage.reg.' + (ev.entry_type === 'team' ? 'team' : 'individual')) }}</div>
      </div>
      <div class="sum-cell">
        <div class="sum-lbl">{{ $t('pages.event.manage.reg.fee') }}</div>
        <div class="sum-val">{{ ev.fee > 0 ? money(ev.fee) : $t('pages.event.manage.reg.free') }}</div>
      </div>
    </div>

    <div class="sec-bar">
      <div class="seg seg-sm">
        <button v-for="f in ['all', 'confirmed', 'free', 'pending']" :key="f" :class="{ active: filter === f }" @click="filter = f">
          {{ f === 'all' ? $t('pages.event.manage.c.all') : $t('pages.event.manage.reg.f_' + f) }}
          <span style="opacity:.7">{{ counts[f] || 0 }}</span>
        </button>
      </div>
      <div class="sb-sp"></div>
      <div class="input-group input-group-sm" style="max-width:220px">
        <span class="input-group-text"><font-awesome-icon :icon="['fas', 'magnifying-glass']" /></span>
        <input v-model="q" type="text" class="form-control" :placeholder="$t('pages.event.manage.c.search')" />
      </div>
    </div>

    <div class="cc">
      <div v-if="!rows.length" class="cc-empty">
        <font-awesome-icon :icon="['fas', 'id-card']" class="ico" />
        {{ regs.length ? $t('pages.event.manage.reg.empty_filter') : $t('pages.event.manage.reg.empty') }}
      </div>
      <div v-else class="tbl-wrap">
        <table class="mgmt-tbl">
          <thead>
            <tr>
              <th>{{ $t('pages.event.manage.reg.col_part') }}</th>
              <th>{{ $t('pages.event.manage.reg.col_pay') }}</th>
              <th>{{ $t('pages.event.manage.reg.col_date') }}</th>
              <th>{{ $t('pages.event.manage.reg.col_check') }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id">
              <td>
                <div class="who">
                  <InitialsAvatar :name="userName(r)" :image="r.user?.avatar || ''" :size="30" />
                  <div><b>{{ userName(r) }}</b><span>@{{ r.user?.username }}</span></div>
                </div>
              </td>
              <td><span class="s-badge" :class="{ confirmed: 'ok', free: 'pri', pending: 'warn' }[r.payment_status]">
                <font-awesome-icon :icon="['fas', { confirmed: 'check', free: 'gift', pending: 'clock' }[r.payment_status] || 'check']" />
                {{ $t('pages.event.manage.reg.pay.' + r.payment_status) }}
              </span></td>
              <td class="td-muted">{{ fmtDate(r.registered_at) }}</td>
              <td>
                <div class="form-check form-switch m-0">
                  <input class="form-check-input" type="checkbox" :checked="r.checked_in" :disabled="busyId === r.id" @change="toggleCheck(r, $event)" />
                </div>
              </td>
              <td>
                <div class="act-row">
                  <button class="act-btn" :title="$t('pages.event.manage.reg.view')" @click="sheet = r"><font-awesome-icon :icon="['fas', 'eye']" /></button>
                  <button v-if="r.payment_status === 'pending'" class="act-btn ok" :title="$t('pages.event.manage.reg.confirm_manual')" @click="confirmPay(r)"><font-awesome-icon :icon="['fas', 'check']" /></button>
                  <button class="act-btn del" :title="$t('pages.event.manage.reg.remove')" @click="remove(r)"><font-awesome-icon :icon="['fas', 'user-minus']" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Registration sheet -->
    <EhubDialog :model-value="!!sheet" :title="$t('pages.event.manage.reg.sheet')" @close="sheet = null">
      <template v-if="sheet">
        <div class="who" style="margin-bottom:18px;display:flex;align-items:center;gap:10px">
          <InitialsAvatar :name="userName(sheet)" :image="sheet.user?.avatar || ''" :size="44" />
          <div style="flex:1"><b style="font-size:1rem;display:block">{{ userName(sheet) }}</b><span class="text-muted small">@{{ sheet.user?.username }}</span></div>
        </div>
        <div class="kv-title">{{ $t('pages.event.manage.reg.form_data') }}</div>
        <dl v-if="sheet.form_data && Object.keys(sheet.form_data).length" class="kv">
          <template v-for="(v, k) in sheet.form_data" :key="k">
            <dt>{{ formLabels[k] || k }}</dt><dd>{{ formValue(v) }}</dd>
          </template>
        </dl>
        <p v-else class="text-muted small m-0">{{ $t('pages.event.manage.reg.no_form_data') }}</p>
        <div class="kv-title">{{ $t('pages.event.manage.reg.payment') }}</div>
        <dl class="kv">
          <dt>{{ $t('pages.event.manage.reg.col_pay') }}</dt><dd>{{ $t('pages.event.manage.reg.pay.' + sheet.payment_status) }}</dd>
          <dt>{{ $t('pages.event.manage.reg.gateway') }}</dt><dd>{{ gatewayLabel(sheet.gateway) }}</dd>
          <dt>{{ $t('pages.event.manage.reg.pay_id') }}</dt><dd>{{ sheet.gateway_payment_id || '—' }}</dd>
          <dt>{{ $t('pages.event.manage.reg.confirmed_at') }}</dt><dd>{{ fmtDate(sheet.confirmed_at, true) }}</dd>
        </dl>
      </template>
      <template #footer>
        <button v-if="sheet?.payment_status === 'pending'" class="btn btn-primary round px-3" @click="confirmPay(sheet)">{{ $t('pages.event.manage.reg.confirm_manual') }}</button>
        <button class="btn btn-outline-secondary round px-3" @click="sheet = null">{{ $t('pages.event.manage.c.close') }}</button>
      </template>
    </EhubDialog>
  </section>
</template>

<style scoped>
.sum-grid { display: grid; grid-template-columns: minmax(0, 1.6fr) repeat(3, minmax(0, 1fr)); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); background: var(--ehub-card); margin-bottom: 16px; }
.sum-cell { padding: 14px 18px; border-right: 1px solid var(--ehub-line); }
.sum-cell:last-child { border-right: 0; }
.sum-lbl { font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--ehub-muted); margin-bottom: 5px; }
.sum-val { font-size: .95rem; font-weight: 700; color: var(--ehub-ink); }
@media (max-width: 1100px) {
  .sum-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sum-cell:nth-child(2) { border-right: 0; }
  .sum-cell:nth-child(-n+2) { border-bottom: 1px solid var(--ehub-line); }
}
</style>
