<template>
  <div class="epe">
    <div v-if="modelValue.length" class="epe-cols" :class="{ cash: hasCash }">
      <span>{{ $t('common.prizes.who') }}</span>
      <span v-if="hasCash">{{ $t('common.prizes.cash') }}</span>
      <span>{{ $t('common.prizes.product') }}</span>
      <span></span>
    </div>

    <div v-for="(p, i) in modelValue" :key="i" class="epe-row" :class="{ cash: hasCash }">
      <input type="text" class="form-control epe-ctl" :value="p.label" maxlength="80"
        :placeholder="$t('common.prizes.whoPh')" @input="set(i, 'label', $event.target.value)" />
      <div v-if="hasCash" class="epe-cash">
        <div class="input-group">
          <input type="number" class="form-control epe-ctl" min="0" :max="available(i)" step="0.5" :value="p.percent ?? ''"
            placeholder="0" @input="setPercent(i, $event)" />
          <span class="input-group-text">%</span>
        </div>
        <span class="epe-amt">{{ money(total * (Number(p.percent) || 0) / 100) }}</span>
      </div>
      <input type="text" class="form-control epe-ctl" :value="p.product" maxlength="160"
        :placeholder="$t('common.prizes.productPh')" @input="set(i, 'product', $event.target.value)" />
      <button type="button" class="epe-del" :title="$t('common.prizes.remove')" @click="remove(i)">
        <font-awesome-icon :icon="['fas', 'trash']" />
      </button>
    </div>

    <p v-if="!modelValue.length" class="epe-empty">{{ $t('common.prizes.empty') }}</p>

    <div class="epe-foot">
      <button type="button" class="btn btn-sm btn-outline-secondary round px-3" :disabled="modelValue.length >= 20" @click="add">
        <font-awesome-icon :icon="['fas', 'plus']" class="me-1" />{{ $t('common.prizes.add') }}
      </button>
      <span v-if="hasCash && modelValue.length" class="epe-sum" :class="{ bad: sum > 100, ok: sum === 100 }">
        {{ sum > 100 ? $t('common.prizes.over', { n: sum }) : $t('common.prizes.sum', { n: sum, left: money(total * (100 - sum) / 100) }) }}
      </span>
    </div>
  </div>
</template>

<script>
import { percentSum } from './prizes.js';


/**
 * Who gets what: one row per place (or special award) with an optional share
 * of the cash prize pool and an optional product. Used by the event wizard
 * and by the Finance panel of event management.
 */
export default {
  name: 'EhubPrizeEditor',
  props: {
    modelValue: { type: Array, default: () => [] },
    total: { type: Number, default: 0 },
    currency: { type: String, default: 'BRL' },
  },
  emits: ['update:modelValue'],
  computed: {
    hasCash() { return this.total > 0; },
    sum() { return Math.round(percentSum(this.modelValue) * 100) / 100; },
  },
  methods: {
    money(v) {
      try {
        return new Intl.NumberFormat(this.$i18n.locale, { style: 'currency', currency: (this.currency || 'BRL').toUpperCase() }).format(v || 0);
      } catch { return String(v || 0); }
    },
    emitList(list) { this.$emit('update:modelValue', list); },
    set(i, key, value) {
      const list = this.modelValue.map((p) => ({ ...p }));
      list[i][key] = value;
      this.emitList(list);
    },
    // Share still free for row i: the whole list never exceeds 100% of the pool.
    available(i) {
      const others = this.modelValue.reduce((s, p, j) => s + (j === i ? 0 : Number(p.percent) || 0), 0);
      return Math.max(0, Math.round((100 - others) * 100) / 100);
    },
    setPercent(i, e) {
      if (e.target.value === '') { this.set(i, 'percent', null); return; }
      const v = Math.min(Math.max(Number(e.target.value) || 0, 0), this.available(i));
      if (String(v) !== e.target.value) e.target.value = v;
      this.set(i, 'percent', v);
    },
    add() { this.emitList([...this.modelValue, { label: '', percent: null, product: '' }]); },
    remove(i) { this.emitList(this.modelValue.filter((_, j) => j !== i)); },
  },
};
</script>

<style scoped>
.epe-cols, .epe-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) 38px; gap: 8px; align-items: center; }
.epe-cols.cash, .epe-row.cash { grid-template-columns: minmax(0, 1fr) 280px minmax(0, 1.3fr) 38px; }
.epe-cols { font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--ehub-muted); margin-bottom: 5px; }
.epe-row { margin-bottom: 8px; }
.epe-ctl { height: 38px; font-size: .85rem; }
.epe-cash { display: flex; align-items: center; gap: 8px; }
.epe-cash .input-group { width: 150px; flex-shrink: 0; flex-wrap: nowrap; }
.epe-cash .input-group .form-control { min-width: 0; padding: 0 8px; }
.epe-cash .input-group-text { font-size: .8rem; }
.epe-amt { font-size: .8rem; font-weight: 700; color: var(--ehub-ink); font-variant-numeric: tabular-nums; white-space: nowrap; }
.epe-del { width: 38px; height: 38px; border-radius: 8px; border: 1px solid color-mix(in srgb,#e23b3b 30%,transparent); background: color-mix(in srgb,#e23b3b 6%,transparent); color: #e23b3b; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: .85rem; }
.epe-del:hover { background: color-mix(in srgb,#e23b3b 14%,transparent); }
.epe-empty { font-size: .8rem; color: var(--ehub-muted); margin: 0 0 10px; }
.epe-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-top: 4px; }
.epe-sum { font-size: .76rem; color: var(--ehub-muted); font-weight: 600; }
.epe-sum.ok { color: #2f9e44; }
.epe-sum.bad { color: #e23b3b; }
@media (max-width: 640px) {
  .epe-cols { display: none; }
  .epe-row, .epe-row.cash { grid-template-columns: minmax(0, 1fr) 38px; padding-bottom: 8px; border-bottom: 1px solid var(--ehub-line); }
  .epe-row > :not(.epe-del) { grid-column: 1; }
  .epe-row > .epe-del { grid-column: 2; grid-row: 1; }
}
</style>
