<template>
  <div class="epl">
    <div v-if="total > 0" class="epl-total">
      <font-awesome-icon :icon="['fas', 'trophy']" />
      <span class="lbl">{{ $t('common.prizes.total') }}</span>
      <span class="v">{{ money(total) }}</span>
    </div>
    <div v-for="(p, i) in prizes" :key="i" class="epl-row">
      <span class="epl-medal" :class="{ light: i < 2 }" :style="{ background: medal(i) }">{{ i + 1 }}</span>
      <span class="epl-who">{{ p.label || $t('common.prizes.place', { n: i + 1 }) }}</span>
      <span class="epl-what">
        <span v-if="total > 0 && p.percent" class="epl-cash">{{ money(total * p.percent / 100) }}</span>
        <span v-if="p.product" class="epl-product"><font-awesome-icon :icon="['fas', 'gift']" />{{ p.product }}</span>
      </span>
    </div>
  </div>
</template>

<script>
const MEDALS = ['#d4a20f', '#aeb7c2', '#9a5a30'];

/** Read-only prize distribution for the public event page. */
export default {
  name: 'EhubPrizeList',
  props: {
    prizes: { type: Array, default: () => [] },
    total: { type: Number, default: 0 },
    currency: { type: String, default: 'BRL' },
  },
  methods: {
    medal(i) { return MEDALS[i] || 'var(--ehub-muted)'; },
    money(v) {
      try {
        return new Intl.NumberFormat(this.$i18n.locale, { style: 'currency', currency: (this.currency || 'BRL').toUpperCase() }).format(v || 0);
      } catch { return String(v || 0); }
    },
  },
};
</script>

<style scoped>
.epl { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 12px; overflow: hidden; }
.epl-total { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: color-mix(in srgb, var(--ehub-gold, #d4a20f) 10%, transparent); border-bottom: 1px solid var(--ehub-line); }
.epl-total svg { color: var(--ehub-gold, #d4a20f); }
.epl-total .lbl { flex: 1; font-size: .8rem; font-weight: 700; color: var(--ehub-ink); }
.epl-total .v { font-size: 1.05rem; font-weight: 800; color: var(--ehub-ink); font-variant-numeric: tabular-nums; }
.epl-row { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-bottom: 1px solid var(--ehub-line); }
.epl-row:last-child { border-bottom: 0; }
.epl-medal { width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .75rem; font-weight: 800; color: #fff; flex-shrink: 0; }
/* Gold and silver are light: a dark numeral keeps them readable. */
.epl-medal.light { color: #1f2530; }
.epl-who { flex: 1; font-size: .86rem; font-weight: 600; color: var(--ehub-ink); min-width: 0; }
.epl-what { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; text-align: right; }
.epl-cash { font-weight: 800; color: var(--ehub-ink); font-variant-numeric: tabular-nums; }
.epl-product { display: inline-flex; align-items: center; gap: 6px; font-size: .8rem; color: var(--ehub-muted); }
.epl-product svg { color: var(--org-accent, var(--ehub-primary)); }
</style>
