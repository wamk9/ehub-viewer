<template>
  <div class="mb-3">
    <label class="form-label">{{ label }}</label>

    <!-- Email + Send button -->
    <div class="input-group mb-2">
      <input
        v-model="mail"
        type="email"
        class="form-control"
        :class="{ 'is-valid': state === 'verified', 'is-invalid': errorMsg }"
        :placeholder="placeholder"
        :disabled="state !== 'idle'"
        @input="onMailInput"
      />
      <button
        class="btn"
        :class="state === 'verified' ? 'btn-success' : 'btn-outline-primary'"
        :disabled="!isValidFormat || state === 'sending' || state === 'verified'"
        @click="sendCode"
        type="button"
      >
        <font-awesome-icon v-if="state === 'sending'" icon="spinner" spin class="me-1" />
        <font-awesome-icon v-else-if="state === 'verified'" icon="check" class="me-1" />
        <font-awesome-icon v-else icon="envelope" class="me-1" />
        {{ btnLabel }}
      </button>
    </div>

    <!-- Code input (after sending) -->
    <transition name="slide">
      <div v-if="state === 'code_sent' || state === 'verifying'" class="input-group">
        <input
          v-model="code"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errorMsg }"
          maxlength="6"
          placeholder="000000"
          @input="code = code.replace(/\D/g,'').slice(0,6)"
        />
        <button
          class="btn btn-primary"
          :disabled="code.length !== 6 || state === 'verifying'"
          @click="verifyCode"
          type="button"
        >
          <font-awesome-icon v-if="state === 'verifying'" icon="spinner" spin class="me-1" />
          {{ $t('users.create.form.mail.verify') }}
        </button>
        <button class="btn btn-outline-secondary" @click="reset" type="button">
          {{ $t('users.create.form.mail.resend') }}
        </button>
      </div>
    </transition>

    <!-- Feedback -->
    <div v-if="errorMsg" class="invalid-feedback d-block small">{{ errorMsg }}</div>
    <div v-if="state === 'verified'" class="valid-feedback d-block small">
      {{ $t('users.create.form.mail.verified') }}
    </div>
    <small v-if="state === 'code_sent' || state === 'verifying'" class="text-muted">
      {{ $t('users.create.form.mail.code_hint') }}
    </small>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Api from '@/helpers/communication/Connection'

const props = defineProps({
  modelValue:  { type: String, default: '' },
  label:       { type: String, default: 'E-mail' },
  placeholder: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue', 'verified'])

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/

const mail     = ref(props.modelValue)
const code     = ref('')
const state    = ref('idle')       // idle | sending | code_sent | verifying | verified
const errorMsg = ref('')

const isValidFormat = computed(() => EMAIL_RE.test(mail.value))

const btnLabel = computed(() => {
  if (state.value === 'verified') return 'Verificado'
  if (state.value === 'sending')  return '...'
  return 'Enviar código'
})

function onMailInput() {
  emit('update:modelValue', mail.value)
  errorMsg.value = ''
  if (state.value !== 'idle') reset()
}

function reset() {
  state.value    = 'idle'
  code.value     = ''
  errorMsg.value = ''
}

async function sendCode() {
  errorMsg.value = ''
  state.value    = 'sending'
  try {
    const result = await Api.postAsync('/auth/email/send-code', { mail: mail.value })
    if (result.code === 200) {
      state.value = 'code_sent'
    } else {
      errorMsg.value = result.response?.message ?? 'Erro ao enviar código.'
      state.value = 'idle'
    }
  } catch {
    errorMsg.value = 'Erro ao enviar código.'
    state.value = 'idle'
  }
}

async function verifyCode() {
  errorMsg.value = ''
  state.value    = 'verifying'
  try {
    const result = await Api.postAsync('/auth/email/verify-code', { mail: mail.value, code: code.value })
    if (result.code === 200) {
      state.value = 'verified'
      emit('verified', mail.value)
    } else {
      errorMsg.value = result.response?.message ?? 'Código incorreto.'
      state.value = 'code_sent'
    }
  } catch {
    errorMsg.value = 'Erro ao verificar código.'
    state.value = 'code_sent'
  }
}
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
