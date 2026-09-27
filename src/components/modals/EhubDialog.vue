<template>
  <Teleport to="body">
    <div v-if="modelValue" class="ehub-dialog-overlay" @click.self="close">
      <div class="ehub-dialog ehub-mgmt-modal" :class="'ehub-dialog--' + size" role="dialog" aria-modal="true">
        <div class="ehub-dialog__hd">
          <h5>{{ title }}</h5>
          <button type="button" class="btn-close" :aria-label="$t('common.ui.close')" @click="close"></button>
        </div>
        <div class="ehub-dialog__bd">
          <slot />
        </div>
        <div v-if="$slots.footer" class="ehub-dialog__ft">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
/**
 * Lightweight modal: v-model controls visibility, default slot is the body,
 * #footer slot holds the action buttons. Closes on backdrop click and Esc.
 */
export default {
  name: 'EhubDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: '' },
    size: { type: String, default: 'md' }, // sm | md | lg
  },
  emits: ['update:modelValue', 'close'],
  watch: {
    modelValue(open) {
      if (open) document.addEventListener('keydown', this.onKey);
      else document.removeEventListener('keydown', this.onKey);
    },
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onKey);
  },
  methods: {
    close() {
      this.$emit('update:modelValue', false);
      this.$emit('close');
    },
    onKey(e) {
      if (e.key === 'Escape') this.close();
    },
  },
};
</script>

<style scoped>
.ehub-dialog-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, .55); display: flex; align-items: center; justify-content: center; z-index: 1060; padding: 1rem; }
.ehub-dialog { background: var(--ehub-card); color: var(--ehub-ink); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); width: 100%; box-shadow: var(--ehub-shadow); display: flex; flex-direction: column; max-height: calc(100vh - 2rem); }
.ehub-dialog--sm { max-width: 420px; }
.ehub-dialog--md { max-width: 520px; }
.ehub-dialog--lg { max-width: 800px; }
.ehub-dialog__hd { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 22px; border-bottom: 1px solid var(--ehub-line); }
.ehub-dialog__hd h5 { font-size: 1rem; font-weight: 800; margin: 0; }
.ehub-dialog__bd { padding: 20px 22px; overflow-y: auto; }
.ehub-dialog__ft { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 22px; border-top: 1px solid var(--ehub-line); flex-wrap: wrap; }
[data-bs-theme="dark"] .btn-close { filter: invert(1) grayscale(100%) brightness(200%); }
</style>
