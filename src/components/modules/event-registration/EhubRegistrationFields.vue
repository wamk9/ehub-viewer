<template>
  <div class="erf">
    <div v-for="field in fields" :key="field.name" class="erf-field">
      <template v-if="isCheck(field)">
        <label class="erf-check" :class="{ invalid: errors[field.name] }">
          <input type="checkbox" class="form-check-input" :checked="!!modelValue[field.name]" @change="set(field, $event.target.checked)" />
          <span>{{ field.label || $t('common.regForm.untitled') }}<span v-if="field.required" class="erf-req">*</span></span>
        </label>
      </template>
      <template v-else>
        <label class="erf-label">
          <font-awesome-icon v-if="field.icon" :icon="['fas', field.icon]" class="erf-ico" />
          {{ field.label || $t('common.regForm.untitled') }}<span v-if="field.required" class="erf-req">*</span>
        </label>
        <select v-if="field.type === 'select'" class="form-select form-select-sm erf-input" :class="{ 'is-invalid': errors[field.name] }"
          :value="modelValue[field.name] ?? ''" @change="set(field, $event.target.value)">
          <option value="">{{ $t('common.regForm.choose') }}</option>
          <option v-for="opt in field.values || []" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <div v-else-if="field.type === 'color' && field.values?.length" class="erf-swatches">
          <button v-for="c in field.values" :key="c" type="button" class="erf-swatch" :class="{ sel: modelValue[field.name] === c }"
            :style="{ background: c }" :title="c" @click="set(field, c)" />
        </div>
        <input v-else class="form-control form-control-sm erf-input" :class="{ 'is-invalid': errors[field.name], 'erf-color': field.type === 'color' }"
          :type="inputType(field)" :min="field.min ?? undefined" :max="field.max ?? undefined"
          :placeholder="field.placeholder || ''" :value="modelValue[field.name] ?? ''" @input="set(field, $event.target.value)" />
      </template>
      <div v-if="field.help" class="erf-help">{{ field.help }}</div>
      <div v-if="errors[field.name]" class="erf-err">{{ $t('common.regForm.required') }}</div>
    </div>
  </div>
</template>

<script>
/**
 * Renders an event registration_form_template as inputs.
 * Used by the public registration modal and by the wizard live preview.
 */
export default {
  name: 'EhubRegistrationFields',
  props: {
    fields: { type: Array, default: () => [] },
    modelValue: { type: Object, default: () => ({}) },
    errors: { type: Object, default: () => ({}) },
  },
  emits: ['update:modelValue'],
  methods: {
    isCheck(f) { return f.type === 'checkbox' || f.type === 'switch'; },
    inputType(f) {
      return { number: 'number', date: 'date', url: 'url', color: 'color' }[f.type] || 'text';
    },
    set(field, value) {
      this.$emit('update:modelValue', { ...this.modelValue, [field.name]: value });
    },
  },
};
</script>

<style scoped>
.erf-field { margin-bottom: 14px; }
.erf-field:last-child { margin-bottom: 0; }
.erf-label { display: flex; align-items: center; gap: 6px; font-size: .8rem; font-weight: 600; color: var(--ehub-ink); margin-bottom: .3rem; }
.erf-ico { color: var(--org-accent, var(--ehub-primary)); font-size: .78rem; }
.erf-req { color: #e23b3b; margin-left: 3px; }
.erf-input { background: var(--ehub-field-bg); border-color: var(--ehub-line); color: var(--ehub-ink); border-radius: 7px; }
.erf-input:focus { background: var(--ehub-field-bg); border-color: var(--org-accent, var(--ehub-primary)); box-shadow: none; color: var(--ehub-ink); }
.erf-color { width: 64px; height: 34px; padding: 3px; }
.erf-check { display: flex; align-items: flex-start; gap: 8px; font-size: .84rem; color: var(--ehub-ink); cursor: pointer; }
.erf-check .form-check-input { margin-top: 2px; flex-shrink: 0; }
.erf-check.invalid .form-check-input { border-color: #e23b3b; }
.erf-swatches { display: flex; flex-wrap: wrap; gap: 6px; }
.erf-swatch { width: 28px; height: 28px; border-radius: 8px; border: 2px solid var(--ehub-line); cursor: pointer; padding: 0; }
.erf-swatch.sel { border-color: var(--ehub-ink); box-shadow: 0 0 0 2px var(--ehub-card) inset; }
.erf-help { font-size: .72rem; color: var(--ehub-muted); margin-top: 3px; }
.erf-err { font-size: .72rem; color: #e23b3b; margin-top: 3px; }
</style>
