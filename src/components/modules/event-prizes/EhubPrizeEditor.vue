<template>
  <div class="epe">
    <div v-if="modelValue.length" class="epe-cols" :class="{ cash: hasCash }">
      <span></span>
      <span>{{ $t('common.prizes.who') }}</span>
      <span v-if="hasCash">{{ $t('common.prizes.cash') }}</span>
      <span>{{ $t('common.prizes.product') }}</span>
      <span></span>
    </div>

    <div v-for="(p, i) in modelValue" :key="i" class="epe-row" :class="{ cash: hasCash }">
      <span class="epe-medal" :style="{ background: medal(i) }">{{ i + 1 }}</span>
      <input type="text" class="form-control epe-ctl" :value="p.label" maxlength="80"
        :placeholder="$t('common.prizes.place', { n: i + 1 })" @input="set(i, 'label', $event.target.value)" />
      <div v-if="hasCash" class="epe-cash">
        <div class="input-group">
          <input type="number" class="form-control epe-ctl" min="0" max="100" step="0.5" :value="p.percent ?? ''"
            placeholder="0" @input="set(i, 'percent', $event.target.value === '' ? null : Number($event.target.value))" />
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

const MEDALS = ['#d4a20f', '#8d99a6', '#b06a3b'];

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
    medal(i) { return MEDALS[i] || 'var(--ehub-muted)'; },
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
    add() { this.emitList([...this.modelValue, { label: '', percent: null, product: '' }]); },
    remove(i) { this.emitList(this.modelValue.filter((_, j) => j !== i)); },
  },
};
</script>

<style scoped>
.epe-cols, .epe-row { display: grid; grid-template-columns: 30px minmax(0, 1fr) minmax(0, 1.4fr) 38px; gap: 8px; align-items: center; }
.epe-cols.cash, .epe-row.cash { grid-template-columns: 30px minmax(0, 1fr) 220px minmax(0, 1.4fr) 38px; }
.epe-cols { font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--ehub-muted); margin-bottom: 5px; }
.epe-row { margin-bottom: 8px; }
.epe-medal { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .72rem; font-weight: 800; color: #fff; }
.epe-ctl { height: 38px; font-size: .85rem; }
.epe-cash { display: flex; align-items: center; gap: 8px; }
.epe-cash .input-group { width: 112px; flex-shrink: 0; flex-wrap: nowrap; }
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
  .epe-row, .epe-row.cash { grid-template-columns: 30px minmax(0, 1fr) 38px; padding-bottom: 8px; border-bottom: 1px solid var(--ehub-line); }
  .epe-row > :nth-child(2) { grid-column: 2; }
  .epe-row > .epe-cash, .epe-row > input:nth-of-type(2), .epe-row.cash > input:last-of-type { grid-column: 2; }
  .epe-row > .epe-del { grid-column: 3; grid-row: 1; }
}
</style>
