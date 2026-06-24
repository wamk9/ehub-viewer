<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import EhubLogo from '@/components/general/EhubLogo.vue'

const { locale } = useI18n()

const props = defineProps({
  title:    { type: String, required: true },
  subtitle: { type: String, default: '' },
  maxWidth: { type: String, default: '416px' },
})

const savedTheme = localStorage.getItem('ehub_theme')
const htmlTheme  = document.documentElement.getAttribute('data-bs-theme') || 'dark'
const isDark = ref(savedTheme !== null ? savedTheme === 'dark' : htmlTheme === 'dark')

function applyTheme() {
  const t = isDark.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-bs-theme', t)
  localStorage.setItem('ehub_theme', t)
}

function toggleTheme() {
  isDark.value = !isDark.value
  applyTheme()
}

function setLang(lang) {
  locale.value = lang
  localStorage.setItem('lang', lang)
}

onMounted(() => {
  document.body.classList.add('ehub-app', 'ehub-center')
  applyTheme()
})

onUnmounted(() => {
  document.body.classList.remove('ehub-app', 'ehub-center')
  document.documentElement.setAttribute('data-bs-theme', 'dark')
})
</script>

<template>
  <div class="auth-wrap" :style="{ maxWidth: props.maxWidth }">

    <!-- Topbar: language + theme (fixed top-right via CSS) -->
    <div class="topbar">
      <div class="lang-seg">
        <button :class="{ active: locale === 'pt-BR' }" @click="setLang('pt-BR')">PT</button>
        <button :class="{ active: locale === 'en' }"    @click="setLang('en')">EN</button>
        <button :class="{ active: locale === 'es' }"    @click="setLang('es')">ES</button>
      </div>
      <button class="theme-btn" @click="toggleTheme">
        <font-awesome-icon :icon="['fas', isDark ? 'sun' : 'moon']" />
      </button>
    </div>

    <!-- Brand -->
    <div class="brand-area mb-4">
      <span class="brand-holder">
        <span class="brand-mark">
          <EhubLogo :height="33" />
        </span>
      </span>
    </div>

    <!-- Page title -->
    <div class="text-center mb-3 auth-title-area">
      <h1 class="auth-title mb-1">{{ title }}</h1>
      <p class="auth-sub mb-0">{{ subtitle }}</p>
    </div>

    <!-- Page content (form card, switch, terms) -->
    <slot />

  </div>
</template>

<style scoped>
.auth-wrap {
  width: 100%;
  margin: 0 auto;
}
.auth-title-area {
  min-height: 6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
