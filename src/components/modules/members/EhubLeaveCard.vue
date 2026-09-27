<template>
  <div class="set-card danger">
    <h3>{{ title }}</h3>
    <p class="set-desc">{{ description }}</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
      <button class="btn btn-outline-secondary round px-4" :disabled="disabled" @click="$emit('leave')">
        <font-awesome-icon :icon="['fas', 'right-from-bracket']" class="me-2" />{{ buttonLabel }}
      </button>
      <p v-if="disabled && disabledMessage" class="leave-note">{{ disabledMessage }}</p>
    </div>
  </div>
</template>

<script>
/** Danger-zone card to leave a team/organization (disabled for the last owner/captain). */
export default {
  name: 'EhubLeaveCard',
  props: {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    buttonLabel: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    disabledMessage: { type: String, default: '' },
  },
  emits: ['leave'],
};
</script>

<style scoped>
.leave-note { margin: 0; font-size: .8rem; color: var(--ehub-muted); max-width: 340px; }
</style>
