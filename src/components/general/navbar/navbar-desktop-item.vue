<template>
  <li class="nav-item me-4 pt-2" :style="hoverVarStyle" :class="{ active: isActive }">
    <router-link :to="route" class="nav-link text-center p-0 text-decoration-none">
      <div class="d-flex align-items-center justify-content-center mx-auto icon-wrap">
        <font-awesome-icon class="nav-icon" :icon="icon" />
      </div>
      <div class="nav-label textColor">{{ name }}</div>
      <div class="active-bar"></div>
    </router-link>
  </li>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  type:          { type: String,          default: '' },
  name:          { type: String,          required: true },
  hoverColor:    { type: String,          required: true },
  icon:          { type: [String, Array], required: true },
  route:         { type: String,          default: '#' },
  dropdownItems: { type: Array,           default: () => [] },
})

const currentRoute = useRoute()
const isActive = computed(() => currentRoute.path === props.route)
const hoverVarStyle = computed(() => ({ '--hover-color': props.hoverColor }))
</script>

<style scoped>
.nav-item { position: relative; }

.nav-link { color: #fafafa; transition: color 0.2s; }
.nav-link:hover, .nav-item.active .nav-link { color: var(--hover-color); }

.icon-wrap { width: 36px; height: 24px; }
.nav-icon  { font-size: 1.2rem; }
.nav-label { font-size: 13px; margin-top: 2px; }

.active-bar {
  display: block;
  margin: 4px auto 0;
  height: 3px;
  width: 0;
  background: transparent;
  transition: width 0.3s ease, background 0.3s ease;
}

.nav-item.active .active-bar,
.nav-item:hover  .active-bar {
  width: 100%;
  background: var(--hover-color);
}
</style>
