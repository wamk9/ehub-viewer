<script setup>
import { useI18n } from 'vue-i18n'
import ehubProfileImage from '@/components/inputs/ehub-profile-image.vue'
import { GRADIENT_SWATCHES } from '@/helpers/General/CategoryConfig.js'

const props = defineProps({
  modelValue: { type: String, default: '' },
  gradientIndex: { type: Number, default: 0 },
  variant: { type: String, default: 'logo' }, // 'logo' | 'cover'
})
const emit = defineEmits(['update:modelValue', 'update:gradientIndex'])

const { t } = useI18n()

function remove() {
  emit('update:modelValue', '')
}

function selectGradient(i) {
  emit('update:gradientIndex', i)
}
</script>

<template>
  <div class="emu-wrap">
    <ehubProfileImage
      :model-value="modelValue"
      @update:model-value="v => emit('update:modelValue', v)"
      :ratio="variant === 'cover' ? '21x9' : '1x1'"
      :round-image="false"
      :button-label="t(`common.mediaUpload.${variant === 'cover' ? 'coverDrop' : 'logoDrop'}`)"
      :drop-label="t(`common.mediaUpload.${variant === 'cover' ? 'coverDrop' : 'logoDrop'}`)"
    />

    <button v-if="modelValue" type="button" class="emu-remove-btn" @click="remove">
      <font-awesome-icon :icon="['fas', 'xmark']" class="me-1" />{{ t('common.mediaUpload.remove') }}
    </button>

    <p class="emu-hint">{{ t(`common.mediaUpload.${variant === 'cover' ? 'coverHint' : 'logoHint'}`) }}</p>

    <div v-if="variant === 'cover' && !modelValue" class="emu-swatch-row">
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
.emu-remove-btn { display: inline-flex; align-items: center; margin-top: 6px; padding: 5px 13px; border-radius: 50rem; border: 1px solid color-mix(in srgb, #e23b3b 30%, transparent); background: transparent; color: #e23b3b; font-size: .78rem; font-weight: 600; cursor: pointer; }
.emu-remove-btn:hover { background: color-mix(in srgb, #e23b3b 10%, transparent); }
.emu-hint { font-size: .78rem; color: var(--ehub-muted); margin: 6px 0 8px; }
.emu-swatch-row { display: flex; gap: 7px; flex-wrap: wrap; }
.emu-grad-sw { width: 32px; height: 32px; border-radius: 8px; cursor: pointer; border: 2px solid transparent; transition: transform .12s, box-shadow .12s; flex-shrink: 0; }
.emu-grad-sw:hover { transform: scale(1.1); }
.emu-grad-sw.sel { border-color: var(--ehub-ink); box-shadow: 0 0 0 2px var(--ehub-card), 0 0 0 4px var(--ehub-ink); transform: scale(1.06); }
</style>
