<script setup>
/**
 * Small status pill used on stage, session and match cards:
 * done (Concluída) · live (Ao vivo, pulsing dot) · scheduled (Agendada) · bye.
 */
defineProps({
  state: { type: String, required: true },
  label: { type: String, default: '' },
})
</script>

<template>
  <span class="esb" :class="'esb--' + state" role="status">
    <span v-if="state === 'live'" class="esb__dot" aria-hidden="true"></span>
    {{ label || $t('stages.status.' + state) }}
  </span>
</template>

<style scoped>
.esb { display: inline-flex; align-items: center; gap: 6px; font-size: .7rem; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; padding: 3px 10px; border-radius: 50rem; border: 1px solid transparent; white-space: nowrap; }
.esb--done { background: color-mix(in srgb, #1f8a5b 13%, transparent); color: var(--ehub-success-text); border-color: color-mix(in srgb, #1f8a5b 28%, var(--ehub-line)); }
.esb--live { background: color-mix(in srgb, #e74c3c 13%, transparent); color: #d63a2c; border-color: color-mix(in srgb, #e74c3c 30%, var(--ehub-line)); }
.esb--scheduled, .esb--bye { background: var(--ehub-field-bg); color: var(--ehub-muted); border-color: var(--ehub-line); }
.esb__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; animation: esb-pulse 1.2s ease-in-out infinite; }
@keyframes esb-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }
@media (prefers-reduced-motion: reduce) { .esb__dot { animation: none; } }
</style>
