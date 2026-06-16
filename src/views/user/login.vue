<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ehubInput from '@/components/inputs/ehub-input.vue'
import ehubButton from '@/components/inputs/ehub-button.vue'
import Api from '@/helpers/communication/Connection'
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

const form = reactive({ mail: '', password: '' })
const loading = ref(false)

async function submit() {
  loading.value = true
  try {
    await Api.fetchCsrf()
    const result = await Api.postAsync('/auth/login', form)
    if (result.code === 200) {
      store.dispatch('setAuthenticated', true)
      if (route.query.redirect && isSafeRedirect(route.query.redirect))
        router.push(route.query.redirect)
      else {
        const last = localStorage.getItem('lastKnowRoute')
        router.push(last ? JSON.parse(last) : { name: 'home' })
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
  <main class="container">
    <div class="row justify-content-center mt-5">
      <div class="col-12 col-md-8 col-lg-5">

        <div class="text-center mb-4">
          <h1 class="display-5 fw-light">{{ $t('users.login.title') }}</h1>
          <p class="text-muted">{{ $t('users.login.description') }}</p>
        </div>

        <div class="card border-0 shadow-sm">
          <div class="card-body p-4">

            <ehubInput
              v-model="form.mail"
              type="email"
              :label="$t('users.login.form.mail.label')"
              :placeholder="$t('users.login.form.mail.placeholder')"
            />

            <ehubInput
              v-model="form.password"
              type="password"
              :label="$t('users.login.form.password.label')"
              :placeholder="$t('users.login.form.password.placeholder')"
            />

            <div class="d-grid mt-3">
              <ehubButton @click="submit" :text="$t('users.login.submit')" :disabled="loading" />
            </div>

          </div>
        </div>

        <p class="text-center text-muted small mt-3">
          {{ $t('users.login.no_account') }}
          <router-link to="/register">{{ $t('users.login.register_link') }}</router-link>
        </p>

      </div>
    </div>
  </main>
</template>
