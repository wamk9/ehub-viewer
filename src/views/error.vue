<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

const route    = useRoute()
const router   = useRouter()
const { t }    = useI18n()
const store    = useStore()
const isLogged = computed(() => !!store.getters.getToken)

const code = computed(() => parseInt(route.query.code, 10) || 404)

const errKey = computed(() => {
  const k = `pages.error.e${code.value}`
  const defined = [400, 401, 403, 404, 500, 503]
  return defined.includes(code.value) ? k : 'pages.error.edef'
})
</script>

<template>
  <main class="error-wrap">
    <div class="error-visual">
      <span class="error-code">{{ code }}</span>
    </div>

    <h1 class="error-title">{{ $t(`${errKey}.title`) }}</h1>
    <p class="error-sub">{{ $t(`${errKey}.sub`) }}</p>

    <div class="error-actions">
      <router-link to="/" class="btn btn-primary round px-4">
        <font-awesome-icon :icon="['fas', 'house']" class="me-2" />
        {{ $t('pages.error.home') }}
      </router-link>
      <button class="btn btn-ghost round px-4" @click="router.back()">
        <font-awesome-icon :icon="['fas', 'arrow-left']" class="me-1" />
        {{ $t('pages.error.back') }}
      </button>
    </div>

    <div class="error-divider"></div>

    <p class="quick-label">{{ $t('pages.error.quicknav') }}</p>
    <nav class="quick-nav" aria-label="Atalhos">
      <router-link to="/" class="quick-chip">
        <font-awesome-icon :icon="['fas', 'calendar-days']" />
        {{ $t('pages.error.chip.events') }}
      </router-link>
      <router-link to="/orgs" class="quick-chip">
        <font-awesome-icon :icon="['fas', 'building-flag']" />
        {{ $t('pages.error.chip.orgs') }}
      </router-link>
      <router-link v-if="!isLogged" to="/login" class="quick-chip">
        <font-awesome-icon :icon="['fas', 'right-to-bracket']" />
        {{ $t('pages.error.chip.login') }}
      </router-link>
    </nav>
  </main>
</template>
