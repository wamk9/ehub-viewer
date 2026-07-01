<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import OrgApi from '@/helpers/communication/Organization'
import store from '@/store'

const route  = useRoute()
const router = useRouter()

const status = ref('loading')

onMounted(async () => {
  if (!store.getters.getToken) {
    router.push({ name: 'user-login', query: { redirect: route.fullPath } })
    return
  }

  const res = await OrgApi.acceptInvite(route.params.token)

  if (res.code === 200 || res.code === 201) {
    status.value = 'success'
  } else if (res.data === 'invite_email_mismatch') {
    status.value = 'mismatch'
  } else {
    status.value = 'invalid'
  }
})
</script>

<template>
  <main class="container py-5 text-center">
    <div v-if="status === 'loading'" class="spinner-border text-primary" role="status"></div>

    <div v-else-if="status === 'success'">
      <font-awesome-icon icon="check-circle" class="text-success fa-3x mb-3" />
      <h4>{{ $t('invite.accept.success') }}</h4>
      <router-link class="btn btn-primary mt-3" to="/my-orgs">
        {{ $t('invite.accept.go_orgs') }}
      </router-link>
    </div>

    <div v-else-if="status === 'mismatch'">
      <font-awesome-icon icon="triangle-exclamation" class="text-warning fa-3x mb-3" />
      <h4>{{ $t('invite.accept.mismatch') }}</h4>
      <router-link class="btn btn-outline-secondary mt-3" :to="{ name: 'events' }">{{ $t('invite.accept.home') }}</router-link>
    </div>

    <div v-else>
      <font-awesome-icon icon="circle-xmark" class="text-danger fa-3x mb-3" />
      <h4>{{ $t('invite.accept.invalid') }}</h4>
      <router-link class="btn btn-outline-secondary mt-3" :to="{ name: 'events' }">{{ $t('invite.accept.home') }}</router-link>
    </div>
  </main>
</template>
