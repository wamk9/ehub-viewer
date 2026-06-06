<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ehubInput from '@/components/inputs/ehub-input.vue'
import ehubButton from '@/components/inputs/ehub-button.vue'
import Api from '@/helpers/communication/Connection'
import store from '@/store'

const { t } = useI18n()
const router = useRouter()

const form = reactive({ mail: '', password: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const result = await Api.postAsync('/auth/login', form)
    if (result.code === 200) {
      store.dispatch('setToken', result.response.token)
      const last = localStorage.getItem('lastKnowRoute')
      router.push(last ? JSON.parse(last) : { name: 'home' })
    } else {
      error.value = result.response?.message ?? t('users.login.error')
    }
  } catch {
    error.value = t('users.login.error')
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

            <div v-if="error" class="alert alert-danger py-2 small">{{ error }}</div>

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
