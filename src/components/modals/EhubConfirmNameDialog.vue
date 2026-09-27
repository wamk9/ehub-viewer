<template>
  <EhubDialog :model-value="modelValue" :title="title" icon="trash" centered size="sm" :persistent="loading" @close="close">
    <p class="cnd-msg">{{ message }}</p>


    <div class="cnd-field">
      <label class="cnd-label" :for="inputId">{{ typeLabel }}</label>
      <div class="cnd-input" :class="{ ok: matches }">
        <input :id="inputId" ref="input" v-model="typed" class="form-control" :placeholder="name" autocomplete="off" spellcheck="false" @keyup.enter="confirm" />
        <font-awesome-icon v-if="matches" :icon="['fas', 'circle-check']" class="cnd-check" />
      </div>
    </div>

    <template #footer>
      <button class="btn btn-outline-secondary round" :disabled="loading" @click="close">{{ cancelLabel }}</button>
      <button class="btn btn-danger round" :disabled="loading || !matches" @click="confirm">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
        {{ confirmLabel }}
      </button>
    </template>
  </EhubDialog>
</template>

<script>
import EhubDialog from '@/components/modals/EhubDialog.vue';

let uid = 0;

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
    return { typed: '', inputId: 'cnd-' + ++uid };
  },
  computed: {
    matches() {
      return this.typed.trim() === this.name.trim();
    },
  },
  watch: {
    modelValue(open) {
      if (!open) return;
      this.typed = '';
      this.$nextTick(() => this.$refs.input?.focus());
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
.cnd-msg { font-size: .88rem; color: var(--ehub-muted); line-height: 1.5; margin: 0 auto 22px; max-width: 320px; text-wrap: pretty; }
.cnd-field { text-align: left; }
.cnd-label { display: block; font-size: .78rem; font-weight: 600; color: var(--ehub-muted); margin-bottom: 6px; }
.cnd-input { position: relative; }
.cnd-input .form-control { padding-right: 38px; transition: border-color .15s, box-shadow .15s; }
.cnd-input.ok .form-control, .cnd-input.ok .form-control:focus { border-color: #1f8a5b; box-shadow: 0 0 0 3px color-mix(in srgb, #1f8a5b 15%, transparent); }
.cnd-check { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #1f8a5b; }
</style>
