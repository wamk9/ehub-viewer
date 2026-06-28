<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import Organization from '@/helpers/communication/Organization.js'
import SystemVars from '@/helpers/General/SystemVars'

const router = useRouter()
const { t, locale } = useI18n()
const store = useStore()

const isLogged = computed(() => !!store.getters.getToken)

// ── Category gradient map ──────────────────────────────────────────
const CAT_GRAD = {
  simracing:          ['#0098D8', '#00d4ff'],
  racingcars:         ['#0098D8', '#00d4ff'],
  rally:              ['#f08c00', '#ffc93c'],
  'esports-fps':      ['#e23b3b', '#ff8a3b'],
  'esports-moba':     ['#7C3AED', '#b06bff'],
  'esports-fighting': ['#d6336c', '#ff6b9d'],
  'esports-strategy': ['#1a6e4f', '#51cf66'],
  'esports-sports':   ['#2563eb', '#60a5fa'],
  motorsport:         ['#f08c00', '#ffc93c'],
  motorbike:          ['#dc4f00', '#ff8a3b'],
  cycling:            ['#1971c2', '#4dabf7'],
  running:            ['#1f8a5b', '#51cf66'],
  swimming:           ['#0284c7', '#38bdf8'],
  triathlon:          ['#7C3AED', '#c084fc'],
  hiking:             ['#4d7c0f', '#a3e635'],
  crossfit:           ['#9a3412', '#fb923c'],
  rowing:             ['#1d4ed8', '#93c5fd'],
  archery:            ['#92400e', '#fbbf24'],
  chess:              ['#495057', '#868e96'],
  'drone-racing':     ['#0e7490', '#22d3ee'],
}

const ALL_CATEGORIES = [
  'simracing', 'esports-fps', 'esports-moba', 'esports-fighting',
  'esports-strategy', 'esports-sports', 'motorsport', 'motorbike',
  'cycling', 'running', 'swimming', 'triathlon', 'hiking', 'crossfit',
  'rowing', 'archery', 'chess', 'drone-racing',
]

function catGrad(category) {
  const g = CAT_GRAD[category]
  return g ? `linear-gradient(135deg, ${g[0]}, ${g[1]})` : 'linear-gradient(135deg, #0098D8, #00d4ff)'
}

function initials(name) {
  return (name || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function fmtNum(n) {
  if (!n) return '0'
  return n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : String(n)
}

function imgUrl(path) {
  return path ? SystemVars.baseUrl + 'storage/' + path : ''
}

// ── Data ─────────────────────────────────────────────────────────────
const allOrgs = ref([])
const loading = ref(true)
const followLoading = ref({})

// ── Filters ───────────────────────────────────────────────────────────
const q        = ref('')
const category = ref('')
const showMode = ref('all') // all | following
const sort     = ref('name')

// ── Derived category for display ──────────────────────────────────────
function primaryCategory(org) {
  return org.primary_category || ''
}

// ── Filtered + sorted list ────────────────────────────────────────────
const filtered = computed(() => {
  let list = allOrgs.value

  if (q.value.trim()) {
    const sq = q.value.toLowerCase().trim()
    list = list.filter(o =>
      o.name.toLowerCase().includes(sq) ||
      (o.description || '').toLowerCase().includes(sq)
    )
  }

  if (category.value) {
    list = list.filter(o => o.primary_category === category.value)
  }

  if (showMode.value === 'following') {
    list = list.filter(o => o.is_following)
  }

  list = [...list].sort((a, b) => {
    if (sort.value === 'name')      return a.name.localeCompare(b.name)
    if (sort.value === 'followers') return (b.followers_count || 0) - (a.followers_count || 0)
    if (sort.value === 'events')    return (b.events_count || 0) - (a.events_count || 0)
    if (sort.value === 'members')   return (b.members_count || 0) - (a.members_count || 0)
    return 0
  })

  return list
})

// ── Load ────────────────────────────────────────────────────────────
async function load() {
  loading.value = true
  const result = await Organization.index()
  loading.value = false
  if (result.code === 200) allOrgs.value = result.data ?? []
}

load()

// ── Follow toggle ────────────────────────────────────────────────────
async function toggleFollow(e, org) {
  e.stopPropagation()
  if (!isLogged.value) {
    router.push('/login')
    return
  }
  followLoading.value[org.id] = true
  if (org.is_following) {
    await Organization.unfollow(org.route)
    org.is_following = false
    org.followers_count = Math.max(0, (org.followers_count || 1) - 1)
  } else {
    await Organization.follow(org.route)
    org.is_following = true
    org.followers_count = (org.followers_count || 0) + 1
  }
  followLoading.value[org.id] = false
}
</script>

<template>
  <!-- HERO -->
  <header class="orgs-hero">
    <h1>
      {{ $t('pages.organization.index.hero.title_pre') }}
      <span class="accent">{{ $t('pages.organization.index.hero.title_accent') }}</span>
      {{ $t('pages.organization.index.hero.title_suf') }}
    </h1>
    <p>{{ $t('pages.organization.index.hero.subtitle') }}</p>
    <div style="max-width:520px; margin: 0 auto;">
      <div class="input-group input-group-lg">
        <span class="input-group-text" style="background:var(--ehub-field-bg); border-color:var(--ehub-line); color:var(--ehub-muted);">
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
        </span>
        <input
          v-model="q"
          type="text"
          class="form-control"
          :placeholder="$t('pages.organization.index.hero.search')"
          style="background:var(--ehub-field-bg); border-color:var(--ehub-line); color:var(--ehub-ink);"
        />
      </div>
    </div>
  </header>

  <!-- FILTER BAR -->
  <div class="orgs-filter-bar">
    <div class="container-fluid px-4">
      <div class="filter-inner">
        <!-- Category -->
        <span class="fb-label">{{ $t('pages.organization.index.filters.category') }}</span>
        <select v-model="category" class="form-select form-select-sm" style="width:auto; min-width:160px; max-width:220px; background:var(--ehub-field-bg); border-color:var(--ehub-line); color:var(--ehub-ink);">
          <option value="">{{ $t('pages.organization.index.filters.category_all') }}</option>
          <option v-for="cat in ALL_CATEGORIES" :key="cat" :value="cat">
            {{ $t(`categories.names.${cat}`) }}
          </option>
        </select>

        <!-- Show -->
        <span class="fb-label ms-2">{{ $t('pages.organization.index.filters.show') }}</span>
        <div class="seg seg-sm">
          <button :class="{ active: showMode === 'all' }" @click="showMode = 'all'">
            {{ $t('pages.organization.index.filters.all') }}
          </button>
          <button v-if="isLogged" :class="{ active: showMode === 'following' }" @click="showMode = 'following'">
            {{ $t('pages.organization.index.filters.following') }}
          </button>
        </div>

        <!-- Sort -->
        <span class="fb-label ms-2">{{ $t('pages.organization.index.filters.sort') }}</span>
        <select v-model="sort" class="form-select form-select-sm" style="width:auto; min-width:160px; max-width:200px; background:var(--ehub-field-bg); border-color:var(--ehub-line); color:var(--ehub-ink);">
          <option value="name">{{ $t('pages.organization.index.sort.name') }}</option>
          <option value="followers">{{ $t('pages.organization.index.sort.followers') }}</option>
          <option value="events">{{ $t('pages.organization.index.sort.events') }}</option>
          <option value="members">{{ $t('pages.organization.index.sort.members') }}</option>
        </select>

        <div style="flex:1"></div>
        <span class="orgs-results-count">
          {{ $t('pages.organization.index.results').replace('{n}', filtered.length) }}
        </span>
      </div>
    </div>
  </div>

  <!-- CONTENT -->
  <main class="container-fluid px-4 py-4">
    <!-- Loading -->
    <div v-if="loading" class="orgs-grid">
      <div v-for="i in 6" :key="i" class="skel" :style="{ height: '260px', borderRadius: '16px', animationDelay: (i * 0.08) + 's' }"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="!filtered.length" class="empty-state">
      <div class="ico"><font-awesome-icon :icon="['far', 'building']" /></div>
      <p class="mb-0">{{ $t('pages.organization.index.empty') }}</p>
    </div>

    <!-- Grid -->
    <div v-else class="orgs-grid">
      <router-link
        v-for="org in filtered"
        :key="org.id"
        :to="'/org/' + org.route"
        class="text-decoration-none"
      >
      <div class="org-card">
        <!-- Banner -->
        <div class="org-banner" :style="org.cover_image ? { backgroundImage: 'url(' + imgUrl(org.cover_image) + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : { background: catGrad(org.primary_category) }">
          <span v-if="org.is_verified" class="org-verified" :title="$t('pages.organization.index.card.verified')">
            <font-awesome-icon :icon="['fas', 'circle-check']" />
          </span>
        </div>

        <!-- Logo -->
        <div class="org-logo" :style="!org.logo_image ? { background: catGrad(org.primary_category) } : {}">
          <img v-if="org.logo_image" :src="imgUrl(org.logo_image)" :alt="org.name" />
          <template v-else>{{ initials(org.name) }}</template>
        </div>

        <!-- Body -->
        <div class="org-body">
          <div class="org-name">
            {{ org.name }}
            <font-awesome-icon v-if="org.is_verified" :icon="['fas', 'circle-check']" class="badge-ver" />
          </div>
          <span v-if="org.primary_category" class="cat-chip sub mb-2" style="align-self:flex-start; font-size:.7rem;">
            {{ $t(`categories.names.${org.primary_category}`) }}
          </span>
          <p class="org-desc">{{ org.description || '—' }}</p>
          <div class="org-stats">
            <div class="stat">
              <span class="v">{{ org.events_count ?? 0 }}</span>
              <span class="l">{{ $t('pages.organization.index.card.events') }}</span>
            </div>
            <div class="stat">
              <span class="v">{{ fmtNum(org.members_count) }}</span>
              <span class="l">{{ $t('pages.organization.index.card.members') }}</span>
            </div>
            <div class="stat">
              <span class="v">{{ fmtNum(org.followers_count) }}</span>
              <span class="l">{{ $t('pages.organization.index.card.followers') }}</span>
            </div>
          </div>
        </div>

        <!-- Foot -->
        <div class="org-foot">
          <button
            class="btn-follow"
            :class="{ following: org.is_following }"
            :disabled="followLoading[org.id]"
            @click.stop="toggleFollow($event, org)"
          >
            <font-awesome-icon :icon="['fas', org.is_following ? 'check' : 'plus']" />
            {{ org.is_following ? $t('pages.organization.index.card.following') : $t('pages.organization.index.card.follow') }}
          </button>
        </div>
      </div>
      </router-link>
    </div>
  </main>

  <footer class="home-footer" style="border-top:1px solid var(--ehub-line); padding:28px 20px; text-align:center; color:var(--ehub-muted); font-size:.82rem; margin-top:40px;">
    {{ $t('pages.homepage.entrance.footer') }}
  </footer>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--ehub-muted);
}
.empty-state .ico {
  font-size: 2.4rem;
  opacity: .4;
  margin-bottom: 12px;
}
</style>
