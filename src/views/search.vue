<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import CategoryApi from '@/helpers/communication/Category'
import EventApi from '@/helpers/communication/Event'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const MAX_PRICE = 500

// ─── Filter state ───────────────────────────────────────────
const filters = reactive({
  name: '',
  categories: [],
  subcategories: [],
  modes: [],
  priceMin: 0,
  priceMax: MAX_PRICE,
  fillMin: 0,
  fillMax: 100,
  dateFrom: '',
  dateTo: '',
})

const categorySearch = ref('')
const subcategorySearch = ref('')
const showCategoryDropdown = ref(false)
const showSubcategoryDropdown = ref(false)

// ─── Categories from API ─────────────────────────────────────
const allCategories = ref([])
const subcategoryMap = ref({})

const categoryModesMap = ref({})

async function loadCategories() {
  const result = await CategoryApi.getAll()
  if (result.code === 200) {
    allCategories.value = result.data.map(c => ({
      key: c.route,
      label: t(`categories.names.${c.route}`, c.route),
    }))
    result.data.forEach(c => {
      categoryModesMap.value[c.route] = c.runmodes?.map(r => r.key) ?? ['irl', 'online']
    })
  }
}

async function loadSubcategories(categoryRoutes) {
  for (const catRoute of categoryRoutes) {
    if (subcategoryMap.value[catRoute]) continue
    const result = await CategoryApi.getSubcategories(catRoute)
    if (result.code === 200) {
      subcategoryMap.value[catRoute] = result.data.map(s => ({ key: s.route, label: s.name }))
    }
  }
}

// ─── Derived options ─────────────────────────────────────────
const availableSubcategories = computed(() => {
  if (!filters.categories.length) return []
  return filters.categories.flatMap(c => subcategoryMap.value[c] || [])
})

const hasSubcategories = computed(() =>
  filters.categories.length > 0 && availableSubcategories.value.length > 0
)

const availableModes = computed(() => {
  if (!filters.categories.length) return { irl: true, online: true }
  const allowed = new Set(filters.categories.flatMap(c => categoryModesMap.value[c] ?? ['irl', 'online']))
  return { irl: allowed.has('irl'), online: allowed.has('online') }
})

watch(availableModes, (modes) => {
  if (!modes.irl) filters.modes = filters.modes.filter(m => m !== 'irl')
  if (!modes.online) filters.modes = filters.modes.filter(m => m !== 'online')
})

const filteredCategoryOptions = computed(() => {
  const q = categorySearch.value.toLowerCase()
  return allCategories.value.filter(c =>
    !filters.categories.includes(c.key) &&
    (!q || c.label.toLowerCase().includes(q))
  )
})

const filteredSubcategoryOptions = computed(() => {
  const q = subcategorySearch.value.toLowerCase()
  return availableSubcategories.value.filter(s =>
    !filters.subcategories.includes(s.key) &&
    (!q || s.label.toLowerCase().includes(q))
  )
})

function addCategory(key) {
  if (!filters.categories.includes(key)) {
    filters.categories.push(key)
    loadSubcategories([key])
  }
  categorySearch.value = ''
  showCategoryDropdown.value = false
}
function removeCategory(key) {
  filters.categories = filters.categories.filter(k => k !== key)
  const validSubs = new Set(
    filters.categories.flatMap(c => (subcategoryMap.value[c] || []).map(s => s.key))
  )
  filters.subcategories = filters.subcategories.filter(k => validSubs.has(k))
}
function addSubcategory(key) {
  if (!filters.subcategories.includes(key)) filters.subcategories.push(key)
  subcategorySearch.value = ''
  showSubcategoryDropdown.value = false
}
function removeSubcategory(key) {
  filters.subcategories = filters.subcategories.filter(k => k !== key)
}

function categoryLabel(key) { return allCategories.value.find(c => c.key === key)?.label || key }
function subcategoryLabel(key) {
  return t(`categories.subcategories.${key}`, key)
}

// ─── Mode toggle ─────────────────────────────────────────────
function toggleMode(mode) {
  if (filters.modes.includes(mode)) {
    filters.modes = filters.modes.filter(m => m !== mode)
  } else {
    filters.modes.push(mode)
  }
}

// ─── Price dual-range ────────────────────────────────────────
function onPriceMinInput(e) {
  filters.priceMin = Math.min(Number(e.target.value), filters.priceMax)
}
function onPriceMaxInput(e) {
  filters.priceMax = Math.max(Number(e.target.value), filters.priceMin)
}

const priceFillStyle = computed(() => {
  const pct = (v) => (v / MAX_PRICE) * 100
  return {
    left: pct(filters.priceMin) + '%',
    width: Math.max(0, pct(filters.priceMax) - pct(filters.priceMin)) + '%',
  }
})

const fillFillStyle = computed(() => ({
  left: filters.fillMin + '%',
  width: Math.max(0, filters.fillMax - filters.fillMin) + '%',
}))

function onFillMinInput(e) {
  filters.fillMin = Math.min(Number(e.target.value), filters.fillMax)
}
function onFillMaxInput(e) {
  filters.fillMax = Math.max(Number(e.target.value), filters.fillMin)
}

function formatPrice(v) { return v === 0 ? t('events.manage.fee.free') : `R$ ${v}` }

// ─── API search ───────────────────────────────────────────────
const PAGE_SIZE = 12
const events = ref([])
const totalCount = ref(0)
const currentPage = ref(1)
const loading = ref(false)

const hasMore = computed(() => events.value.length < totalCount.value)
const loadProgress = computed(() =>
  totalCount.value === 0 ? 100
    : Math.round((events.value.length / totalCount.value) * 100)
)

let searchDebounce = null

function buildParams(page = 1) {
  const params = { page, per_page: PAGE_SIZE }
  if (filters.name.trim()) params.name = filters.name.trim()
  if (filters.categories.length) params['category[]'] = filters.categories
  if (filters.subcategories.length) params['subcategory[]'] = filters.subcategories
  if (filters.modes.length === 1) params.runmode = filters.modes[0]
  if (filters.priceMin > 0) params.price_min = filters.priceMin
  if (filters.priceMax < MAX_PRICE) params.price_max = filters.priceMax
  if (filters.fillMin > 0) params.fill_min = filters.fillMin
  if (filters.fillMax < 100) params.fill_max = filters.fillMax
  if (filters.dateFrom) params.date_from = filters.dateFrom
  if (filters.dateTo) params.date_to = filters.dateTo
  return params
}

async function fetchPage(page = 1, append = false) {
  loading.value = true
  try {
    const result = await EventApi.search(buildParams(page))
    if (result.code === 200) {
      const payload = result.data
      totalCount.value = payload.total
      currentPage.value = payload.current_page
      if (append) {
        events.value.push(...payload.data)
      } else {
        events.value = payload.data
      }
    }
  } finally {
    loading.value = false
  }
}

function triggerSearch() {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => fetchPage(1), 300)
}

function loadMore() {
  fetchPage(currentPage.value + 1, true)
}

watch(
  () => [
    filters.name, filters.categories, filters.subcategories, filters.modes,
    filters.priceMin, filters.priceMax, filters.fillMin, filters.fillMax,
    filters.dateFrom, filters.dateTo,
  ],
  triggerSearch,
  { deep: true }
)

// ─── Helpers ─────────────────────────────────────────────────
function slotsPercent(e) {
  if (!e.max_registrations) return 0
  return Math.round((e.subscription_count / e.max_registrations) * 100)
}
function slotsBarClass(e) {
  const p = slotsPercent(e)
  return p >= 90 ? 'bg-danger' : p >= 60 ? 'bg-warning' : 'bg-success'
}
function formatFee(e) {
  if (!e.price || e.price === 0) return t('events.manage.fee.free')
  if (e.currency_iso === 'USD') return t('events.manage.fee.usd', { fee: e.price })
  return t('events.manage.fee.brl', { fee: e.price })
}
function feeClass(e) { return (!e.price || e.price === 0) ? 'bg-primary' : 'bg-success' }
function runmodeLabel(e) { return e.runmode === 'online' ? 'Online' : 'IRL' }
function runmodeClass(e) { return e.runmode === 'online' ? 'bg-info text-dark' : 'bg-warning text-dark' }
function navigateToEvent(e) { router.push(`/org/${e.org_route}/event/${e.route}`) }

function clearFilters() {
  filters.name = ''
  filters.categories = []
  filters.subcategories = []
  filters.modes = []
  filters.priceMin = 0
  filters.priceMax = MAX_PRICE
  filters.fillMin = 0
  filters.fillMax = 100
  filters.dateFrom = ''
  filters.dateTo = ''
}

const hasActiveFilters = computed(() =>
  filters.name || filters.categories.length || filters.subcategories.length ||
  filters.modes.length || filters.priceMin > 0 || filters.priceMax < MAX_PRICE ||
  filters.fillMin > 0 || filters.fillMax < 100 || filters.dateFrom || filters.dateTo
)

onMounted(async () => {
  await loadCategories()
  if (route.query.q) filters.name = String(route.query.q)
  fetchPage(1)
})

const showMobileFilters = ref(false)
</script>

<template>
  <div class="search-page">

    <!-- Page header -->
    <div class="search-header bg-dark text-white py-3 px-4">
      <div class="container-fluid">
        <div class="d-flex align-items-center gap-3">
          <div class="flex-grow-1">
            <h5 class="mb-0 fw-bold">{{ $t('pages.search.title') }}</h5>
          </div>
          <button class="btn btn-outline-secondary btn-sm d-lg-none" @click="showMobileFilters = !showMobileFilters">
            <font-awesome-icon icon="sliders" class="me-1" />{{ $t('pages.search.toggle_filters') }}
          </button>
        </div>
      </div>
    </div>

    <div class="container-fluid px-0">
      <div class="row g-0">

        <!-- ── FILTER SIDEBAR ── -->
        <div class="col-12 col-lg-3 filter-sidebar border-end"
          :class="{ 'd-none d-lg-block': !showMobileFilters }">
          <div class="p-3 d-flex flex-column gap-4">

            <!-- Name / description -->
            <div class="filter-group">
              <label class="filter-label">
                <font-awesome-icon icon="magnifying-glass" class="me-2 text-primary" />
                {{ $t('pages.search.filters.name') }}
              </label>
              <input v-model="filters.name" type="text" class="form-control form-control-sm"
                :placeholder="$t('pages.search.filters.name_placeholder')" />
              <small class="text-muted mt-1 d-block">{{ $t('pages.search.filters.name_hint') }}</small>
            </div>

            <!-- Categories -->
            <div class="filter-group">
              <label class="filter-label">
                <font-awesome-icon icon="trophy" class="me-2 text-primary" />
                {{ $t('pages.search.filters.category') }}
              </label>
              <div v-if="filters.categories.length" class="d-flex flex-wrap gap-1 mb-2">
                <span v-for="key in filters.categories" :key="key"
                  class="badge bg-primary tag-badge">
                  {{ categoryLabel(key) }}
                  <button class="tag-remove ms-1" @click="removeCategory(key)">×</button>
                </span>
              </div>
              <div class="position-relative">
                <input v-model="categorySearch" type="text" class="form-control form-control-sm"
                  :placeholder="$t('pages.search.filters.category_placeholder')"
                  @focus="showCategoryDropdown = true"
                  @blur="setTimeout(() => showCategoryDropdown = false, 150)" />
                <div v-if="showCategoryDropdown && filteredCategoryOptions.length"
                  class="filter-dropdown">
                  <button v-for="cat in filteredCategoryOptions" :key="cat.key"
                    class="filter-dropdown-item" @mousedown.prevent="addCategory(cat.key)">
                    {{ cat.label }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Subcategories -->
            <div class="filter-group" v-if="hasSubcategories">
              <label class="filter-label">
                <font-awesome-icon icon="sliders" class="me-2 text-primary" />
                {{ $t('pages.search.filters.subcategory') }}
              </label>
              <div v-if="filters.subcategories.length" class="d-flex flex-wrap gap-1 mb-2">
                <span v-for="key in filters.subcategories" :key="key"
                  class="badge bg-secondary tag-badge">
                  {{ subcategoryLabel(key) }}
                  <button class="tag-remove ms-1" @click="removeSubcategory(key)">×</button>
                </span>
              </div>
              <div class="position-relative">
                <input v-model="subcategorySearch" type="text" class="form-control form-control-sm"
                  :placeholder="$t('pages.search.filters.subcategory_placeholder')"
                  @focus="showSubcategoryDropdown = true"
                  @blur="setTimeout(() => showSubcategoryDropdown = false, 150)" />
                <div v-if="showSubcategoryDropdown && filteredSubcategoryOptions.length"
                  class="filter-dropdown">
                  <button v-for="sub in filteredSubcategoryOptions" :key="sub.key"
                    class="filter-dropdown-item" @mousedown.prevent="addSubcategory(sub.key)">
                    {{ sub.label }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Event type -->
            <div class="filter-group">
              <label class="filter-label">
                <font-awesome-icon icon="location-dot" class="me-2 text-primary" />
                {{ $t('pages.search.filters.type') }}
              </label>
              <div class="btn-group w-100" role="group">
                <button class="btn btn-sm mode-btn"
                  :class="[
                    filters.modes.includes('irl') ? 'btn-warning text-dark' : 'btn-outline-warning',
                    { 'mode-btn--disabled': !availableModes.irl }
                  ]"
                  :disabled="!availableModes.irl"
                  :title="!availableModes.irl ? $t('pages.search.filters.mode_unavailable') : ''"
                  @click="toggleMode('irl')">
                  <font-awesome-icon icon="location-dot" class="me-1" />IRL
                </button>
                <button class="btn btn-sm mode-btn"
                  :class="[
                    filters.modes.includes('online') ? 'btn-info text-dark' : 'btn-outline-info',
                    { 'mode-btn--disabled': !availableModes.online }
                  ]"
                  :disabled="!availableModes.online"
                  :title="!availableModes.online ? $t('pages.search.filters.mode_unavailable') : ''"
                  @click="toggleMode('online')">
                  <font-awesome-icon icon="magnifying-glass" class="me-1" />Online
                </button>
              </div>
              <small class="text-muted mt-1 d-block">
                {{ filters.modes.length === 0 ? $t('pages.search.filters.type_all') : '' }}
              </small>
            </div>

            <!-- Price range -->
            <div class="filter-group">
              <label class="filter-label">
                <font-awesome-icon icon="file-lines" class="me-2 text-primary" />
                {{ $t('pages.search.filters.price') }}
              </label>
              <div class="d-flex justify-content-between mb-2">
                <small class="text-muted fw-semibold">{{ formatPrice(filters.priceMin) }}</small>
                <small class="text-muted fw-semibold">{{ formatPrice(filters.priceMax) }}</small>
              </div>
              <div class="dual-range-wrap">
                <div class="dual-range-track">
                  <div class="dual-range-fill" :style="priceFillStyle"></div>
                </div>
                <input type="range" class="range-thumb" :min="0" :max="MAX_PRICE" step="5"
                  :value="filters.priceMin" @input="onPriceMinInput" />
                <input type="range" class="range-thumb" :min="0" :max="MAX_PRICE" step="5"
                  :value="filters.priceMax" @input="onPriceMaxInput" />
              </div>
              <div class="d-flex justify-content-between mt-1">
                <small class="text-muted">{{ $t('pages.search.filters.price_free') }}</small>
                <small class="text-muted">R$ {{ MAX_PRICE }}</small>
              </div>
            </div>

            <!-- Fill % -->
            <div class="filter-group">
              <label class="filter-label">
                <font-awesome-icon icon="people-group" class="me-2 text-primary" />
                {{ $t('pages.search.filters.fill') }}
              </label>
              <div class="d-flex justify-content-between mb-2">
                <small class="text-muted fw-semibold">{{ filters.fillMin }}%</small>
                <small class="text-muted fw-semibold">{{ filters.fillMax }}%</small>
              </div>
              <div class="dual-range-wrap">
                <div class="dual-range-track">
                  <div class="dual-range-fill" :style="fillFillStyle"></div>
                </div>
                <input type="range" class="range-thumb" min="0" max="100" step="1"
                  :value="filters.fillMin" @input="onFillMinInput" />
                <input type="range" class="range-thumb" min="0" max="100" step="1"
                  :value="filters.fillMax" @input="onFillMaxInput" />
              </div>
              <div class="d-flex justify-content-between mt-1">
                <small class="text-muted">0%</small>
                <small class="text-muted">100%</small>
              </div>
            </div>

            <!-- Start date -->
            <div class="filter-group">
              <label class="filter-label">
                <font-awesome-icon icon="calendar-days" class="me-2 text-primary" />
                {{ $t('pages.search.filters.date') }}
              </label>
              <div class="d-flex flex-column gap-2">
                <div>
                  <label class="small text-muted mb-1">{{ $t('pages.search.filters.date_from') }}</label>
                  <input v-model="filters.dateFrom" type="date" class="form-control form-control-sm" />
                </div>
                <div>
                  <label class="small text-muted mb-1">{{ $t('pages.search.filters.date_to') }}</label>
                  <input v-model="filters.dateTo" type="date" class="form-control form-control-sm" />
                </div>
              </div>
            </div>

            <!-- Clear -->
            <button v-if="hasActiveFilters" class="btn btn-outline-danger btn-sm w-100" @click="clearFilters">
              <font-awesome-icon icon="check" class="me-1" />
              {{ $t('pages.search.filters.clear') }}
            </button>

          </div>
        </div>

        <!-- ── RESULTS ── -->
        <div class="col-12 col-lg-9 results-area">
          <div class="px-4 py-3">

            <!-- Result count -->
            <div class="d-flex align-items-center justify-content-between mb-3">
              <span class="text-muted small">
                {{ $t('pages.search.results.count', { count: totalCount }) }}
              </span>
              <span v-if="hasActiveFilters" class="badge bg-primary">
                {{ $t('pages.search.results.filtered') }}
              </span>
            </div>

            <!-- Loading -->
            <div v-if="loading && !events.length">
              <div class="row g-3">
                <div v-for="i in 6" :key="i" class="col-12 col-sm-6 col-xl-4">
                  <div class="skel" :style="{ height: '280px', borderRadius: '10px', animationDelay: (i * 0.08) + 's' }"></div>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-else-if="!loading && events.length === 0" class="text-center text-muted py-5">
              <font-awesome-icon icon="magnifying-glass" size="3x" class="mb-3 d-block mx-auto opacity-25" />
              <p class="mb-2">{{ $t('pages.search.results.empty') }}</p>
              <button class="btn btn-outline-secondary btn-sm" @click="clearFilters">
                {{ $t('pages.search.filters.clear') }}
              </button>
            </div>

            <!-- Cards grid -->
            <div v-else>
              <div class="row g-3">
                <div v-for="event in events" :key="event.id"
                  class="col-12 col-sm-6 col-xl-4">
                  <div class="event-card card h-100 border-0 shadow-sm"
                    @click="navigateToEvent(event)" role="button">
                    <div class="event-thumb position-relative">
                      <div class="ratio ratio-16x9">
                        <img :src="event.logo_url || '/images/event-placeholder.webp'"
                          :alt="event.name" class="event-img rounded-top">
                      </div>
                      <span class="badge position-absolute top-0 start-0 m-2" :class="runmodeClass(event)">
                        {{ runmodeLabel(event) }}
                      </span>
                      <span class="badge position-absolute top-0 end-0 m-2" :class="feeClass(event)">
                        {{ formatFee(event) }}
                      </span>
                    </div>
                    <div class="card-body px-3 py-2">
                      <h6 class="fw-bold mb-0 text-truncate" :title="event.name">{{ event.name }}</h6>
                      <small class="text-muted d-block mb-2">{{ event.org_name }}</small>
                      <p class="small text-muted mb-2 event-desc">{{ event.description }}</p>
                      <div class="d-flex align-items-center gap-2 mb-2">
                        <div class="progress flex-grow-1" style="height: 5px;">
                          <div class="progress-bar" :class="slotsBarClass(event)"
                            :style="{ width: slotsPercent(event) + '%' }"></div>
                        </div>
                        <small class="text-muted text-nowrap">
                          {{ event.subscription_count }}/{{ event.max_registrations }}
                        </small>
                      </div>
                      <small v-if="event.start_at" class="text-muted d-block">
                        <font-awesome-icon icon="calendar-days" class="me-1 text-primary" />{{ event.start_at }}
                      </small>
                    </div>
                    <div class="card-footer px-3 py-2 border-0 bg-transparent">
                      <span class="badge bg-secondary me-1">{{ $t('categories.names.' + event.category, event.category) }}</span>
                      <span v-if="event.subcategory" class="badge bg-dark">{{ $t('categories.subcategories.' + event.subcategory, event.subcategory) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Load more -->
              <div class="mt-5 text-center">
                <div class="load-progress-container mx-auto mb-3">
                  <div class="d-flex justify-content-between mb-1">
                    <small class="text-muted">
                      {{ $t('pages.homepage.events.showing', {
                        visible: events.length,
                        total: totalCount
                      }) }}
                    </small>
                    <small class="text-muted">{{ loadProgress }}%</small>
                  </div>
                  <div class="progress" style="height: 6px;">
                    <div class="progress-bar bg-primary" :style="{ width: loadProgress + '%' }"></div>
                  </div>
                </div>
                <button v-if="hasMore" class="btn btn-outline-primary px-5" @click="loadMore"
                  :disabled="loading">
                  <font-awesome-icon icon="magnifying-glass" class="me-2" />
                  {{ $t('pages.homepage.events.load_more') }}
                </button>
                <p v-else class="text-muted small mb-0">{{ $t('pages.homepage.events.all_loaded') }}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-header { border-bottom: 1px solid rgba(255,255,255,0.1); }

/* Sidebar */
.filter-sidebar {
  min-height: calc(100vh - 110px);
  background: var(--bs-body-bg);
  border-color: var(--bs-border-color) !important;
}

/* Filter groups */
.filter-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--bs-secondary-color);
  margin-bottom: 8px;
  display: block;
}

/* Tag badges */
.tag-badge {
  font-size: 0.75rem;
  padding: 4px 8px;
  display: inline-flex;
  align-items: center;
}
.tag-remove {
  background: none;
  border: none;
  color: inherit;
  padding: 0;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  opacity: 0.7;
}
.tag-remove:hover { opacity: 1; }

/* Dropdown */
.filter-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  z-index: 200;
  max-height: 180px;
  overflow-y: auto;
}
.filter-dropdown-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--bs-body-color);
  transition: background 0.1s;
}
.filter-dropdown-item:hover { background: var(--bs-secondary-bg); }

/* Dual range slider */
.dual-range-wrap {
  position: relative;
  height: 24px;
  padding: 0 4px;
}
.dual-range-track {
  position: absolute;
  top: 50%;
  left: 4px;
  right: 4px;
  transform: translateY(-50%);
  height: 4px;
  background: var(--bs-secondary-bg);
  border-radius: 2px;
}
.dual-range-fill {
  position: absolute;
  height: 100%;
  background: var(--bs-primary);
  border-radius: 2px;
  transition: left 0.05s, width 0.05s;
}
.range-thumb {
  position: absolute;
  width: calc(100% - 8px);
  height: 4px;
  top: 50%;
  left: 4px;
  transform: translateY(-50%);
  appearance: none;
  background: transparent;
  pointer-events: none;
  outline: none;
}
.range-thumb::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--bs-primary);
  border: 2px solid var(--bs-body-bg);
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
  pointer-events: all;
  cursor: pointer;
  transition: transform 0.1s;
}
.range-thumb::-webkit-slider-thumb:hover { transform: scale(1.2); }
.range-thumb::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--bs-primary);
  border: 2px solid var(--bs-body-bg);
  pointer-events: all;
  cursor: pointer;
}

/* Event cards */
.event-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 10px;
  overflow: hidden;
}
.event-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(0,0,0,0.15) !important; }
.event-img { object-fit: cover; width: 100%; height: 100%; transition: transform 0.3s; }
.event-card:hover .event-img { transform: scale(1.03); }
.event-desc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}
.load-progress-container { max-width: 400px; }

.mode-btn--disabled {
  opacity: 0.35 !important;
  cursor: not-allowed !important;
  text-decoration: line-through;
  filter: grayscale(60%);
}
</style>
