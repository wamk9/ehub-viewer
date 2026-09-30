<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// "Add field" button with a dropdown: blank field first, then ready-made suggestions.
defineProps({
  label: { type: String, required: true },
  blankLabel: { type: String, required: true },
  suggestionsLabel: { type: String, default: '' },
  // [{ key, icon, label }]
  suggestions: { type: Array, default: () => [] },
  primary: { type: Boolean, default: false },
})
const emit = defineEmits(['add'])

const open = ref(false)
const root = ref(null)
function pick(s) { open.value = false; emit('add', s) }
function onDoc(e) { if (root.value && !root.value.contains(e.target)) open.value = false }
function onKey(e) { if (e.key === 'Escape') open.value = false }
onMounted(() => { document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey) })
onBeforeUnmount(() => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) })
</script>

<template>
  <div ref="root" class="afm">
    <button type="button" class="btn btn-sm round px-3" :class="primary ? 'btn-primary' : 'btn-outline-secondary'" @click="open = !open">
      <font-awesome-icon :icon="['fas', 'plus']" class="me-1" />{{ label }}
      <font-awesome-icon :icon="['fas', 'chevron-down']" class="afm-caret" />
    </button>
    <div v-if="open" class="afm-menu">
      <button type="button" class="afm-item" @click="pick(null)">
        <font-awesome-icon :icon="['fas', 'pen']" />{{ blankLabel }}
      </button>
      <template v-if="suggestions.length">
        <div class="afm-sep">{{ suggestionsLabel }}</div>
        <button v-for="s in suggestions" :key="s.key" type="button" class="afm-item" @click="pick(s)">
          <font-awesome-icon :icon="['fas', s.icon]" />{{ s.label }}
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.afm { position: relative; display: inline-block; }
.afm-caret { font-size: .72rem; margin-left: 8px; opacity: .7; }
.afm-menu { position: absolute; top: calc(100% + 6px); left: 0; z-index: 30; min-width: 230px; max-height: 300px; overflow-y: auto; background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 12px; box-shadow: 0 12px 30px rgba(0,0,0,.25); padding: 6px; }
.afm-item { display: flex; align-items: center; gap: 10px; width: 100%; border: 0; background: transparent; color: var(--ehub-ink); font-size: .82rem; font-weight: 500; text-align: left; padding: 7px 10px; border-radius: 8px; cursor: pointer; }
.afm-item svg { width: 14px; color: var(--ehub-primary-text); font-size: .78rem; }
.afm-item:hover { background: var(--ehub-primary-tint); }
.afm-sep { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--ehub-muted); padding: 8px 10px 4px; border-top: 1px solid var(--ehub-line); margin-top: 4px; }
</style>
