<template>
  <div class="mgmt-wrap ehub-mgmt">
    <aside class="mgmt-sidebar">
      <div class="sb-org">
        <template v-if="!loading">
          <div class="sb-logo" :style="{ background: logoBg }">
            <img v-if="logoUrl && !logoError" :src="logoUrl" :alt="name" @error="logoError = true" />
            <span v-else>{{ initials }}</span>
          </div>
          <div style="min-width:0">
            <div class="sb-name">{{ name }}</div>
            <div class="sb-cat">{{ subtitle }}</div>
          </div>
        </template>
        <template v-else>
          <div class="sb-logo sb-skel"></div>
          <div style="flex:1;min-width:0">
            <div class="sb-skel" style="height:12px;border-radius:4px;width:75%;margin-bottom:6px"></div>
            <div class="sb-skel" style="height:10px;border-radius:4px;width:45%"></div>
          </div>
        </template>
      </div>

      <button class="mob-menu-toggle" @click="mobileOpen = !mobileOpen">
        <font-awesome-icon :icon="iconOf(current?.icon || 'bars')" style="width:15px;flex-shrink:0" />
        <span>{{ current?.label }}</span>
        <font-awesome-icon :icon="['fas', 'chevron-down']" class="mob-chevron" :class="{ open: mobileOpen }" />
      </button>

      <nav class="sb-nav" :class="{ 'mob-open': mobileOpen }">
        <template v-for="(item, i) in items" :key="item.key || 'div-' + i">
          <div v-if="item.divider" class="nav-div"></div>
          <button v-else class="nav-item" :class="{ active: item.key === active }" @click="select(item.key)">
            <font-awesome-icon :icon="iconOf(item.icon)" />
            <span>{{ item.label }}</span>
            <span v-if="item.badge" class="nav-badge" :class="item.badgeClass">{{ item.badge }}</span>
            <span v-if="item.live" class="nav-live"></span>
          </button>
        </template>
        <template v-if="links.length">
          <div class="nav-div"></div>
          <router-link v-for="l in links" :key="l.label" :to="l.to" class="nav-item" @click="mobileOpen = false">
            <font-awesome-icon :icon="iconOf(l.icon)" />
            <span>{{ l.label }}</span>
          </router-link>
        </template>
      </nav>
    </aside>
    <div v-if="mobileOpen" class="mob-nav-backdrop" @click="mobileOpen = false"></div>

    <main class="mgmt-main">
      <slot />
    </main>
  </div>
</template>

<script>
import '@/assets/ehub-mgmt.css';

/**
 * Shared shell for management screens (organization, team, event):
 * sidebar with identity + nav (collapses into a dropdown on mobile) and the main area.
 *
 * items: [{ key, icon, label, badge?, badgeClass?, live? } | { divider: true }]
 * links: [{ to, icon, label }] — rendered after a divider (public page, back, ...)
 */
export default {
  name: 'EhubMgmtLayout',
  props: {
    name: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    initials: { type: String, default: '?' },
    logoBg: { type: String, default: 'var(--ehub-primary)' },
    loading: { type: Boolean, default: false },
    items: { type: Array, required: true },
    active: { type: String, default: '' },
    links: { type: Array, default: () => [] },
  },
  emits: ['select'],
  data() {
    return { mobileOpen: false, logoError: false };
  },
  computed: {
    current() {
      return this.items.find((i) => i.key === this.active);
    },
  },
  watch: {
    logoUrl() { this.logoError = false; },
  },
  methods: {
    iconOf(icon) {
      return Array.isArray(icon) ? icon : ['fas', icon];
    },
    select(key) {
      this.mobileOpen = false;
      this.$emit('select', key);
    },
  },
};
</script>
