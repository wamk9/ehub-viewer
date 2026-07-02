<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  tabs: { type: Array, required: true }, // [{ key, label, icon, count }]
  modelValue: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue'])

const wrapRef = ref(null)
const ghostRef = ref(null)

const isOverflow = ref(false)
const panelOpen = ref(false)

let naturalWidth = 0
let ro = null

onMounted(async () => {
  await nextTick()
  naturalWidth = ghostRef.value?.scrollWidth ?? 0
  checkOverflow()
  ro = new ResizeObserver(checkOverflow)
  if (wrapRef.value) ro.observe(wrapRef.value)
})

onUnmounted(() => ro?.disconnect())

function checkOverflow() {
  if (!wrapRef.value) return
  const available = wrapRef.value.clientWidth
  const overflows = naturalWidth > available
  isOverflow.value = overflows
  if (!overflows) panelOpen.value = false
}

const activeTab = computed(() => props.tabs.find(t => t.key === props.modelValue))

function select(key) {
  emit('update:modelValue', key)
  panelOpen.value = false
}
</script>

<template>
  <div class="ehub-tabs-wrap" ref="wrapRef">

    <!-- Ghost: always rendered, invisible, measures natural content width -->
    <div ref="ghostRef" class="et-ghost" aria-hidden="true">
      <span v-for="tab in tabs" :key="'g-' + tab.key" class="tab-btn">
        <font-awesome-icon v-if="tab.icon" :icon="tab.icon" />
        {{ tab.label }}
        <span v-if="tab.count" class="pill">{{ tab.count }}</span>
      </span>
    </div>

    <!-- Inline tabs (fits on screen) -->
    <div v-if="!isOverflow" class="ehub-tabs">
      <button
        v-for="tab in tabs" :key="tab.key"
        class="tab-btn" :class="{ active: tab.key === modelValue }"
        @click="select(tab.key)"
      >
        <font-awesome-icon v-if="tab.icon" :icon="tab.icon" />
        {{ tab.label }}
        <span v-if="tab.count" class="pill">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Hamburger trigger (content overflows) -->
    <button
      v-if="isOverflow"
      class="et-burger"
      :class="{ active: panelOpen }"
      @click="panelOpen = !panelOpen"
    >
      <font-awesome-icon :icon="['fas', panelOpen ? 'xmark' : 'bars']" />
      <font-awesome-icon v-if="activeTab?.icon" :icon="activeTab.icon" />
      {{ activeTab?.label }}
      <span v-if="activeTab?.count" class="pill">{{ activeTab.count }}</span>
    </button>

    <!-- Panel dropdown (overflow mode only) -->
    <Transition name="et-slide">
      <div v-if="isOverflow && panelOpen" class="et-panel">
        <button
          v-for="tab in tabs" :key="'p-' + tab.key"
          class="et-panel-item" :class="{ active: tab.key === modelValue }"
          @click="select(tab.key)"
        >
          <font-awesome-icon v-if="tab.icon" :icon="tab.icon" />
          {{ tab.label }}
          <span v-if="tab.count" class="pill">{{ tab.count }}</span>
        </button>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.ehub-tabs-wrap { position: relative; }
.et-ghost { position: absolute; visibility: hidden; pointer-events: none; display: flex; gap: 4px; top: 0; left: 0; white-space: nowrap; }

.ehub-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--ehub-line); overflow-x: auto; scrollbar-width: none; }
.ehub-tabs::-webkit-scrollbar { display: none; }
.tab-btn { border: 0; background: transparent; color: var(--ehub-muted); font-size: .95rem; font-weight: 600; padding: 12px 18px; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; display: inline-flex; align-items: center; gap: 8px; transition: color .15s, border-color .15s; white-space: nowrap; }
.tab-btn:hover { color: var(--ehub-ink); }
.tab-btn.active { color: var(--org-accent, var(--ehub-primary)); border-bottom-color: var(--org-accent, var(--ehub-primary)); }
.tab-btn .pill { font-size: .72rem; font-weight: 700; background: var(--ehub-field-bg); color: var(--ehub-muted); padding: 1px 8px; border-radius: 50rem; }
.tab-btn.active .pill { background: color-mix(in srgb, var(--org-accent, var(--ehub-primary)) 14%, transparent); color: var(--org-accent, var(--ehub-primary)); }

.et-burger { display: inline-flex; align-items: center; gap: 10px; width: 100%; border: 1px solid var(--ehub-line); background: var(--ehub-card); color: var(--ehub-ink); font-size: .92rem; font-weight: 600; padding: 11px 16px; border-radius: 10px; cursor: pointer; }
.et-burger.active { border-color: var(--org-accent, var(--ehub-primary)); color: var(--org-accent, var(--ehub-primary)); }
.et-burger .pill { margin-left: auto; font-size: .72rem; font-weight: 700; background: var(--ehub-field-bg); color: var(--ehub-muted); padding: 1px 8px; border-radius: 50rem; }

.et-panel { margin-top: 6px; border: 1px solid var(--ehub-line); border-radius: 10px; background: var(--ehub-card); overflow: hidden; box-shadow: var(--ehub-shadow); }
.et-panel-item { display: flex; align-items: center; gap: 10px; width: 100%; border: 0; background: transparent; color: var(--ehub-muted); font-size: .92rem; font-weight: 600; padding: 12px 16px; cursor: pointer; text-align: left; border-bottom: 1px solid var(--ehub-line); }
.et-panel-item:last-child { border-bottom: 0; }
.et-panel-item:hover { background: var(--ehub-field-bg); color: var(--ehub-ink); }
.et-panel-item.active { color: var(--org-accent, var(--ehub-primary)); }
.et-panel-item .pill { margin-left: auto; font-size: .72rem; font-weight: 700; background: var(--ehub-field-bg); color: var(--ehub-muted); padding: 1px 8px; border-radius: 50rem; }

.et-slide-enter-active, .et-slide-leave-active { transition: opacity .15s ease, transform .15s ease; }
.et-slide-enter-from, .et-slide-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
