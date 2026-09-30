<script>
import InitialsAvatar from '@/components/general/InitialsAvatar.vue';
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import { toast } from '@/helpers/toast.js';
import { EHUB_FEE, userName, apiError } from './store.js';
import EhubPrizeEditor from '@/components/modules/event-prizes/EhubPrizeEditor.vue';
import { normalizePrizes, cleanPrizes, prizeSplit, percentSum } from '@/components/modules/event-prizes/prizes.js';

export default {
  name: 'EmFinance',
  components: { InitialsAvatar, EhubPrizeEditor },
  inject: ['em'],
  data() {
    return { prizes: normalizePrizes(this.em.event.event_data), saving: false };
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
    splitSum() { return percentSum(this.prizes); },
    canEdit() { return this.em.can('finance.write'); },
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
      const prizes = cleanPrizes(this.prizes);
      const prize_split = prizeSplit(prizes);
      const res = await OrganizationEvent.update(this.em.orgRoute, this.em.eventRoute, { event_data: { prizes, prize_split } });
      this.saving = false;
      if (res.code === 200) {
        this.ev.event_data = { ...(this.ev.event_data || {}), prizes, prize_split };
        this.prizes = prizes;
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
          <h3><font-awesome-icon :icon="['fas', 'receipt']" style="color:var(--ehub-primary-text)" />{{ $t('pages.event.manage.fin.payments') }}</h3>
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
        <div v-if="prize" class="prize-row total">
          <span class="lbl">{{ $t('pages.event.manage.fin.prize_total') }}</span>
          <span class="amt" style="font-size:1.05rem">{{ money(prize, ev.prize_pool_currency) }}</span>
        </div>
        <div class="prize-body">
          <p class="prize-hint">{{ $t('pages.event.manage.fin.prize_hint') }}</p>
          <EhubPrizeEditor v-model="prizes" :total="prize" :currency="ev.prize_pool_currency || ev.currency || 'BRL'" />
          <div v-if="canEdit" class="split-ft">
            <button class="btn btn-sm btn-primary round px-3" :disabled="saving || splitSum > 100" @click="saveSplit">{{ $t('pages.event.manage.fin.save_split') }}</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fin-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 13px; margin-bottom: 16px; }
.fin-kpi { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 13px; padding: 15px 18px; }
.fin-kpi .v { font-size: 1.3rem; font-weight: 800; color: var(--ehub-ink); letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.fin-kpi .l { font-size: .72rem; color: var(--ehub-muted); font-weight: 500; }
.fin-kpi.hl { background: var(--ehub-primary-strong); border-color: var(--ehub-primary); }
.fin-kpi.hl .v, .fin-kpi.hl .l { color: #fff; }
.fin-2 { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; align-items: start; }
.prize-row { display: flex; align-items: center; gap: 12px; padding: 10px 17px; border-bottom: 1px solid var(--ehub-line); }
.prize-row.total { background: color-mix(in srgb, var(--ehub-field-bg) 60%, transparent); }
.prize-row .lbl { flex: 1; font-size: .85rem; font-weight: 600; color: var(--ehub-ink); }
.prize-row .amt { font-weight: 700; font-variant-numeric: tabular-nums; min-width: 90px; text-align: right; color: var(--ehub-ink); }
.medal { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .72rem; font-weight: 800; color: #fff; flex-shrink: 0; }

.prize-body { padding: 12px 17px 14px; }
.prize-hint { font-size: .76rem; color: var(--ehub-muted); margin: 0 0 12px; }
.split-hd { display: flex; justify-content: space-between; padding: 10px 17px 6px; font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--ehub-muted); }
.split-hd .bad { color: var(--ehub-danger-text); }
.split-ft { display: flex; justify-content: flex-end; gap: 8px; padding-top: 12px; flex-wrap: wrap; }
@media (max-width: 1100px) {
  .fin-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .fin-2 { grid-template-columns: minmax(0, 1fr); }
}
</style>
