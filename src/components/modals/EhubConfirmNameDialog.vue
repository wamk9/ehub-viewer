<template>
  <EhubDialog :model-value="modelValue" :title="title" icon="triangle-exclamation" size="sm" :persistent="loading" @close="close">
    <p class="cnd-warn">{{ message }}</p>
    <label class="form-label mb-1" style="font-size:.84rem">{{ typeLabel }}</label>
    <input v-model="typed" class="form-control" autocomplete="off" @keyup.enter="confirm" />
    <template #footer>
      <button class="btn btn-outline-secondary round px-3" :disabled="loading" @click="close">{{ cancelLabel }}</button>
      <button class="btn btn-danger round px-3" :disabled="loading || !matches" @click="confirm">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
        <font-awesome-icon v-else :icon="['fas', 'trash']" class="me-2" />{{ confirmLabel }}
      </button>
    </template>
  </EhubDialog>
</template>

<script>
import EhubDialog from '@/components/modals/EhubDialog.vue';

/**
 * Destructive confirmation that requires typing the item's name
 * (delete event, etc.). Emits "confirm" only when the typed text matches.
 */
export default {
  name: 'EhubConfirmNameDialog',
  components: { EhubDialog },
  props: {
    modelValue: { type: Boolean, default: false },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    name: { type: String, required: true },
    typeLabel: { type: String, required: true },
    confirmLabel: { type: String, required: true },
    cancelLabel: { type: String, required: true },
    loading: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'confirm'],
  data() {
    return { typed: '' };
  },
  computed: {
    matches() {
      return this.typed.trim() === this.name.trim();
    },
  },
  watch: {
    modelValue(open) {
      if (open) this.typed = '';
    },
  },
  methods: {
    close() {
      if (!this.loading) this.$emit('update:modelValue', false);
    },
    confirm() {
      if (this.matches && !this.loading) this.$emit('confirm');
    },
  },
};
</script>

<style scoped>
.cnd-warn { font-size: .85rem; color: #e23b3b; background: color-mix(in srgb, #e23b3b 7%, transparent); border: 1px solid color-mix(in srgb, #e23b3b 25%, var(--ehub-line)); border-radius: 10px; padding: 12px 14px; margin-bottom: 16px; text-wrap: pretty; }
</style>
