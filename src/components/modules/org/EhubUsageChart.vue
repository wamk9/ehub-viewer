<template>
  <div class="euc">
    <div class="euc-top">
      <div class="euc-legend">
        <span><i class="sw rev"></i>{{ $t(K + 'revenue') }} ({{ symbol(cur) }})</span>
        <span v-if="showFee"><i class="sw fee"></i>{{ $t(K + 'fee') }}</span>
      </div>
      <!-- Revenue stays in each event's currency: one axis per currency. -->
      <div v-if="currencies.length > 1" class="euc-cur" role="tablist">
        <button v-for="c in currencies" :key="c" type="button" :class="{ on: cur === c }" @click="cur = c">{{ c.toUpperCase() }}</button>
      </div>
    </div>

    <div class="euc-plot" @mouseleave="hover = null">
      <!-- recessive grid with value ticks -->
      <div class="euc-grid">
        <div v-for="t in ticks" :key="t" class="euc-gl" :style="{ bottom: (t / scaleMax * 100) + '%' }">
          <span>{{ short(t) }}</span>
        </div>
      </div>

      <div class="euc-cols">
        <div
          v-for="(m, i) in months" :key="m.billing_cycle" class="euc-col"
          :class="{ on: hover === i, partial: i === months.length - 1 }"
          @mouseenter="hover = i" @focus="hover = i" tabindex="0"
        >
          <div class="euc-bars">
            <div class="bar rev" :style="{ height: h(rev(m)) }"></div>
            <div v-if="showFee" class="bar fee" :style="{ height: h(m.total_amount) }"></div>
          </div>
          <div class="euc-x">{{ monthShort(m.billing_cycle) }}<span v-if="i === months.length - 1">*</span></div>

          <div v-if="hover === i" class="euc-tip" :class="{ left: i > months.length / 2 }">
            <div class="t">{{ monthLong(m.billing_cycle) }}<span v-if="i === months.length - 1"> · {{ $t(K + 'partial') }}</span></div>
            <div class="r"><i class="sw rev"></i>{{ $t(K + 'revenue') }}<b>{{ money(rev(m), cur) }}</b></div>
            <div class="r"><i class="sw fee"></i>{{ $t(K + 'fee') }}<b>{{ money(m.total_amount, 'brl') }}</b></div>
            <div class="r muted">{{ $t(K + 'regs', { n: m.items_count }, m.items_count) }}</div>
          </div>
        </div>
      </div>
    </div>
    <p class="euc-note">* {{ $t(K + 'partial_note') }}<template v-if="!showFee">{{ ' ' + $t(K + 'fee_brl_note') }}</template></p>
  </div>
</template>

<script>
/**
 * Grouped monthly bars on one money axis: revenue the organization collected
 * from paid registrations vs the eHub fee billed for the same month.
 * Hover (or focus) a month for exact values.
 */
export default {
  name: 'EhubUsageChart',
  props: {
    months: { type: Array, default: () => [] }, // [{ billing_cycle, revenue, total_amount, items_count }]
  },
  data() {
    return { K: 'pages.organization.manage.financeiro.chart.', hover: null, cur: 'brl' };
  },
  computed: {
    // Currencies with revenue in the window; BRL always present (eHub fee currency).
    currencies() {
      const set = new Set(['brl']);
      this.months.forEach((m) => Object.keys(m.revenue || {}).forEach((c) => set.add(c)));
      return [...set];
    },
    // The eHub fee is billed in BRL, so it only shares the BRL axis.
    showFee() { return this.cur === 'brl'; },
    rawMax() {
      return Math.max(1, ...this.months.map((m) => Math.max(this.rev(m), this.showFee ? Number(m.total_amount) || 0 : 0)));
    },
    // Round the axis up to a friendly number: 1, 2 or 5 × 10^n.
    scaleMax() {
      const p = 10 ** Math.floor(Math.log10(this.rawMax));
      return [1, 2, 5, 10].map((f) => f * p).find((v) => v >= this.rawMax);
    },
    ticks() { return [0.5, 1].map((f) => this.scaleMax * f); },
  },
  methods: {
    h(v) {
      const n = Number(v) || 0;
      if (!n) return '0px';
      return `max(3px, ${(n / this.scaleMax) * 100}%)`;
    },
    date(cycle) { const [y, m] = cycle.split('-').map(Number); return new Date(y, m - 1, 1); },
    monthShort(c) { return new Intl.DateTimeFormat(this.$i18n.locale, { month: 'short' }).format(this.date(c)).replace('.', ''); },
    monthLong(c) {
      const s = new Intl.DateTimeFormat(this.$i18n.locale, { month: 'long', year: 'numeric' }).format(this.date(c));
      return s.charAt(0).toUpperCase() + s.slice(1);
    },
    rev(m) { return Number(m.revenue?.[this.cur]) || 0; },
    money(v, c = this.cur) { return new Intl.NumberFormat(this.$i18n.locale, { style: 'currency', currency: c.toUpperCase() }).format(Number(v) || 0); },
    symbol(c) {
      return new Intl.NumberFormat(this.$i18n.locale, { style: 'currency', currency: c.toUpperCase() }).formatToParts(0).find((p) => p.type === 'currency')?.value || c.toUpperCase();
    },
    short(v) { return new Intl.NumberFormat(this.$i18n.locale, { notation: 'compact', maximumFractionDigits: 1 }).format(v); },
  },
};
</script>

<style scoped>
.euc { --c-rev: #0092CF; --c-fee: #B8740A; }
[data-bs-theme="dark"] .euc { --c-rev: #1496CF; --c-fee: #C9820E; }
.euc-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
.euc-legend { display: flex; gap: 16px; font-size: .74rem; color: var(--ehub-muted); }
.euc-cur { display: inline-flex; border: 1px solid var(--ehub-line); border-radius: 8px; overflow: hidden; }
.euc-cur button { border: 0; background: transparent; color: var(--ehub-muted); font-size: .72rem; font-weight: 700; padding: 3px 10px; cursor: pointer; }
.euc-cur button.on { background: var(--ehub-primary-strong); color: #fff; }
.euc-legend span { display: inline-flex; align-items: center; gap: 6px; }
.sw { display: inline-block; width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
.sw.rev { background: var(--c-rev); }
.sw.fee { background: var(--c-fee); }
.euc-plot { position: relative; height: 170px; padding-left: 34px; }
.euc-grid { position: absolute; inset: 0 0 22px 34px; pointer-events: none; border-bottom: 1px solid var(--ehub-line); }
.euc-gl { position: absolute; left: 0; right: 0; border-top: 1px dashed color-mix(in srgb, var(--ehub-line) 80%, transparent); }
.euc-gl span { position: absolute; right: calc(100% + 6px); top: -7px; font-size: .72rem; color: var(--ehub-muted); font-variant-numeric: tabular-nums; }
.euc-cols { position: absolute; inset: 0 0 0 34px; display: flex; }
.euc-col { flex: 1; position: relative; display: flex; flex-direction: column; align-items: center; outline: none; cursor: default; border-radius: 8px; }
.euc-col.on { background: color-mix(in srgb, var(--ehub-field-bg) 70%, transparent); }
.euc-bars { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; gap: 2px; padding-bottom: 0; margin-bottom: 22px; }
.bar { width: min(16px, 28%); border-radius: 4px 4px 0 0; transition: height .25s; }
.bar.rev { background: var(--c-rev); }
.bar.fee { background: var(--c-fee); }
.euc-col.partial .bar { opacity: .55; }
.euc-x { position: absolute; bottom: 2px; font-size: .72rem; color: var(--ehub-muted); text-transform: capitalize; }
.euc-tip { position: absolute; top: 4px; left: calc(50% + 14px); z-index: 5; min-width: 190px; background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 10px; box-shadow: 0 10px 24px rgba(0,0,0,.18); padding: 9px 11px; font-size: .74rem; color: var(--ehub-ink); pointer-events: none; }
.euc-tip.left { left: auto; right: calc(50% + 14px); }
.euc-tip .t { font-weight: 700; margin-bottom: 5px; }
.euc-tip .r { display: flex; align-items: center; gap: 6px; margin-top: 3px; }
.euc-tip .r b { margin-left: auto; font-variant-numeric: tabular-nums; }
.euc-tip .muted { color: var(--ehub-muted); }
.euc-note { font-size: .72rem; color: var(--ehub-muted); margin: 6px 0 0; }
</style>
