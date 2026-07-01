<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AuthLayout from '@/layouts/AuthLayout.vue'
import ehubInput from '@/components/inputs/ehub-input.vue'
import Api from '@/helpers/communication/Connection'
import SystemVars from '@/helpers/General/SystemVars'
import store from '@/store'
import { toast } from '@/helpers/toast.js'

const { t } = useI18n()
const router = useRouter()
const route  = useRoute()

function isSafeRedirect(url) {
  try {
    return new URL(url, window.location.origin).origin === window.location.origin
  } catch {
    return false
  }
}

const form    = reactive({ mail: '', password: '', remember: true })
const loading = ref(false)

onMounted(() => {
  const err = route.query.oauth_error
  if (err) {
    const msg = t('users.login.oauth_error.' + err) || t('users.login.oauth_error.1')
    toast.error(msg)
  }
})

function oauthLogin(provider) {
  window.location.href = SystemVars.baseUrl + 'auth/social/' + provider
}

async function submit() {
  loading.value = true
  try {
    await Api.fetchCsrf()
    const result = await Api.postAsync('/auth/login', form)
    if (result.code === 200) {
      store.dispatch('setAuthenticated', true)
      if (route.query.redirect && isSafeRedirect(route.query.redirect)) {
        router.push(route.query.redirect)
      } else {
        const last = localStorage.getItem('lastKnowRoute')
        router.push(last ? JSON.parse(last) : { name: 'events' })
      }
    } else {
      toast.error(result.response?.message ?? t('users.login.error'))
    }
  } catch {
    toast.error(t('users.login.error'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout :title="$t('users.login.title')" :subtitle="$t('users.login.description')">

    <div class="card ehub-card">
      <div class="card-body p-4">

        <form @submit.prevent="submit">
          <!-- Email -->
          <ehubInput
            v-model="form.mail"
            id="login-mail"
            type="email"
            :icon="['fas', 'envelope']"
            :label="$t('users.login.form.mail.label')"
            placeholder=""
          />

          <!-- Password -->
          <ehubInput
            v-model="form.password"
            id="login-password"
            type="password"
            :icon="['fas', 'lock']"
            :label="$t('users.login.form.password.label')"
            placeholder=""
          />

          <!-- Remember + Forgot -->
          <div class="d-flex align-items-center justify-content-between mb-3">
            <div class="form-check mb-0">
              <input class="form-check-input" type="checkbox" id="rememberMe" v-model="form.remember" />
              <label class="form-check-label small text-secondary" for="rememberMe">
                {{ $t('users.login.remember') }}
              </label>
            </div>
            <a href="#" class="small fw-medium" @click.prevent>
              {{ $t('users.login.forgot') }}
            </a>
          </div>

          <!-- Submit -->
          <div class="d-grid">
            <button type="submit" class="btn btn-primary round py-2" :disabled="loading">
              <font-awesome-icon v-if="loading" :icon="['fas', 'spinner']" spin class="me-2" />
              {{ $t('users.login.submit') }}
            </button>
          </div>
        </form>

        <!-- Or divider -->
        <div class="divider-or my-3">
          <span>{{ $t('users.login.or') }}</span>
        </div>

        <!-- OAuth -->
        <div class="d-grid gap-2">
          <button class="btn btn-oauth round py-2" type="button" @click="oauthLogin('google')">
            <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            <span>{{ $t('users.login.google') }}</span>
          </button>

        </div>

      </div>
    </div>

    <div class="login-footer">
      <!-- Switch to register -->
      <p class="text-center text-muted small mt-3 mb-0">
        {{ $t('users.login.no_account') }}
        <router-link to="/register" class="fw-semibold">{{ $t('users.login.register_link') }}</router-link>
      </p>

      <!-- Terms -->
      <p class="text-center text-muted mt-3 mb-0" style="font-size:.74rem">
        <i18n-t keypath="users.login.terms" tag="span">
          <template #terms>
            <a href="#">{{ $t('users.login.terms_link') }}</a>
          </template>
          <template #privacy>
            <a href="#">{{ $t('users.login.privacy_link') }}</a>
          </template>
        </i18n-t>
      </p>
    </div>

  </AuthLayout>
</template>

<style scoped>
.login-footer {
  min-height: 6.5rem;
}
</style>
