<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AuthLayout from '@/layouts/AuthLayout.vue'
import Api from '@/helpers/communication/Connection'

const { t } = useI18n()
const router = useRouter()

const loading = ref(false)

function getLastRoute() {
  const raw = localStorage.getItem('lastKnowRoute')
  return raw ? JSON.parse(raw) : { name: 'events' }
}

async function remember() {
  loading.value = true
  await Api.postAsync('/auth/remember')
  loading.value = false
  router.push(getLastRoute())
}

function skip() {
  router.push(getLastRoute())
}
</script>

<template>
  <AuthLayout
    :title="$t('users.login.remember_prompt.title')"
    :subtitle="$t('users.login.remember_prompt.description')"
  >
    <div class="card ehub-card">
      <div class="card-body p-4 d-flex flex-column gap-3">
        <button class="btn btn-primary round py-2" @click="remember" :disabled="loading">
          <font-awesome-icon v-if="loading" :icon="['fas', 'spinner']" spin class="me-2" />
          <font-awesome-icon v-else :icon="['fas', 'shield-halved']" class="me-2" />
          {{ $t('users.login.remember_prompt.yes') }}
        </button>
        <button class="btn btn-outline-secondary round py-2" @click="skip" :disabled="loading">
          {{ $t('users.login.remember_prompt.no') }}
        </button>
      </div>
    </div>
  </AuthLayout>
</template>
