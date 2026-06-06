<template>
  <router-link :to="route" class="mobile-nav-item text-decoration-none" :style="hoverVarStyle">
    <font-awesome-icon :icon="icon" class="mobile-nav-icon" />
    <span class="mobile-nav-label">{{ name }}</span>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name:       { type: String,          required: true },
  hoverColor: { type: String,          required: true },
  icon:       { type: [String, Array], required: true },
  route:      { type: String,          default: '#' },
})

const hoverVarStyle = computed(() => ({ '--hover-color': props.hoverColor }))
</script>

<style scoped>
.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0 10px;
  color: #888;
  transition: color 0.2s;
  min-width: 48px;
}

.mobile-nav-item:hover,
.mobile-nav-item.router-link-active {
  color: var(--hover-color);
}

.mobile-nav-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.mobile-nav-label {
  font-size: 10px;
  line-height: 1;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  padding-bottom: 1px;
  transition: border-color 0.2s;
}

.mobile-nav-item.router-link-active .mobile-nav-label {
  border-bottom-color: var(--hover-color);
}
</style>
