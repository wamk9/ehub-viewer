<template>
  <div class="mb-3">
    <label v-if="label" class="form-label">{{ label }}</label>
    <div class="input-group">
      <select v-model="countryCode" class="form-select phone-code-select">
        <option v-for="c in countryCodes" :key="c.code" :value="c.code">
          {{ c.flag }} {{ c.code }}
        </option>
      </select>
      <input
        v-model="phoneNumber"
        type="tel"
        class="form-control"
        :placeholder="placeholder"
        @input="onPhoneInput"
        maxlength="15"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import countryCodes from '@/helpers/data/country-codes'

const props = defineProps({
  modelValue:  { type: String, default: '' },
  label:       { type: String, default: '' },
  placeholder: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const countryCode = ref('+55')
const phoneNumber = ref('')

function onPhoneInput(e) {
  const digits = e.target.value.replace(/\D/g, '').slice(0, 15)
  phoneNumber.value = digits
  e.target.value = digits
}

watch([countryCode, phoneNumber], () => {
  emit('update:modelValue', countryCode.value + phoneNumber.value)
})
</script>

<style scoped>
.phone-code-select { max-width: 110px; }
</style>
