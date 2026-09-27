<template>
  <div class="evf">
    <div v-if="showColor" class="evf-field">
      <label class="form-label evf-label">{{ $t('common.visual.color') }}</label>
      <p class="evf-hint">{{ colorHint || $t('common.visual.color_hint') }}</p>
      <EhubColorPicker :model-value="color" @update:model-value="$emit('update:color', $event)" />
    </div>

    <div class="evf-media">
      <div class="evf-field">
        <label class="form-label evf-label">{{ $t('common.visual.logo') }}</label>
        <p class="evf-hint">{{ $t('common.visual.logo_hint') }}</p>
        <EhubProfileImageUpload
          ref="logo"
          type="logo"
          :current-url="logoUrl || null"
          :fallback-style="fallback"
          @change="$emit('logo-change', $event)"
          @remove="$emit('remove-logo')"
        >
          <template #fallback><span class="evf-initials">{{ initials }}</span></template>
        </EhubProfileImageUpload>
      </div>

      <div class="evf-field">
        <label class="form-label evf-label">{{ $t('common.visual.cover') }}</label>
        <p class="evf-hint">{{ $t('common.visual.cover_hint') }}</p>
        <EhubProfileImageUpload
          ref="cover"
          type="cover"
          :current-url="coverUrl || null"
          :fallback-style="fallback"
          @change="$emit('cover-change', $event)"
          @remove="$emit('remove-cover')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import EhubColorPicker from '@/components/inputs/ehub-color-picker.vue';
import EhubProfileImageUpload from '@/components/inputs/EhubProfileImageUpload.vue';

/**
 * Visual identity fields shared by teams, organizations and events:
 * optional color picker + logo + cover (the team settings module).
 * Without images, logo and cover fall back to the color gradient.
 * Emits File objects; call reset() after a successful save.
 */
export default {
  name: 'EhubVisualFields',
  components: { EhubColorPicker, EhubProfileImageUpload },
  props: {
    color: { type: String, default: '#0098D8' },
    showColor: { type: Boolean, default: true },
    colorHint: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    initials: { type: String, default: '?' },
  },
  emits: ['update:color', 'logo-change', 'cover-change', 'remove-logo', 'remove-cover'],
  computed: {
    fallback() {
      const c = /^#[0-9a-f]{6}$/i.test(this.color || '') ? this.color : '#0098D8';
      return { background: `linear-gradient(135deg, ${c}, color-mix(in srgb, ${c}, #000 30%))` };
    },
  },
  methods: {
    reset() {
      this.$refs.logo?.reset();
      this.$refs.cover?.reset();
    },
  },
};
</script>

<style scoped>
.evf-field { margin-bottom: 20px; }
.evf-label { font-size: .85rem; font-weight: 600; color: var(--ehub-ink); margin-bottom: 2px; }
.evf-hint { font-size: .76rem; color: var(--ehub-muted); margin: 0 0 10px; }
.evf-media { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: 20px; }
.evf-initials { color: #fff; font-weight: 800; font-size: 1.1rem; }
@media (max-width: 700px) { .evf-media { grid-template-columns: minmax(0, 1fr); } }
</style>
