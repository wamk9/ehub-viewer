<script setup>
const props = defineProps({
  modelValue: { type: String, default: 'list' },
})
const emit = defineEmits(['update:modelValue', 'close'])

const ICONS = [
  'list', 'user', 'users', 'trophy', 'medal', 'flag-checkered', 'calendar-days', 'clock',
  'location-dot', 'gamepad', 'globe', 'envelope', 'phone', 'id-card', 'star', 'shield-halved',
  'fire', 'bolt', 'gear', 'chart-bar', 'file-lines', 'link', 'image', 'video', 'music',
  'comment', 'heart', 'tag', 'bookmark', 'road', 'hashtag', 'palette',
]

function select(icon) {
  emit('update:modelValue', icon)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="ipm-backdrop" @click.self="$emit('close')">
      <div class="ipm-panel">
        <div class="ipm-header">
          <span class="ipm-title">{{ $t('pages.organization.manage.eventWizard.s4x.chooseIcon') }}</span>
          <button class="ipm-close" @click="$emit('close')"><font-awesome-icon :icon="['fas', 'xmark']" /></button>
        </div>
        <div class="ipm-grid">
          <button
            v-for="icon in ICONS" :key="icon"
            type="button" class="ipm-opt" :class="{ sel: icon === modelValue }"
            @click="select(icon)"
          ><font-awesome-icon :icon="['fas', icon]" /></button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ipm-backdrop { position: fixed; inset: 0; z-index: 9990; background: rgba(0,0,0,.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 16px; }
.ipm-panel { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,.25); padding: 16px; width: 320px; max-width: calc(100vw - 32px); }
.ipm-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.ipm-title { font-size: .82rem; font-weight: 700; color: var(--ehub-ink); }
.ipm-close { width: 26px; height: 26px; border-radius: 7px; border: 1px solid var(--ehub-line); background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: .75rem; color: var(--ehub-muted); }
.ipm-close:hover { background: var(--ehub-field-bg); }
.ipm-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 4px; }
.ipm-opt { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: 0; background: transparent; border-radius: 7px; cursor: pointer; font-size: .95rem; color: var(--ehub-muted); transition: all .1s; }
.ipm-opt:hover { background: var(--ehub-primary-tint); color: var(--ehub-primary); }
.ipm-opt.sel { background: var(--ehub-primary); color: #fff; }
</style>
