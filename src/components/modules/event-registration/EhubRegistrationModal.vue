<template>
  <Teleport to="body">
    <div class="modal-overlay" :style="accent ? { '--org-accent': accent } : null" @click.self="$emit('close')">
      <div class="modal-card">
        <div class="modal-card__header">
          <h5 class="mb-0">{{ $t('events.show.registration.modal.title') }}</h5>
          <button class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        <div v-if="preview" class="modal-card__preview">
          <font-awesome-icon :icon="['fas', 'eye']" />{{ $t('common.regForm.previewBanner') }}
        </div>
        <div class="modal-card__body">
          <i18n-t keypath="events.show.registration.modal.intro" tag="p" class="modal-card__intro">
            <template #event><strong>{{ eventName }}</strong></template>
          </i18n-t>
          <div v-if="fee > 0" class="modal-card__notice warn">
            <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
            <span>{{ $t('events.show.registration.modal.paid_notice', { fee: (currency?.toUpperCase() || '') + ' ' + Number(fee).toFixed(2) }) }}</span>
          </div>
          <div v-else class="modal-card__notice ok">
            <font-awesome-icon :icon="['fas', 'circle-check']" />
            <span>{{ $t('events.show.registration.modal.free_notice') }}</span>
          </div>
          <p v-if="rulesAvailable && !preview" class="modal-card__rules">
            <font-awesome-icon :icon="['fas', 'clipboard-list']" />
            {{ $t('events.show.registration.modal.rules_hint') }}
            <a href="#" @click.prevent="$emit('open-rules')">{{ $t('events.show.registration.modal.rules_link') }}</a>
          </p>
          <EhubRegistrationFields v-if="fields.length" :fields="fields" :model-value="modelValue" :errors="errors" @update:model-value="$emit('update:modelValue', $event)" />
          <p v-else class="mb-0 small">{{ $t('events.show.registration.modal.confirm_text') }}</p>
          <div v-if="preview && previewOk" class="modal-card__ok">
            <font-awesome-icon :icon="['fas', 'circle-check']" />{{ $t('common.regForm.previewOk') }}
          </div>
        </div>
        <div class="modal-card__footer">
          <button class="btn btn-outline-secondary btn-sm" @click="$emit('close')">
            {{ $t('events.show.registration.modal.cancel') }}
          </button>
          <button class="btn btn-primary btn-sm" :disabled="loading" @click="$emit('confirm')">
            <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
            {{ $t('events.show.registration.modal.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import EhubRegistrationFields from './EhubRegistrationFields.vue';

/**
 * Event registration modal: the public sign-up dialog, also opened by the
 * event wizard as a preview (preview=true shows a banner; nothing is sent).
 */
export default {
  name: 'EhubRegistrationModal',
  components: { EhubRegistrationFields },
  props: {
    rulesAvailable: { type: Boolean, default: false },
    eventName: { type: String, default: '' },
    // Teleported out of the page, so the event color is passed explicitly.
    accent: { type: String, default: '' },
    fee: { type: Number, default: 0 },
    currency: { type: String, default: '' },
    fields: { type: Array, default: () => [] },
    modelValue: { type: Object, default: () => ({}) },
    errors: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    preview: { type: Boolean, default: false },
    previewOk: { type: Boolean, default: false },
  },
  emits: ['close', 'confirm', 'update:modelValue', 'open-rules'],
};
</script>

<style scoped>
.modal-card__rules { font-size: .8rem; color: var(--ehub-muted); margin: 0 0 12px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; z-index: 1050; padding: 1rem; }
.modal-card { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 14px; width: 100%; max-width: 420px; max-height: calc(100vh - 2rem); display: flex; flex-direction: column; overflow: hidden; }
.modal-card__header { display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 1.4rem; border-bottom: 1px solid var(--ehub-line); font-size: 1rem; font-weight: 600; color: var(--ehub-ink); }
.modal-card__preview { display: flex; align-items: center; gap: 7px; font-size: .75rem; font-weight: 600; color: var(--ehub-primary-text); background: var(--ehub-primary-tint); padding: .5rem 1.4rem; border-bottom: 1px solid var(--ehub-line); }
.modal-card__body { padding: 1.2rem 1.4rem; overflow-y: auto; }
.modal-card__intro { font-size: .88rem; color: var(--ehub-ink); margin: 0 0 .9rem; }
.modal-card__intro strong { color: var(--org-accent, var(--ehub-primary)); }
.modal-card__notice { display: flex; gap: 9px; align-items: flex-start; font-size: .8rem; line-height: 1.45; border-radius: 10px; padding: .7rem .85rem; margin-bottom: 1.1rem; border: 1px solid; }
.modal-card__notice svg { margin-top: 3px; flex-shrink: 0; }
.modal-card__notice.warn { color: var(--ehub-ink); background: color-mix(in srgb, var(--ehub-gold, #f0b400) 12%, transparent); border-color: color-mix(in srgb, var(--ehub-gold, #f0b400) 40%, transparent); }
.modal-card__notice.warn svg { color: var(--ehub-gold, #f0b400); }
.modal-card__notice.ok { color: var(--ehub-ink); background: color-mix(in srgb, #2f9e44 10%, transparent); border-color: color-mix(in srgb, #2f9e44 35%, transparent); }
.modal-card__notice.ok svg { color: #2f9e44; }
.modal-card__ok { display: flex; align-items: center; gap: 7px; margin-top: 1rem; font-size: .8rem; font-weight: 600; color: #2f9e44; }
.modal-card__footer { display: flex; justify-content: flex-end; gap: .5rem; padding: .9rem 1.4rem; border-top: 1px solid var(--ehub-line); }
[data-bs-theme="light"] .btn-close-white { filter: none; }
</style>
