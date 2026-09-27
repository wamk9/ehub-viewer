<script>
import InitialsAvatar from '@/components/general/InitialsAvatar.vue';
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import { toast } from '@/helpers/toast.js';
import { EHUB_FEE, userName, apiError } from './store.js';

const MEDALS = ['#d4a20f', '#8d99a6', '#b06a3b'];

export default {
  name: 'EmFinance',
  components: { InitialsAvatar },
  inject: ['em'],
  data() {
    const split = this.em.event.event_data?.prize_split;
    return { split: Array.isArray(split) && split.length ? [...split] : [50, 30, 20], saving: false };
  },
  computed: {
    ev() { return this.em.event; },
    fee() { return Number(this.ev.fee) || 0; },
    paid() { return this.em.regs.filter((r) => r.payment_status === 'confirmed'); },
    pendingCount() { return this.em.regs.filter((r) => r.payment_status === 'pending').length; },
    gross() { return this.paid.length * this.fee; },
    ehubFee() { return this.fee > 0 ? this.paid.length * Math.max(this.fee * EHUB_FEE.percent / 100, EHUB_FEE.min) : 0; },
    payments() {
      return this.em.regs
        .filter((r) => r.payment_status !== 'free')
        .sort((a, b) => (a.payment_status === 'pending' ? -1 : 0) - (b.payment_status === 'pending' ? -1 : 0)
          || new Date(b.confirmed_at || b.registered_at) - new Date(a.confirmed_at || a.registered_at));
    },
    prize() { return Number(this.ev.prize_pool_amount) || 0; },
    splitSum() { return this.split.reduce((s, p) => s + (Number(p) || 0), 0); },
    medals() { return MEDALS; },
    feePercent() { return EHUB_FEE.percent; },
    feeMin() { return EHUB_FEE.min; },
  },
  methods: {
    userName,
    money(v, cur) {
      return new Intl.NumberFormat(this.$i18n.locale, { style: 'currency', currency: (cur || this.ev.currency || 'brl').toUpperCase() }).format(v || 0);
    },
    fmtDate(d) {
      return d ? new Intl.DateTimeFormat(this.$i18n.locale, { day: '2-digit', month: 'short' }).format(new Date(d)) : '—';
    },
    async saveSplit() {
      this.saving = true;
      const prize_split = this.split.map((p) => Number(p) || 0);
      const res = await OrganizationEvent.update(this.em.orgRoute, this.em.eventRoute, { event_data: { prize_split } });
      this.saving = false;
      if (res.code === 200) {
        this.ev.event_data = { ...(this.ev.event_data || {}), prize_split };
        toast.success(this.$t('pages.event.manage.toast.saved'));
      } else toast.error(apiError(this, res.data));
    },
  },
};
</script>

<template>
  <section>
    <div class="pnl-hd">
      <div>
        <h1>{{ $t('pages.event.manage.fin.title') }}</h1>
        <p>{{ $t('pages.event.manage.fin.sub') }}</p>
      </div>
    </div>

    <div v-if="fee > 0" class="fin-grid">
      <div class="fin-kpi"><div class="l">{{ $t('pages.event.manage.fin.gross') }}</div><div class="v">{{ money(gross) }}</div></div>
      <div class="fin-kpi"><div class="l">{{ $t('pages.event.manage.fin.ehub_fee') }}</div><div class="v">{{ money(ehubFee) }}</div></div>
      <div class="fin-kpi hl"><div class="l">{{ $t('pages.event.manage.fin.net') }}</div><div class="v">{{ money(gross - ehubFee) }}</div></div>
      <div class="fin-kpi"><div class="l">{{ $t('pages.event.manage.fin.to_receive') }}</div><div class="v">{{ money(pendingCount * fee) }}</div></div>
    </div>
    <div v-if="fee > 0" class="hint" style="margin:-4px 0 16px">
      <font-awesome-icon :icon="['fas', 'circle-info']" />
      <span>{{ $t('pages.event.manage.fin.fee_hint', { p: feePercent, m: money(feeMin) }) }} {{ $t('pages.event.manage.fin.refund_hint') }}</span>
    </div>

    <div class="fin-2">
      <div class="cc">
        <div class="cc-hd">
          <h3><font-awesome-icon :icon="['fas', 'receipt']" style="color:var(--ehub-primary)" />{{ $t('pages.event.manage.fin.payments') }}</h3>
        </div>
        <div v-if="fee <= 0" class="cc-empty">{{ $t('pages.event.manage.fin.free_event') }}</div>
        <div v-else-if="!payments.length" class="cc-empty">{{ $t('pages.event.manage.fin.empty') }}</div>
        <div v-else class="tbl-wrap" style="max-height:520px;overflow-y:auto">
          <table class="mgmt-tbl">
            <thead>
              <tr>
                <th>{{ $t('pages.event.manage.fin.participant') }}</th>
                <th>{{ $t('pages.event.manage.fin.amount') }}</th>
                <th>{{ $t('pages.event.manage.fin.date') }}</th>
                <th>{{ $t('pages.event.manage.fin.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in payments" :key="r.id">
                <td>
                  <div class="who">
                    <InitialsAvatar :name="userName(r)" :image="r.user?.avatar || ''" :size="26" />
                    <div><b>{{ userName(r) }}</b><span>{{ r.gateway_payment_id || '—' }}</span></div>
                  </div>
                </td>
                <td class="td-num" style="font-weight:600">{{ money(fee) }}</td>
                <td class="td-muted">{{ fmtDate(r.confirmed_at || r.registered_at) }}</td>
                <td>
                  <span class="s-badge" :class="r.payment_status === 'confirmed' ? 'ok' : 'warn'">
                    <font-awesome-icon :icon="['fas', r.payment_status === 'confirmed' ? 'check' : 'clock']" />
                    {{ $t('pages.event.manage.reg.pay.' + r.payment_status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="cc" style="margin-top:0">
        <div class="cc-hd">
          <h3><font-awesome-icon :icon="['fas', 'trophy']" style="color:var(--ehub-gold)" />{{ $t('pages.event.manage.fin.prize') }}</h3>
        </div>
        <div v-if="!prize" class="cc-empty">{{ $t('pages.event.manage.fin.prize_none') }}</div>
        <template v-else>
          <div class="prize-row total">
            <span class="lbl">{{ $t('pages.event.manage.fin.prize_total') }}</span>
            <span class="amt" style="font-size:1.05rem">{{ money(prize, ev.prize_pool_currency) }}</span>
          </div>
          <div class="split-hd">
            <span>{{ $t('pages.event.manage.fin.split') }}</span>
            <span :class="{ bad: splitSum !== 100 }">{{ $t('pages.event.manage.fin.split_sum', { n: splitSum }) }}</span>
          </div>
          <div v-for="(p, i) in split" :key="i" class="prize-row">
            <span class="medal" :style="{ background: medals[i] || 'var(--ehub-muted)' }">{{ i + 1 }}</span>
            <span class="lbl">{{ $t('pages.event.manage.fin.place', { n: i + 1 }) }}</span>
            <div class="input-group input-group-sm" style="width:92px">
              <input v-model.number="split[i]" type="number" min="0" max="100" class="form-control" />
              <span class="input-group-text">%</span>
            </div>
            <span class="amt">{{ money(prize * (Number(p) || 0) / 100, ev.prize_pool_currency) }}</span>
            <button v-if="split.length > 1" class="act-btn del" @click="split.splice(i, 1)"><font-awesome-icon :icon="['fas', 'xmark']" /></button>
          </div>
          <div class="split-ft">
            <button class="btn btn-sm btn-outline-secondary round px-3" :disabled="split.length >= 10" @click="split.push(0)">
              <font-awesome-icon :icon="['fas', 'plus']" class="me-1" />{{ $t('pages.event.manage.fin.add_place') }}
            </button>
            <button class="btn btn-sm btn-primary round px-3" :disabled="saving || splitSum !== 100" @click="saveSplit">{{ $t('pages.event.manage.fin.save_split') }}</button>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fin-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 13px; margin-bottom: 16px; }
.fin-kpi { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 13px; padding: 15px 18px; }
.fin-kpi .v { font-size: 1.3rem; font-weight: 800; color: var(--ehub-ink); letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.fin-kpi .l { font-size: .72rem; color: var(--ehub-muted); font-weight: 500; }
.fin-kpi.hl { background: var(--ehub-primary); border-color: var(--ehub-primary); }
.fin-kpi.hl .v, .fin-kpi.hl .l { color: #fff; }
.fin-2 { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: 16px; align-items: start; }
.prize-row { display: flex; align-items: center; gap: 12px; padding: 10px 17px; border-bottom: 1px solid var(--ehub-line); }
.prize-row.total { background: color-mix(in srgb, var(--ehub-field-bg) 60%, transparent); }
.prize-row .lbl { flex: 1; font-size: .85rem; font-weight: 600; color: var(--ehub-ink); }
.prize-row .amt { font-weight: 700; font-variant-numeric: tabular-nums; min-width: 90px; text-align: right; color: var(--ehub-ink); }
.medal { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .72rem; font-weight: 800; color: #fff; flex-shrink: 0; }
.split-hd { display: flex; justify-content: space-between; padding: 10px 17px 6px; font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--ehub-muted); }
.split-hd .bad { color: #e23b3b; }
.split-ft { display: flex; justify-content: space-between; gap: 8px; padding: 12px 17px; flex-wrap: wrap; }
@media (max-width: 1100px) {
  .fin-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .fin-2 { grid-template-columns: minmax(0, 1fr); }
}
</style>
