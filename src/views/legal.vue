<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { LEGAL_CONTACT, LEGAL_UPDATED } from '@/helpers/General/legal.js'

const route = useRoute()
const { tm, rt, t } = useI18n()

// /privacy or /terms — same layout, texts in locales/*/legal.js
const doc = computed(() => (route.name === 'legal-terms' ? 'terms' : 'privacy'))
const sections = computed(() => (tm(`legal.${doc.value}.sections`) || []).map((s) => ({
  title: rt(s.title),
  items: (s.items || []).map((i) => rt(i, { contact: LEGAL_CONTACT })),
})))
const updated = computed(() => t('legal.updated', { date: LEGAL_UPDATED }))
</script>

<template>
  <main class="legal container py-5">
    <h1 class="legal-title">{{ $t(`legal.${doc}.title`) }}</h1>
    <p class="legal-intro">{{ $t(`legal.${doc}.intro`, { contact: LEGAL_CONTACT }) }}</p>
    <p class="legal-updated">{{ updated }}</p>

    <nav class="legal-switch">
      <router-link :to="{ name: 'legal-privacy' }">{{ $t('legal.privacy.title') }}</router-link>
      <router-link :to="{ name: 'legal-terms' }">{{ $t('legal.terms.title') }}</router-link>
    </nav>

    <section v-for="(s, i) in sections" :key="i" class="legal-section">
      <h2>{{ i + 1 }}. {{ s.title }}</h2>
      <ul>
        <li v-for="(item, j) in s.items" :key="j">{{ item }}</li>
      </ul>
    </section>

    <p class="legal-contact">
      {{ $t('legal.contact') }} <a :href="`mailto:${LEGAL_CONTACT}`">{{ LEGAL_CONTACT }}</a>
    </p>
  </main>
</template>

<style scoped>
.legal { max-width: 820px; color: var(--ehub-ink); }
.legal-title { font-size: 2rem; font-weight: 800; letter-spacing: -.02em; }
.legal-intro { font-size: 1rem; color: var(--ehub-muted); }
.legal-updated { font-size: .82rem; color: var(--ehub-muted); }
.legal-switch { display: flex; gap: 16px; flex-wrap: wrap; margin: 12px 0 28px; font-size: .9rem; }
.legal-switch a.router-link-exact-active { font-weight: 700; text-decoration: none; }
.legal-section h2 { font-size: 1.15rem; font-weight: 700; margin-top: 28px; }
.legal-section ul { padding-left: 1.2rem; }
.legal-section li { margin: 6px 0; line-height: 1.55; }
.legal-contact { margin-top: 36px; padding-top: 16px; border-top: 1px solid var(--ehub-line); }
</style>
