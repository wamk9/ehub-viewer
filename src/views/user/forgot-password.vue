<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AuthLayout from '@/layouts/AuthLayout.vue'
import Api from '@/helpers/communication/Connection'
import { toast } from '@/helpers/toast.js'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

// 1 = ask e-mail/username, 2 = code + new password
const step = ref(1)
const loading = ref(false)
const error = ref('')
const form = reactive({ mail: String(window.history.state?.mail || ''), code: '', password: '', password_confirmation: '' })
const showPassword = ref(false)

const passwordTooShort = computed(() => form.password.length > 0 && form.password.length < 8)
const mismatch = computed(() => form.password_confirmation.length > 0 && form.password !== form.password_confirmation)

function retryText(res) {
  const s = Number(res?.retry_after || 60)
  return t('users.forgot.err.too_many', { minutes: Math.max(1, Math.ceil(s / 60)) })
}

async function sendCode() {
  error.value = ''
  if (!form.mail.trim()) {
    error.value = t('users.forgot.err.mail_required')
    return
  }
  loading.value = true
  try {
    await Api.fetchCsrf()
    const r = await Api.postAsync('/auth/password/send-code', { mail: form.mail.trim() })
    if (r.code === 200) {
      step.value = 2
    } else if (r.code === 429) {
      error.value = retryText(r.response)
      // A code was already sent recently: let them type it.
      step.value = 2
    } else {
      error.value = t('users.forgot.err.generic')
    }
  } catch {
    error.value = t('users.forgot.err.generic')
  } finally {
    loading.value = false
  }
}

async function reset() {
  error.value = ''
  if (form.code.trim().length !== 6) {
    error.value = t('users.forgot.err.code_format')
    return
  }
  if (form.password.length < 8 || form.password !== form.password_confirmation) {
    error.value = t(form.password.length < 8 ? 'users.forgot.err.short' : 'users.forgot.err.mismatch')
    return
  }
  loading.value = true
  try {
    const r = await Api.postAsync('/auth/password/reset', {
      mail: form.mail.trim(), code: form.code.trim(),
      password: form.password, password_confirmation: form.password_confirmation,
    })
    if (r.code === 200) {
      toast.success(t('users.forgot.done', { username: r.response?.username || '' }))
      router.push({ name: 'user-login', query: route.query.redirect ? { redirect: route.query.redirect } : {} })
      return
    }
    const msg = r.response?.message
    if (msg === 'code_invalid') error.value = t('users.forgot.err.code_invalid', { left: r.response?.tries_left ?? 0 })
    else if (msg === 'code_expired') error.value = t('users.forgot.err.code_expired')
    else if (msg === 'too_many_attempts') error.value = t('users.forgot.err.code_blocked')
    else error.value = t('users.forgot.err.generic')
  } catch {
    error.value = t('users.forgot.err.generic')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout :title="$t('users.forgot.title')" :subtitle="$t(step === 1 ? 'users.forgot.subtitle1' : 'users.forgot.subtitle2')">
    <div class="card ehub-card">
      <div class="card-body p-4">
        <div v-if="error" class="alert alert-danger py-2 small mb-3" role="alert">{{ error }}</div>

        <form v-if="step === 1" @submit.prevent="sendCode">
          <label for="fp-mail" class="form-label small fw-semibold">{{ $t('users.forgot.mail_label') }}</label>
          <input id="fp-mail" v-model="form.mail" type="text" class="form-control mb-3" autocomplete="username" autofocus
            :placeholder="$t('users.forgot.mail_placeholder')" />
          <div class="d-grid">
            <button type="submit" class="btn btn-primary round py-2" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ $t('users.forgot.send') }}
            </button>
          </div>
        </form>

        <form v-else @submit.prevent="reset">
          <p class="small text-muted">{{ $t('users.forgot.sent_hint', { mail: form.mail }) }}</p>
          <label for="fp-code" class="form-label small fw-semibold">{{ $t('users.forgot.code_label') }}</label>
          <input id="fp-code" v-model="form.code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6"
            class="form-control mb-3 fp-code" placeholder="000000" @input="form.code = form.code.replace(/\D/g, '')" />

          <label for="fp-pass" class="form-label small fw-semibold">{{ $t('users.forgot.new_password') }}</label>
          <div class="input-group mb-1">
            <input id="fp-pass" v-model="form.password" :type="showPassword ? 'text' : 'password'" class="form-control" autocomplete="new-password" />
            <button type="button" class="btn btn-outline-secondary" :aria-label="$t(showPassword ? 'users.forgot.hide' : 'users.forgot.show')" @click="showPassword = !showPassword">
              <font-awesome-icon :icon="['fas', showPassword ? 'eye-slash' : 'eye']" />
            </button>
          </div>
          <p class="small mb-3" :class="passwordTooShort ? 'text-danger' : 'text-muted'">{{ $t('users.forgot.password_hint') }}</p>

          <label for="fp-pass2" class="form-label small fw-semibold">{{ $t('users.forgot.confirm_password') }}</label>
          <input id="fp-pass2" v-model="form.password_confirmation" :type="showPassword ? 'text' : 'password'" class="form-control mb-1" autocomplete="new-password" />
          <p v-if="mismatch" class="small text-danger mb-3">{{ $t('users.forgot.err.mismatch') }}</p>
          <div v-else class="mb-3"></div>

          <div class="d-grid gap-2">
            <button type="submit" class="btn btn-primary round py-2" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ $t('users.forgot.save') }}
            </button>
            <button type="button" class="btn btn-link btn-sm" :disabled="loading" @click="sendCode">{{ $t('users.forgot.resend') }}</button>
          </div>
        </form>
      </div>
    </div>

    <p class="text-center text-muted small mt-3 mb-0">
      <router-link :to="{ name: 'user-login' }" class="fw-semibold">{{ $t('users.forgot.back') }}</router-link>
    </p>
  </AuthLayout>
</template>

<style scoped>
.fp-code { font-size: 1.4rem; letter-spacing: .4em; text-align: center; font-weight: 700; }
</style>
