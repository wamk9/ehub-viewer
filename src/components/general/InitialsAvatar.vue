<template>
  <div class="initials-avatar" :style="wrapperStyle" :title="name">
    <img
      v-if="resolvedSrc && !imgError"
      :src="resolvedSrc"
      @error="imgError = true"
      class="avatar-img"
      :alt="name"
    />
    <span v-else class="avatar-initials" :style="textStyle">{{ computedInitials }}</span>
  </div>
</template>

<script>
import SystemVars from '@/helpers/General/SystemVars';

const BG = { user: '#6195f5', org: '#0098D8', event: '#FBBF11' };
const FG = { user: '#ffffff', org: '#ffffff', event: '#1a1a1a' };

export default {
  props: {
    name:    { type: String,  default: '' },
    image:   { type: String,  default: '' },
    type:    { type: String,  default: 'user' },
    size:    { type: Number,  default: 40 },
    rounded: { type: Boolean, default: true },
  },
  data() {
    return { imgError: false };
  },
  watch: {
    image() { this.imgError = false; },
  },
  computed: {
    resolvedSrc() {
      if (!this.image) return '';
      if (this.image.startsWith('data:') || this.image.startsWith('http')) return this.image;
      return SystemVars.baseUrl + 'storage/' + this.image;
    },
    computedInitials() {
      const parts = this.name.trim().split(/\s+/).filter(Boolean);
      if (!parts.length) return '?';
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    },
    wrapperStyle() {
      return {
        width: `${this.size}px`,
        height: `${this.size}px`,
        borderRadius: this.rounded ? '50%' : '8px',
        backgroundColor: BG[this.type] ?? '#6195f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: '0',
      };
    },
    textStyle() {
      return {
        color: FG[this.type] ?? '#ffffff',
        fontSize: `${Math.max(10, Math.floor(this.size * 0.38))}px`,
        fontWeight: '600',
        lineHeight: '1',
        userSelect: 'none',
        pointerEvents: 'none',
      };
    },
  },
};
</script>

<style scoped>
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
