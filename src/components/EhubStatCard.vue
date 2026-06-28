<template>
  <div class="stat-card">
    <div class="sc-row">
      <div class="sc-ico" :class="iconClass" :style="iconStyle">
        <font-awesome-icon :icon="icon" />
      </div>
      <span v-if="delta !== undefined" class="sc-delta" :class="deltaClass">
        <font-awesome-icon v-if="deltaIcon" :icon="deltaIcon" />
        {{ delta }}
      </span>
    </div>
    <div class="sc-val" :style="valueStyle">{{ value }}</div>
    <div class="sc-lbl">{{ label }}</div>
  </div>
</template>

<script>
export default {
  name: 'EhubStatCard',
  props: {
    icon: { type: [String, Array], required: true },
    iconBg: String,
    iconColor: String,
    iconClass: String,
    value: { required: true },
    label: { type: String, required: true },
    valueStyle: Object,
    delta: String,
    deltaIcon: [String, Array],
    deltaClass: String,
  },
  computed: {
    iconStyle() {
      const s = {}
      if (this.iconBg) s.background = this.iconBg
      if (this.iconColor) s.color = this.iconColor
      return s
    },
  },
}
</script>

<style scoped>
.stat-card { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 13px; padding: 17px 19px; }
.sc-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 11px; }
.sc-ico { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: .82rem; }
.sc-ico.primary { background: var(--ehub-primary-tint); color: var(--ehub-primary); }
.sc-ico.gold { background: color-mix(in srgb, var(--ehub-gold) 18%, transparent); color: color-mix(in srgb, var(--ehub-gold), #000 28%); }
.sc-ico.purple { background: color-mix(in srgb, #7C3AED 14%, transparent); color: #7C3AED; }
.sc-ico.green { background: color-mix(in srgb, #1f8a5b 14%, transparent); color: #1f8a5b; }
.sc-delta { font-size: .72rem; font-weight: 700; color: var(--ehub-muted); display: flex; align-items: center; gap: 3px; }
.sc-delta.up { color: #1f8a5b; }
.sc-val { font-size: 1.75rem; font-weight: 800; color: var(--ehub-ink); letter-spacing: -.03em; line-height: 1; }
.sc-lbl { font-size: .72rem; color: var(--ehub-muted); margin-top: 3px; font-weight: 500; }
</style>
