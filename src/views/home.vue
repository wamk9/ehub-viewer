<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { mockEvents } from '@/helpers/mock/events.js'

const { t, locale } = useI18n()
const router = useRouter()

const CAT_CONFIG = {
  simracing:          { grad: ['#0098D8', '#00d4ff'], icon: 'flag-checkered' },
  racingcars:         { grad: ['#0098D8', '#00d4ff'], icon: 'flag-checkered' },
  rally:              { grad: ['#f08c00', '#ffc93c'], icon: 'car-side' },
  'esports-fps':      { grad: ['#e23b3b', '#ff8a3b'], icon: 'crosshairs' },
  'esports-moba':     { grad: ['#7C3AED', '#b06bff'], icon: 'dragon' },
  'esports-fighting': { grad: ['#d6336c', '#ff6b9d'], icon: 'hand-fist' },
  'esports-strategy': { grad: ['#1a6e4f', '#51cf66'], icon: 'chess-pawn' },
  'esports-sports':   { grad: ['#2563eb', '#60a5fa'], icon: 'futbol' },
  motorsport:         { grad: ['#f08c00', '#ffc93c'], icon: 'car-side' },
  motorbike:          { grad: ['#dc4f00', '#ff8a3b'], icon: 'motorcycle' },
  cycling:            { grad: ['#1971c2', '#4dabf7'], icon: 'bicycle' },
  running:            { grad: ['#1f8a5b', '#51cf66'], icon: 'person-running' },
  swimming:           { grad: ['#0284c7', '#38bdf8'], icon: 'person-swimming' },
  triathlon:          { grad: ['#7C3AED', '#c084fc'], icon: 'trophy' },
  hiking:             { grad: ['#4d7c0f', '#a3e635'], icon: 'mountain-sun' },
  crossfit:           { grad: ['#9a3412', '#fb923c'], icon: 'dumbbell' },
  rowing:             { grad: ['#1d4ed8', '#93c5fd'], icon: 'water' },
  archery:            { grad: ['#92400e', '#fbbf24'], icon: 'bullseye' },
  chess:              { grad: ['#495057', '#868e96'], icon: 'chess-knight' },
  'drone-racing':     { grad: ['#0e7490', '#22d3ee'], icon: 'helicopter' },
}

function catGradStyle(category) {
  const c = CAT_CONFIG[category] || { grad: ['#6c757d', '#adb5bd'] }
  return { background: `linear-gradient(135deg, ${c.grad[0]}, ${c.grad[1]})` }
}
function catIcon(category) {
  return CAT_CONFIG[category]?.icon || 'trophy'
}

const searchQuery = ref('')
const feeFilter = ref('all')
const modeFilter = ref('all')
const categoryFilter = ref('all')
const subcategoryFilter = ref('all')

const allCategories = computed(() => [...new Set(mockEvents.map(e => e.category))])

const subcategories = computed(() => {
  if (categoryFilter.value === 'all') return []
  return [...new Set(
    mockEvents.filter(e => e.category === categoryFilter.value).map(e => e.subcategory)
  )]
})

function onCategoryChange() {
  subcategoryFilter.value = 'all'
}

const filteredEvents = computed(() =>
  mockEvents.filter(e => {
    if (feeFilter.value === 'free' && e.fee.currency !== 'free') return false
    if (feeFilter.value === 'paid' && e.fee.currency === 'free') return false
    if (modeFilter.value !== 'all' && e.runmode !== modeFilter.value) return false
    if (categoryFilter.value !== 'all' && e.category !== categoryFilter.value) return false
    if (subcategoryFilter.value !== 'all' && e.subcategory !== subcategoryFilter.value) return false
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      if (!e.title.toLowerCase().includes(q) && !e.org.toLowerCase().includes(q)) return false
    }
    return true
  })
)

const today = new Date().toISOString().split('T')[0]

const upcomingEvents = computed(() =>
  filteredEvents.value
    .filter(e => e.date_start >= today)
    .sort((a, b) => a.date_start.localeCompare(b.date_start))
    .slice(0, 20)
)

const latestEvents = computed(() =>
  [...filteredEvents.value]
    .sort((a, b) => b.date_start.localeCompare(a.date_start))
    .slice(0, 20)
)

function slotsPercent(e) { return Math.round((e.slots.current / e.slots.max) * 100) }
function slotsBarColor(pct) {
  if (pct >= 90) return '#e05454'
  if (pct >= 60) return 'var(--ehub-gold)'
  return '#1f8a5b'
}
function feeLabel(e) {
  if (e.fee.currency === 'free') return t('pages.homepage.events.card.free')
  if (e.fee.currency === 'brl') return `R$ ${e.fee.value}`
  return `US$ ${e.fee.value}`
}
function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(
    locale.value === 'pt-BR' ? 'pt-BR' : locale.value,
    { day: '2-digit', month: 'short' }
  )
}

function slugify(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}
function navigateToEvent(event) {
  router.push(`/org/${slugify(event.org)}/event/${event.route}`)
}
</script>

<template>
  <!-- HERO -->
  <header class="home-hero">
    <h1>
      {{ $t('pages.homepage.entrance.title_part1') }}
      <span class="accent">{{ $t('pages.homepage.entrance.title_accent') }}</span>
      {{ $t('pages.homepage.entrance.title_part2') }}
    </h1>
    <p>{{ $t('pages.homepage.entrance.subtitle') }}</p>
    <div class="hero-search">
      <div class="input-group input-group-lg">
        <span class="input-group-text">
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
        </span>
        <input
          v-model="searchQuery"
          type="text"
          class="form-control"
          :placeholder="$t('pages.homepage.entrance.search_placeholder')"
        />
      </div>
    </div>
  </header>

  <!-- FILTER BAR -->
  <div class="filter-bar">
    <div class="container-fluid px-4">
      <div class="filter-inner">
        <span class="fb-label">{{ $t('pages.homepage.events.filters.fee') }}</span>
        <div class="seg seg-sm">
          <button :class="{ active: feeFilter === 'all' }" @click="feeFilter = 'all'">
            {{ $t('pages.homepage.events.filters.all') }}
          </button>
          <button :class="{ active: feeFilter === 'free' }" @click="feeFilter = 'free'">
            {{ $t('pages.homepage.events.filters.free') }}
          </button>
          <button :class="{ active: feeFilter === 'paid' }" @click="feeFilter = 'paid'">
            {{ $t('pages.homepage.events.filters.paid') }}
          </button>
        </div>

        <span class="fb-label ms-2">{{ $t('pages.homepage.events.filters.mode') }}</span>
        <div class="seg seg-sm">
          <button :class="{ active: modeFilter === 'all' }" @click="modeFilter = 'all'">
            {{ $t('pages.homepage.events.filters.all') }}
          </button>
          <button :class="{ active: modeFilter === 'online' }" @click="modeFilter = 'online'">
            {{ $t('pages.homepage.events.filters.online') }}
          </button>
          <button :class="{ active: modeFilter === 'irl' }" @click="modeFilter = 'irl'">
            {{ $t('pages.homepage.events.filters.irl') }}
          </button>
        </div>

        <select
          class="form-select form-select-sm filter-select"
          v-model="categoryFilter"
          @change="onCategoryChange"
        >
          <option value="all">{{ $t('pages.homepage.events.filters.category_all') }}</option>
          <option v-for="cat in allCategories" :key="cat" :value="cat">
            {{ $t(`categories.names.${cat}`) }}
          </option>
        </select>

        <select
          class="form-select form-select-sm filter-select"
          v-model="subcategoryFilter"
          :disabled="categoryFilter === 'all'"
        >
          <option value="all">{{ $t('pages.homepage.events.filters.sub_all') }}</option>
          <option v-for="sub in subcategories" :key="sub" :value="sub">
            {{ $t(`categories.subcategories.${sub}`, sub) }}
          </option>
        </select>

        <div class="flex-grow-1"></div>
        <span class="results-count">
          {{ $t('pages.homepage.events.results', { n: filteredEvents.length }) }}
        </span>
      </div>
    </div>
  </div>

  <!-- CONTENT -->
  <main class="container-fluid px-4 py-4">

    <!-- Upcoming -->
    <section class="mb-5">
      <div class="section-head">
        <h2>
          <font-awesome-icon :icon="['fas', 'calendar-day']" class="me-2" style="color: var(--ehub-primary)" />
          {{ $t('pages.homepage.events.sections.upcoming') }}
          <span v-if="upcomingEvents.length" class="count">({{ upcomingEvents.length }})</span>
        </h2>
        <a href="#" class="head-link">{{ $t('pages.homepage.events.sections.see_all') }}</a>
      </div>

      <div v-if="upcomingEvents.length" class="events-grid">
        <div
          v-for="event in upcomingEvents"
          :key="event.id"
          class="event-card"
          role="button"
          @click="navigateToEvent(event)"
        >
          <div class="event-cover" :style="catGradStyle(event.category)">
            <font-awesome-icon :icon="['fas', catIcon(event.category)]" class="cover-ico" />
            <div class="event-badges">
              <span class="ev-badge" :class="event.fee.currency === 'free' ? 'free' : 'paid'">
                {{ feeLabel(event) }}
              </span>
              <span class="ev-badge mode">
                <font-awesome-icon
                  :icon="['fas', event.runmode === 'online' ? 'wifi' : 'location-dot']"
                  class="me-1"
                />
                {{ event.runmode === 'online'
                  ? $t('pages.homepage.events.card.online')
                  : $t('pages.homepage.events.card.irl') }}
              </span>
            </div>
            <span class="cover-org">{{ event.org }}</span>
          </div>
          <div class="event-body">
            <p class="ev-title">{{ event.title }}</p>
            <div class="ev-meta">
              <font-awesome-icon :icon="['fas', 'location-dot']" />
              {{ event.location }}
            </div>
            <div class="ev-meta">
              <font-awesome-icon :icon="['fas', 'calendar-days']" />
              {{ formatDate(event.date_start) }}
            </div>
            <div class="ev-slots">
              <div class="bar">
                <span :style="{ width: slotsPercent(event) + '%', background: slotsBarColor(slotsPercent(event)) }"></span>
              </div>
              <span class="n">{{ event.slots.current }}/{{ event.slots.max }}</span>
            </div>
          </div>
          <div class="event-foot">
            <span class="cat-chip">{{ $t(`categories.names.${event.category}`) }}</span>
            <span class="cat-chip sub">{{ $t(`categories.subcategories.${event.subcategory}`, event.subcategory) }}</span>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="ico"><font-awesome-icon :icon="['fas', 'calendar']" /></div>
        <p class="mb-0">{{ $t('pages.homepage.events.empty_upcoming') }}</p>
      </div>
    </section>

    <!-- Latest -->
    <section>
      <div class="section-head">
        <h2>
          <font-awesome-icon :icon="['fas', 'bolt']" class="me-2" style="color: var(--ehub-gold)" />
          {{ $t('pages.homepage.events.sections.latest') }}
          <span v-if="latestEvents.length" class="count">({{ latestEvents.length }})</span>
        </h2>
        <a href="#" class="head-link">{{ $t('pages.homepage.events.sections.see_all') }}</a>
      </div>

      <div v-if="latestEvents.length" class="events-grid">
        <div
          v-for="event in latestEvents"
          :key="event.id"
          class="event-card"
          role="button"
          @click="navigateToEvent(event)"
        >
          <div class="event-cover" :style="catGradStyle(event.category)">
            <font-awesome-icon :icon="['fas', catIcon(event.category)]" class="cover-ico" />
            <div class="event-badges">
              <span class="ev-badge" :class="event.fee.currency === 'free' ? 'free' : 'paid'">
                {{ feeLabel(event) }}
              </span>
              <span class="ev-badge mode">
                <font-awesome-icon
                  :icon="['fas', event.runmode === 'online' ? 'wifi' : 'location-dot']"
                  class="me-1"
                />
                {{ event.runmode === 'online'
                  ? $t('pages.homepage.events.card.online')
                  : $t('pages.homepage.events.card.irl') }}
              </span>
            </div>
            <span class="cover-org">{{ event.org }}</span>
          </div>
          <div class="event-body">
            <p class="ev-title">{{ event.title }}</p>
            <div class="ev-meta">
              <font-awesome-icon :icon="['fas', 'location-dot']" />
              {{ event.location }}
            </div>
            <div class="ev-meta">
              <font-awesome-icon :icon="['fas', 'calendar-days']" />
              {{ formatDate(event.date_start) }}
            </div>
            <div class="ev-slots">
              <div class="bar">
                <span :style="{ width: slotsPercent(event) + '%', background: slotsBarColor(slotsPercent(event)) }"></span>
              </div>
              <span class="n">{{ event.slots.current }}/{{ event.slots.max }}</span>
            </div>
          </div>
          <div class="event-foot">
            <span class="cat-chip">{{ $t(`categories.names.${event.category}`) }}</span>
            <span class="cat-chip sub">{{ $t(`categories.subcategories.${event.subcategory}`, event.subcategory) }}</span>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="ico"><font-awesome-icon :icon="['fas', 'calendar']" /></div>
        <p class="mb-0">{{ $t('pages.homepage.events.empty_latest') }}</p>
      </div>
    </section>

  </main>

  <footer class="home-footer">
    {{ $t('pages.homepage.entrance.footer') }}
  </footer>
</template>

<style scoped>
.home-hero {
  position: relative;
  overflow: hidden;
  padding: 54px 20px 42px;
  text-align: center;
  border-bottom: 1px solid var(--ehub-line);
  background:
    radial-gradient(ellipse 60% 70% at 22% 10%, var(--ehub-glow) 0%, transparent 60%),
    radial-gradient(ellipse 50% 60% at 90% 100%, color-mix(in srgb, var(--ehub-gold) 10%, transparent) 0%, transparent 55%);
}
.home-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: repeating-linear-gradient(
    118deg,
    transparent 0 42px,
    color-mix(in srgb, var(--ehub-ink) 3%, transparent) 42px 44px
  );
}
.home-hero h1 {
  position: relative;
  font-size: clamp(1.9rem, 4vw, 2.7rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 12px;
  color: var(--ehub-ink);
}
.home-hero h1 .accent { color: var(--ehub-primary); }
.home-hero p {
  position: relative;
  color: var(--ehub-muted);
  font-size: 1.05rem;
  max-width: 540px;
  margin: 0 auto 24px;
}
.hero-search {
  position: relative;
  max-width: 520px;
  margin: 0 auto;
}

.filter-bar {
  position: sticky;
  top: 60px;
  z-index: 30;
  background: color-mix(in srgb, var(--ehub-page) 90%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--ehub-line);
  padding: 12px 0;
}
.filter-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.fb-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ehub-muted);
}
.filter-select {
  width: auto;
  min-width: 160px;
  max-width: 210px;
  flex: 0 0 auto;
}
.results-count {
  font-size: 0.82rem;
  color: var(--ehub-muted);
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: var(--ehub-muted);
}
.empty-state .ico {
  font-size: 2.2rem;
  opacity: 0.35;
  margin-bottom: 10px;
}

.home-footer {
  border-top: 1px solid var(--ehub-line);
  padding: 24px 20px;
  text-align: center;
  color: var(--ehub-muted);
  font-size: 0.82rem;
  margin-top: 32px;
}
</style>
