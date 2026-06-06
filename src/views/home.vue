<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import VideoBackground from 'vue-responsive-video-background-player'
import videoBg from '@/assets/images/ehub-entrance.mp4'
import { mockEvents } from '@/helpers/mock/events.js'

const { t } = useI18n()
const router = useRouter()

// --- Filter state ---
const searchQuery = ref('')

// --- Mock events ---
const events = mockEvents

// --- Computed filters ---
const filteredEvents = computed(() => {
  let list = events
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(e =>
      e.title.toLowerCase().includes(q) || e.org.toLowerCase().includes(q)
    )
  }
  return list
})

// --- Pagination (load-more style) ---
const PAGE_SIZE = 8
const visibleCount = ref(PAGE_SIZE)
const visibleEvents = computed(() => filteredEvents.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < filteredEvents.value.length)
const loadProgress = computed(() =>
  filteredEvents.value.length === 0
    ? 100
    : Math.round((visibleCount.value / filteredEvents.value.length) * 100)
)

watch(searchQuery, () => {
  visibleCount.value = PAGE_SIZE
})

function loadMore() { visibleCount.value += PAGE_SIZE }

// --- Navigation ---
function handleHeroSearch() { router.push({ name: 'search', query: { q: searchQuery.value } }) }

// --- Helpers ---
function slotsPercent(e) { return Math.round((e.slots.current / e.slots.max) * 100) }
function slotsBarClass(e) {
  const p = slotsPercent(e)
  if (p >= 90) return 'bg-danger'
  if (p >= 60) return 'bg-warning'
  return 'bg-success'
}
function formatFee(e) {
  if (e.fee.currency === 'free') return t('events.manage.fee.free')
  if (e.fee.currency === 'brl') return t('events.manage.fee.brl', { fee: e.fee.value })
  return t('events.manage.fee.usd', { fee: e.fee.value })
}
function feeClass(e) { return e.fee.currency === 'free' ? 'bg-primary' : 'bg-success' }
function runmodeLabel(e) { return e.runmode === 'online' ? 'Online' : 'IRL' }
function runmodeClass(e) { return e.runmode === 'online' ? 'bg-info text-dark' : 'bg-warning text-dark' }
function navigateToEvent(e) { router.push(`/tournament/${e.route}`) }
function goCreateOrg() { router.push('/create-org') }
</script>

<template>
  <!-- HERO -->
  <video-background id="bg-video-container" :src="videoBg"
    style="height: 88vh; width: 100%;"
    overlay="linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.75) 100%)">
    <div class="d-flex flex-column justify-content-center align-items-center h-100 text-center px-3">
      <h1 class="hero-title">{{ $t("pages.homepage.entrance.title") }}</h1>
      <p class="hero-subtitle mb-4">{{ $t("pages.homepage.entrance.subtitle") }}</p>
      <div class="search-container mb-4">
        <div class="input-group input-group-lg shadow">
          <input v-model="searchQuery" type="text" class="form-control search-input"
            :placeholder="$t('pages.homepage.entrance.search_placeholder')"
            @keyup.enter="handleHeroSearch">
          <button class="btn btn-primary px-4" @click="handleHeroSearch">
            <font-awesome-icon icon="magnifying-glass" />
          </button>
        </div>
      </div>
      <button class="btn btn-warning btn-lg fw-bold px-5 shadow" @click="goCreateOrg">
        <font-awesome-icon icon="calendar-plus" class="me-2" />
        {{ $t('pages.homepage.entrance.create_button') }}
      </button>
    </div>
  </video-background>

  <!-- EVENTS GRID -->
  <div class="container-fluid px-4 py-4">
    <!-- Empty state -->
    <div v-if="filteredEvents.length === 0" class="text-center text-muted py-5">
      <font-awesome-icon icon="magnifying-glass" size="2x" class="mb-3 d-block mx-auto opacity-50" />
      <p class="mb-0">{{ $t('pages.homepage.events.empty') }}</p>
    </div>

    <!-- Cards -->
    <div v-else>
      <div class="row g-3">
        <div v-for="event in visibleEvents" :key="event.id"
          class="col-12 col-sm-6 col-md-4 col-lg-3 col-xxl-2">
          <div class="event-card card h-100 border-0 shadow-sm" @click="navigateToEvent(event)" role="button">
            <div class="event-thumb position-relative">
              <div class="ratio ratio-16x9">
                <img :src="event.image" :alt="event.title" class="event-img rounded-top">
              </div>
              <span class="badge position-absolute top-0 start-0 m-2" :class="runmodeClass(event)">
                {{ runmodeLabel(event) }}
              </span>
              <span class="badge position-absolute top-0 end-0 m-2" :class="feeClass(event)">
                {{ formatFee(event) }}
              </span>
            </div>
            <div class="card-body px-3 py-2">
              <h6 class="event-title fw-bold mb-0 text-truncate" :title="event.title">{{ event.title }}</h6>
              <small class="text-muted">{{ event.org }}</small>
              <div class="d-flex align-items-center gap-2 mt-2 mb-2">
                <div class="progress flex-grow-1" style="height: 5px;">
                  <div class="progress-bar" :class="slotsBarClass(event)"
                    :style="{ width: slotsPercent(event) + '%' }"></div>
                </div>
                <small class="text-muted text-nowrap fw-semibold">{{ event.slots.current }}/{{ event.slots.max }}</small>
              </div>
              <small class="text-muted d-block">
                <font-awesome-icon icon="location-dot" class="me-1 text-primary" />{{ event.location }}
              </small>
              <small class="text-muted d-block">
                <font-awesome-icon icon="calendar-days" class="me-1 text-primary" />{{ event.date_start }}
              </small>
            </div>
            <div class="card-footer px-3 py-2 border-0 bg-transparent">
              <span class="badge bg-secondary">{{ t(`categories.names.${event.category}`) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Load more -->
      <div v-if="filteredEvents.length > 0" class="load-more-area mt-5 text-center">
        <!-- Progress bar -->
        <div class="load-progress-container mx-auto mb-3">
          <div class="d-flex justify-content-between mb-1">
            <small class="text-muted">
              {{ t('pages.homepage.events.showing', {
                visible: Math.min(visibleCount, filteredEvents.length),
                total: filteredEvents.length
              }) }}
            </small>
            <small class="text-muted">{{ loadProgress }}%</small>
          </div>
          <div class="progress" style="height: 6px;">
            <div class="progress-bar bg-primary transition-width"
              :style="{ width: loadProgress + '%' }"></div>
          </div>
        </div>

        <button v-if="hasMore"
          class="btn btn-outline-primary px-5"
          @click="loadMore">
          <font-awesome-icon icon="magnifying-glass" class="me-2" />
          {{ $t('pages.homepage.events.load_more') }}
          <span class="badge bg-primary ms-2">+{{ Math.min(PAGE_SIZE, filteredEvents.length - visibleCount) }}</span>
        </button>
        <p v-else class="text-muted small mt-2 mb-0">
          {{ $t('pages.homepage.events.all_loaded') }}
        </p>
      </div>
    </div>
  </div>

  <!-- CTA -->
  <div class="cta-section py-5 mt-4">
    <div class="container text-center px-4">
      <h2 class="cta-title fw-bold mb-2">{{ $t('pages.homepage.cta.title') }}</h2>
      <p class="cta-subtitle mb-5">{{ $t('pages.homepage.cta.subtitle') }}</p>
      <div class="row justify-content-center g-4 mb-5">
        <div class="col-12 col-md-4">
          <div class="cta-step p-4 rounded-4 h-100">
            <div class="cta-step-number mb-3">1</div>
            <font-awesome-icon icon="calendar-plus" size="2x" class="text-primary mb-3" />
            <h5 class="fw-bold text-white">{{ $t('pages.homepage.cta.step1.title') }}</h5>
            <p class="cta-step-desc">{{ $t('pages.homepage.cta.step1.description') }}</p>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="cta-step p-4 rounded-4 h-100">
            <div class="cta-step-number mb-3">2</div>
            <font-awesome-icon icon="people-group" size="2x" class="text-primary mb-3" />
            <h5 class="fw-bold text-white">{{ $t('pages.homepage.cta.step2.title') }}</h5>
            <p class="cta-step-desc">{{ $t('pages.homepage.cta.step2.description') }}</p>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="cta-step p-4 rounded-4 h-100">
            <div class="cta-step-number mb-3">3</div>
            <font-awesome-icon icon="trophy" size="2x" class="text-primary mb-3" />
            <h5 class="fw-bold text-white">{{ $t('pages.homepage.cta.step3.title') }}</h5>
            <p class="cta-step-desc">{{ $t('pages.homepage.cta.step3.description') }}</p>
          </div>
        </div>
      </div>
      <button class="btn btn-warning btn-lg px-5 fw-bold shadow" @click="goCreateOrg">
        {{ $t('pages.homepage.cta.button') }}
        <font-awesome-icon icon="trophy" class="ms-2" />
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Hero */
.hero-title {
  color: white;
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 800;
  text-shadow: 0 2px 12px rgba(0,0,0,0.6);
  line-height: 1.1;
}
.hero-subtitle {
  color: rgba(255,255,255,0.9);
  font-size: clamp(1rem, 2vw, 1.25rem);
  max-width: 580px;
  text-shadow: 0 1px 6px rgba(0,0,0,0.5);
}
.search-container { width: 100%; max-width: 580px; }
.search-input { border-right: 0; }
.search-input:focus { box-shadow: none; border-color: #dee2e6; }

/* Event cards */
.event-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 10px;
  overflow: hidden;
}
.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0,0,0,0.18) !important;
}
.event-img {
  object-fit: cover;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}
.event-card:hover .event-img { transform: scale(1.04); }
.event-title { font-size: 0.9rem; }

/* Load more */
.load-progress-container { max-width: 400px; }
.transition-width { transition: width 0.4s ease; }

/* CTA */
.cta-section {
  background: linear-gradient(135deg, #0f0c29 0%, #1a1035 50%, #0f3460 100%);
}
.cta-title { color: white; font-size: clamp(1.5rem, 4vw, 2.2rem); }
.cta-subtitle { color: rgba(255,255,255,0.65); max-width: 560px; margin: 0 auto; }
.cta-step {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  transition: background 0.2s;
}
.cta-step:hover { background: rgba(255,255,255,0.1); }
.cta-step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bs-primary);
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
.cta-step-desc { color: rgba(255,255,255,0.6); font-size: 0.9rem; margin-bottom: 0; }
</style>

<style>
#bg-video-container video {
  filter: grayscale(60%) brightness(0.3);
}
.navbar {
  background: rgba(0,0,0,0.4) !important;
}
</style>
