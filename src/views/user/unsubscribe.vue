<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Api from '@/helpers/communication/Connection'

// Opening the link only reads it (mail scanners click links); the button turns the e-mail off.
const route = useRoute()
const state = ref('loading') // loading | ask | done | invalid
const type = ref(null)
const busy = ref(false)

onMounted(async () => {
  const r = await Api.getAsync('/notifications/unsubscribe/' + encodeURIComponent(route.params.token))
  if (r.code !== 200) { state.value = 'invalid'; return }
  type.value = r.response.type
  state.value = r.response.email_on ? 'ask' : 'done'
})

async function confirm() {
  busy.value = true
  const r = await Api.postAsync('/notifications/unsubscribe/' + encodeURIComponent(route.params.token), {})
  busy.value = false
  state.value = r.code === 200 ? 'done' : 'invalid'
}
</script>

<template>
  <main class="unsub-page">
    <div class="unsub-card">
      <template v-if="state === 'loading'">
        <font-awesome-icon :icon="['fas', 'spinner']" spin class="unsub-ico" />
      </template>
      <template v-else-if="state === 'invalid'">
        <font-awesome-icon :icon="['fas', 'link-slash']" class="unsub-ico" />
        <h1>{{ $t('pages.user.unsubscribe.invalid_title') }}</h1>
        <p>{{ $t('pages.user.unsubscribe.invalid_desc') }}</p>
        <router-link :to="{ name: 'user-profile', params: { panel: 'notifications' } }" class="btn btn-primary round">{{ $t('pages.user.unsubscribe.manage') }}</router-link>
      </template>
      <template v-else-if="state === 'ask'">
        <font-awesome-icon :icon="['fas', 'envelope']" class="unsub-ico" />
        <h1>{{ $t('pages.user.unsubscribe.ask_title', { type: $t('users.profile.notifications.types.' + type + '.label') }) }}</h1>
        <p>{{ $t('pages.user.unsubscribe.ask_desc') }}</p>
        <button type="button" class="btn btn-primary round px-4" :disabled="busy" @click="confirm">
          {{ $t('pages.user.unsubscribe.confirm') }}
        </button>
      </template>
      <template v-else>
        <font-awesome-icon :icon="['fas', 'circle-check']" class="unsub-ico ok" />
        <h1>{{ $t('pages.user.unsubscribe.done_title') }}</h1>
        <p>{{ $t('pages.user.unsubscribe.done_desc', { type: $t('users.profile.notifications.types.' + type + '.label') }) }}</p>
        <router-link :to="{ name: 'user-profile', params: { panel: 'notifications' } }" class="btn btn-ghost round">{{ $t('pages.user.unsubscribe.manage') }}</router-link>
      </template>
    </div>
  </main>
</template>

<style scoped>
.unsub-page { min-height: 60vh; display: flex; align-items: center; justify-content: center; padding: 2rem 16px; background: var(--ehub-bg); }
.unsub-card { max-width: 460px; width: 100%; text-align: center; background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card, 16px); padding: 2rem 1.5rem; }
.unsub-card h1 { font-size: 1.2rem; font-weight: 800; margin: .75rem 0 .5rem; color: var(--ehub-ink); }
.unsub-card p { color: var(--ehub-muted); margin-bottom: 1.25rem; }
.unsub-ico { font-size: 2.2rem; color: var(--ehub-primary); }
.unsub-ico.ok { color: var(--ehub-success-text); }
</style>
