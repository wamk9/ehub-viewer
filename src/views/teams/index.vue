<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import Teams from '@/helpers/communication/Teams.js'
import SystemVars from '@/helpers/General/SystemVars'

const router = useRouter()
const { t } = useI18n()
const store = useStore()

const isLogged = computed(() => !!store.getters.getToken)

const CAT_GRAD = {
  simracing:          ['#0098D8', '#00d4ff'],
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
  chess:              ['#495057', '#868e96'],
  'drone-racing':     ['#0e7490', '#22d3ee'],
}

const ALL_CATEGORIES = Object.keys(CAT_GRAD)

function catGrad(category) {
  const g = CAT_GRAD[category]
  return g ? `linear-gradient(135deg, ${g[0]}, ${g[1]})` : 'linear-gradient(135deg, #0098D8, #00d4ff)'
}

function lightenHex(hex, amount) {
  const num = parseInt((hex || '#0098D8').replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + amount)
  const g = Math.min(255, ((num >> 8) & 0xff) + amount)
  const b = Math.min(255, (num & 0xff) + amount)
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function teamGrad(team) {
  if (team.color) return `linear-gradient(135deg, ${team.color}, ${lightenHex(team.color, 40)})`
  return catGrad(team.category)
}

function initials(name) {
  return (name || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function imgUrl(path) {
  return path ? SystemVars.baseUrl + 'storage/' + path : ''
}

const allTeams = ref([])
const loading = ref(true)
const followLoading = ref({})

const q        = ref('')
const category = ref('')
const showMode = ref('all')
const sort     = ref('wins_count')

const filtered = computed(() => {
  let list = allTeams.value

  if (q.value.trim()) {
    const sq = q.value.toLowerCase().trim()
    list = list.filter(t =>
      t.name.toLowerCase().includes(sq) ||
      (t.description || '').toLowerCase().includes(sq) ||
      (t.org_name || '').toLowerCase().includes(sq)
    )
  }

  if (category.value) {
    list = list.filter(t => t.category === category.value)
  }

  if (showMode.value === 'following') list = list.filter(t => t.is_following)
  if (showMode.value === 'open')      list = list.filter(t => t.is_open)
  if (showMode.value === 'verified')  list = list.filter(t => t.is_verified)

  return [...list].sort((a, b) => {
    if (sort.value === 'name')          return a.name.localeCompare(b.name)
    if (sort.value === 'wins_count')    return (b.wins_count || 0) - (a.wins_count || 0)
    if (sort.value === 'events_count')  return (b.events_count || 0) - (a.events_count || 0)
    if (sort.value === 'players_count') return (b.players_count || 0) - (a.players_count || 0)
    return 0
  })
})

async function load() {
  loading.value = true
  const result = await Teams.index()
  loading.value = false
  if (result.code === 200) allTeams.value = result.data ?? []
}

load()

async function toggleFollow(e, team) {
  e.stopPropagation()
  if (!isLogged.value) {
    router.push('/login')
    return
  }
  followLoading.value[team.id] = true
  if (team.is_following) {
    await Teams.unfollow(team.route)
    team.is_following = false
  } else {
    await Teams.follow(team.route)
    team.is_following = true
  }
  followLoading.value[team.id] = false
}
</script>

<template>
  <!-- HERO -->
  <header class="orgs-hero">
    <h1>
      {{ $t('pages.teams.index.hero.title_pre') }}
      <span class="accent">{{ $t('pages.teams.index.hero.title_accent') }}</span>
      {{ $t('pages.teams.index.hero.title_suf') }}
    </h1>
    <p>{{ $t('pages.teams.index.hero.subtitle') }}</p>
    <div style="max-width:520px; margin: 0 auto;">
      <div class="input-group input-group-lg">
        <span class="input-group-text" style="background:var(--ehub-field-bg); border-color:var(--ehub-line); color:var(--ehub-muted);">
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
        </span>
        <input
          v-model="q"
          type="text"
          class="form-control"
          :placeholder="$t('pages.teams.index.hero.search')"
          style="background:var(--ehub-field-bg); border-color:var(--ehub-line); color:var(--ehub-ink);"
        />
      </div>
    </div>
  </header>

  <!-- FILTER BAR -->
  <div class="orgs-filter-bar">
    <div class="container-fluid px-4">
      <div class="filter-inner">
        <span class="fb-label">{{ $t('pages.teams.index.filters.category') }}</span>
        <select v-model="category" class="form-select form-select-sm" style="width:auto; min-width:160px; max-width:220px; background:var(--ehub-field-bg); border-color:var(--ehub-line); color:var(--ehub-ink);">
          <option value="">{{ $t('pages.teams.index.filters.category_all') }}</option>
          <option v-for="cat in ALL_CATEGORIES" :key="cat" :value="cat">
            {{ $t(`categories.names.${cat}`) }}
          </option>
        </select>

        <span class="fb-label ms-2">{{ $t('pages.teams.index.filters.show') }}</span>
        <div class="seg seg-sm">
          <button :class="{ active: showMode === 'all' }" @click="showMode = 'all'">
            {{ $t('pages.teams.index.filters.all') }}
          </button>
          <button v-if="isLogged" :class="{ active: showMode === 'following' }" @click="showMode = 'following'">
            {{ $t('pages.teams.index.filters.following') }}
          </button>
          <button :class="{ active: showMode === 'open' }" @click="showMode = 'open'">
            {{ $t('pages.teams.index.filters.open') }}
          </button>
          <button :class="{ active: showMode === 'verified' }" @click="showMode = 'verified'">
            {{ $t('pages.teams.index.filters.verified') }}
          </button>
        </div>

        <span class="fb-label ms-2">{{ $t('pages.teams.index.filters.sort') }}</span>
        <select v-model="sort" class="form-select form-select-sm" style="width:auto; min-width:160px; max-width:200px; background:var(--ehub-field-bg); border-color:var(--ehub-line); color:var(--ehub-ink);">
          <option value="wins_count">{{ $t('pages.teams.index.sort.wins') }}</option>
          <option value="events_count">{{ $t('pages.teams.index.sort.events') }}</option>
          <option value="players_count">{{ $t('pages.teams.index.sort.players') }}</option>
          <option value="name">{{ $t('pages.teams.index.sort.name') }}</option>
        </select>

        <div style="flex:1"></div>
        <span class="orgs-results-count">
          {{ $t('pages.teams.index.results').replace('{n}', filtered.length) }}
        </span>
      </div>
    </div>
  </div>

  <!-- CONTENT -->
  <main class="container-fluid px-4 py-4">
    <div v-if="loading" class="orgs-grid">
      <div v-for="i in 6" :key="i" class="skel" :style="{ height: '260px', borderRadius: '16px', animationDelay: (i * 0.08) + 's' }"></div>
    </div>

    <div v-else-if="!filtered.length" class="empty-state">
      <div class="ico">
        <font-awesome-icon :icon="['fas', 'shield-halved']" />
      </div>
      <p class="mb-0">{{ $t('pages.teams.index.empty') }}</p>
    </div>

    <div v-else class="orgs-grid">
      <div
        v-for="team in filtered"
        :key="team.id"
        class="org-card"
        @click="team.route && $router.push('/teams/' + team.route)"
        style="cursor: pointer;"
      >
        <!-- Banner -->
        <div class="org-banner" :style="{ background: teamGrad(team) }">
          <span v-if="team.is_open" class="team-open-badge">
            <font-awesome-icon :icon="['fas', 'door-open']" />
            {{ $t('pages.teams.index.card.open') }}
          </span>
          <span v-if="team.is_verified" class="org-verified" :title="$t('pages.teams.index.card.verified')">
            <font-awesome-icon :icon="['fas', 'circle-check']" />
          </span>
        </div>

        <!-- Logo -->
        <div class="org-logo" :style="!team.logo_image ? { background: teamGrad(team) } : {}">
          <img v-if="team.logo_image" :src="imgUrl(team.logo_image)" :alt="team.name" />
          <template v-else>{{ initials(team.name) }}</template>
        </div>

        <!-- Body -->
        <div class="org-body">
          <div class="org-name">
            {{ team.name }}
            <font-awesome-icon v-if="team.is_verified" :icon="['fas', 'circle-check']" class="badge-ver" />
          </div>
          <div style="display:flex; gap:6px; flex-wrap:wrap; margin:4px 0 8px;">
            <span v-if="team.category" class="cat-chip sub" style="font-size:.7rem;">
              {{ $t(`categories.names.${team.category}`) }}
            </span>
            <span v-if="team.org_name" class="cat-chip" style="display:inline-flex; align-items:center; gap:4px; font-size:.7rem;">
              <font-awesome-icon :icon="['fas', 'building-flag']" style="opacity:.65; font-size:.65rem;" />
              {{ team.org_name }}
            </span>
          </div>
          <p class="org-desc">{{ team.description || '—' }}</p>
          <div class="org-stats">
            <div class="stat">
              <span class="v">{{ team.players_count }}</span>
              <span class="l">{{ $t('pages.teams.index.card.players') }}</span>
            </div>
            <div class="stat">
              <span class="v">{{ team.wins_count }}</span>
              <span class="l">{{ $t('pages.teams.index.card.wins') }}</span>
            </div>
            <div class="stat">
              <span class="v">{{ team.events_count }}</span>
              <span class="l">{{ $t('pages.teams.index.card.events') }}</span>
            </div>
          </div>
        </div>

        <!-- Foot -->
        <div class="org-foot">
          <button
            class="btn-follow"
            :class="{ following: team.is_following }"
            :disabled="followLoading[team.id]"
            @click.stop="toggleFollow($event, team)"
          >
            <font-awesome-icon :icon="['fas', team.is_following ? 'check' : 'plus']" />
            {{ team.is_following ? $t('pages.teams.index.card.following') : $t('pages.teams.index.card.follow') }}
          </button>
        </div>
      </div>
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
