<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const wrapRef  = ref(null)
const ghostRef = ref(null)

const isOverflow = ref(false)
const panelOpen  = ref(false)

let ro = null

onMounted(async () => {
  await nextTick()
  checkOverflow()
  ro = new ResizeObserver(checkOverflow)
  if (wrapRef.value) ro.observe(wrapRef.value)
})

onUnmounted(() => ro?.disconnect())

function checkOverflow() {
  if (!wrapRef.value) return
  const naturalWidth = ghostRef.value?.scrollWidth ?? 0
  const available = wrapRef.value.clientWidth
  const overflows = naturalWidth > available
  isOverflow.value = overflows
  if (!overflows) panelOpen.value = false
}
</script>

<template>
  <div class="ehub-filter-bar" :class="{ 'efb-responsive': isOverflow }">
    <div class="container-fluid px-4">

      <!-- Ghost: always rendered, invisible, measures natural content width -->
      <div ref="ghostRef" class="efb-ghost" aria-hidden="true">
        <slot name="filters" />
      </div>

      <div ref="wrapRef" class="ehub-filter-wrap">
        <!-- Inline scrollable row (fits on screen) -->
        <div v-if="!isOverflow" class="ehub-filter-inner">
          <slot name="filters" />
        </div>
      </div>

    </div>

    <!-- Hamburger trigger (content overflows) -->
    <button
      v-if="isOverflow"
      class="efb-burger"
      :class="{ active: panelOpen }"
      @click="panelOpen = !panelOpen"
    >
      <div class="container-fluid px-4 efb-burger-inner">
        <font-awesome-icon :icon="['fas', panelOpen ? 'xmark' : 'sliders']" />
        {{ $t('common.ui.filters') }}
      </div>
    </button>

    <!-- Panel dropdown (overflow mode only) -->
    <Transition name="efb-slide">
      <div v-if="isOverflow && panelOpen" class="efb-panel">
        <div class="container-fluid px-4">
          <slot name="filters" />
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.efb-slide-enter-active,
.efb-slide-leave-active { transition: opacity .15s ease, transform .15s ease; }
.efb-slide-enter-from,
.efb-slide-leave-to { opacity: 0; transform: translateY(-6px); }

.efb-responsive { padding: 8px 0; }
.efb-burger { display: flex; width: 100%; padding: 0; }
.efb-burger-inner { display: flex; align-items: center; gap: 7px; }
.efb-panel .container-fluid { display: flex; flex-wrap: wrap; gap: 6px; }
</style>
