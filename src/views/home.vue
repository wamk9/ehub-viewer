<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import EhubFilterBar from '@/components/EhubFilterBar.vue'
import EhubEventFeed from '@/components/EhubEventFeed.vue'
import EhubEventCard from '@/components/EhubEventCard.vue'
import Event from '@/helpers/communication/Event.js'

const { t } = useI18n()
const store    = useStore()
const router   = useRouter()
const isLogged = computed(() => !!store.getters.getToken)

const ALL_CATEGORIES = [
  'simracing', 'esports-fps', 'esports-moba', 'esports-fighting',
  'esports-strategy', 'esports-sports', 'motorsport', 'motorbike',
  'cycling', 'running', 'swimming', 'triathlon', 'hiking', 'crossfit',
  'rowing', 'archery', 'chess', 'drone-racing',
]

const feeFilter      = ref('all')
const modeFilter     = ref('all')
const categoryFilter = ref('')
const statusFilter   = ref('all')
const searchQuery    = ref('')
const debouncedName  = ref('')

let debounceTimer = null
watch(searchQuery, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { debouncedName.value = val.trim() }, 400)
})

const eventsParams = computed(() => {
  const p = {}
  if (debouncedName.value)          p.name      = debouncedName.value
  if (modeFilter.value !== 'all')   p.runmode   = modeFilter.value
  if (categoryFilter.value)          p.category  = categoryFilter.value
  if (feeFilter.value === 'free')    p.price_max = 0
  if (feeFilter.value === 'paid')    p.price_min = 0.01
  if (statusFilter.value !== 'all')  p.status    = statusFilter.value
  return p
})

// ── All events (paginated grid) ─────────────────────────────────────
const PAGE_SIZE = 12
const eventsList    = ref([])
const eventsTotal   = ref(0)
const eventsPage    = ref(1)
const eventsLoading = ref(false)

const hasMoreEvents = computed(() => eventsList.value.length < eventsTotal.value)

async function fetchEvents(page = 1, append = false) {
  eventsLoading.value = true
  const result = await Event.search({ ...eventsParams.value, page, per_page: PAGE_SIZE })
  eventsLoading.value = false
  if (result.code !== 200) return
  eventsTotal.value = result.data.total
  eventsPage.value  = result.data.current_page
  eventsList.value  = append ? [...eventsList.value, ...result.data.data] : result.data.data
}

function loadMoreEvents() {
  fetchEvents(eventsPage.value + 1, true)
}

function goToEvent(event) {
  router.push(`/org/${event.org_route}/event/${event.route}`)
}

watch(eventsParams, () => fetchEvents(1), { deep: true })
onMounted(() => fetchEvents(1))
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
  <EhubFilterBar>
    <template #filters>
      <button class="fchip" :class="{ active: feeFilter === 'all' }"  @click="feeFilter = 'all'">
        {{ $t('pages.homepage.events.filters.all') }}
      </button>
      <button class="fchip" :class="{ active: feeFilter === 'free' }" @click="feeFilter = 'free'">
        {{ $t('pages.homepage.events.filters.free') }}
      </button>
      <button class="fchip" :class="{ active: feeFilter === 'paid' }" @click="feeFilter = 'paid'">
        {{ $t('pages.homepage.events.filters.paid') }}
      </button>
      <span class="fchip-sep"></span>
      <button class="fchip" :class="{ active: modeFilter === 'all' }"    @click="modeFilter = 'all'">
        {{ $t('pages.homepage.events.filters.all') }}
      </button>
      <button class="fchip" :class="{ active: modeFilter === 'online' }" @click="modeFilter = 'online'">
        {{ $t('pages.homepage.events.filters.online') }}
      </button>
      <button class="fchip" :class="{ active: modeFilter === 'irl' }"    @click="modeFilter = 'irl'">
        {{ $t('pages.homepage.events.filters.irl') }}
      </button>
      <span class="fchip-sep"></span>
      <div class="fchip-sel">
        <select v-model="categoryFilter" class="fchip-select">
          <option value="">{{ $t('pages.homepage.events.filters.category_all') }}</option>
          <option v-for="cat in ALL_CATEGORIES" :key="cat" :value="cat">
            {{ $t(`categories.names.${cat}`) }}
          </option>
        </select>
      </div>
      <span class="fchip-sep"></span>
      <button class="fchip" :class="{ active: statusFilter === 'all' }" @click="statusFilter = 'all'">
        {{ $t('pages.homepage.events.filters.status.all') }}
      </button>
      <button class="fchip" :class="{ active: statusFilter === 'open' }" @click="statusFilter = 'open'">
        {{ $t('pages.homepage.events.filters.status.open') }}
      </button>
      <button class="fchip" :class="{ active: statusFilter === 'in_progress' }" @click="statusFilter = 'in_progress'">
        {{ $t('pages.homepage.events.filters.status.in_progress') }}
      </button>
      <button class="fchip" :class="{ active: statusFilter === 'full' }" @click="statusFilter = 'full'">
        {{ $t('pages.homepage.events.filters.status.full') }}
      </button>
      <button class="fchip" :class="{ active: statusFilter === 'closed' }" @click="statusFilter = 'closed'">
        {{ $t('pages.homepage.events.filters.status.closed') }}
      </button>
    </template>
  </EhubFilterBar>

  <!-- CONTENT -->
  <main class="container-fluid px-4 py-4">
    <div class="home-feeds">
      <!-- Auth feeds: only when logged in -->
      <template v-if="isLogged">
        <EhubEventFeed type="following_orgs"  />
        <EhubEventFeed type="following_teams" />
      </template>

      <div class="feed-divider"></div>

      <!-- All available events -->
      <section class="all-events-section">
        <div v-if="eventsTotal" class="ae-header">
          <span class="ae-count">{{ $t('pages.homepage.events.results', { n: eventsTotal }) }}</span>
        </div>

        <!-- Loading -->
        <div v-if="eventsLoading && !eventsList.length" class="events-grid">
          <div v-for="i in 8" :key="i" class="skel" :style="{ height: '340px', borderRadius: '16px', animationDelay: (i * 0.06) + 's' }"></div>
        </div>

        <!-- Empty -->
        <div v-else-if="!eventsList.length" class="ae-empty">
          <div class="ae-empty-card">
            <font-awesome-icon :icon="['fas', 'calendar-days']" />
            <span>{{ $t('pages.homepage.events.empty') }}</span>
          </div>
        </div>

        <!-- Grid -->
        <template v-else>
          <div class="events-grid">
            <div v-for="event in eventsList" :key="event.id" class="ae-card-wrap" @click="goToEvent(event)">
              <EhubEventCard :event="event" :org-color="event.org_color" :org-name="event.org_name" />
            </div>
          </div>

          <div class="ae-loadmore">
            <button v-if="hasMoreEvents" class="btn btn-outline-primary round px-4" :disabled="eventsLoading" @click="loadMoreEvents">
              {{ $t('pages.homepage.events.load_more') }}
            </button>
            <p v-else class="ae-all-loaded">{{ $t('pages.homepage.events.all_loaded') }}</p>
          </div>
        </template>
      </section>
    </div>
  </main>
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

.home-feeds {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.feed-divider {
  border-top: 1px solid var(--ehub-line);
}

/* ── All events section ── */
.ae-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px 12px;
}
.ae-count {
  font-size: .85rem;
  color: var(--ehub-muted);
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.ae-card-wrap { cursor: pointer; }

.ae-empty {
  display: flex;
  justify-content: flex-start;
  padding: 8px 4px;
}
.ae-empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  max-width: 300px;
  min-height: 340px;
  padding: 32px 20px;
  border: 1px dashed var(--ehub-line);
  border-radius: 16px;
  background: var(--ehub-field-bg);
  color: var(--ehub-muted);
  font-size: .88rem;
  text-align: center;
}
.ae-empty-card svg {
  font-size: 1.5rem;
  opacity: .5;
}

.ae-loadmore {
  text-align: center;
  margin-top: 28px;
}
.ae-all-loaded {
  color: var(--ehub-muted);
  font-size: .85rem;
  margin: 0;
}
</style>
