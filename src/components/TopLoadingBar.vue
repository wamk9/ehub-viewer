<template>
  <Transition name="topbar">
    <div v-if="active" class="top-loading-bar"></div>
  </Transition>
</template>

<script setup>
defineProps({ active: Boolean })
</script>

<style scoped>
.top-loading-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 3px;
  z-index: 99999;
  background: var(--ehub-primary);
  overflow: hidden;
}
.top-loading-bar::after {
  content: '';
  position: absolute;
  top: 0; height: 100%;
  width: 35%; left: -35%;
  background: rgba(255, 255, 255, 0.55);
  animation: bar-slide 1.4s ease-in-out infinite;
}
@keyframes bar-slide {
  0%   { left: -35% }
  100% { left: 135% }
}
.topbar-enter-active { transition: opacity .15s ease; }
.topbar-leave-active { transition: opacity .4s ease .1s; }
.topbar-enter-from, .topbar-leave-to { opacity: 0; }
</style>
