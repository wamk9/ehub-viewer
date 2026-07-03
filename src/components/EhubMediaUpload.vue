<script setup>
import { computed } from 'vue'
import EhubProfileImageUpload from '@/components/inputs/EhubProfileImageUpload.vue'
import { GRADIENT_SWATCHES, gradientByIndex } from '@/helpers/General/CategoryConfig.js'

const props = defineProps({
  modelValue: { type: String, default: '' }, // new base64 selection, empty if unchanged/none
  existingUrl: { type: String, default: '' }, // already-persisted image URL (edit mode)
  gradientIndex: { type: Number, default: 0 },
  variant: { type: String, default: 'logo' }, // 'logo' | 'cover'
})
const emit = defineEmits(['update:modelValue', 'update:existingUrl', 'update:gradientIndex'])

function onChange(file) {
  if (!file) { emit('update:modelValue', ''); return }
  const reader = new FileReader()
  reader.onload = e => emit('update:modelValue', e.target.result)
  reader.readAsDataURL(file)
}

function onRemove() {
  emit('update:modelValue', '')
  emit('update:existingUrl', '')
}

function selectGradient(i) {
  emit('update:gradientIndex', i)
}

const fallbackStyle = computed(() => props.variant === 'cover'
  ? { background: gradientByIndex(props.gradientIndex) }
  : {})

const currentUrl = computed(() => props.modelValue || props.existingUrl)
</script>

<template>
  <div class="emu-wrap">
    <EhubProfileImageUpload
      :type="variant"
      :current-url="currentUrl"
      :fallback-style="fallbackStyle"
      @change="onChange"
      @remove="onRemove"
    >
      <template v-if="variant === 'cover'" #fallback>
        <font-awesome-icon :icon="['fas', 'cloud-arrow-up']" style="color:#fff" />
      </template>
    </EhubProfileImageUpload>

    <div v-if="variant === 'cover' && !currentUrl" class="emu-swatch-row">
      <button
        v-for="(g, i) in GRADIENT_SWATCHES" :key="i"
        type="button" class="emu-grad-sw" :class="{ sel: i === gradientIndex }"
        :style="{ background: `linear-gradient(135deg, ${g[0]}, ${g[1]})` }"
        @click="selectGradient(i)"
      ></button>
    </div>
  </div>
</template>

<style scoped>
.emu-wrap { width: 100%; }
.emu-swatch-row { display: flex; gap: 7px; flex-wrap: wrap; margin-top: 8px; }
.emu-grad-sw { width: 32px; height: 32px; border-radius: 8px; cursor: pointer; border: 2px solid transparent; transition: transform .12s, box-shadow .12s; flex-shrink: 0; }
.emu-grad-sw:hover { transform: scale(1.1); }
.emu-grad-sw.sel { border-color: var(--ehub-ink); box-shadow: 0 0 0 2px var(--ehub-card), 0 0 0 4px var(--ehub-ink); transform: scale(1.06); }
</style>
