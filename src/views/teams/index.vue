<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import Teams from '@/helpers/communication/Teams.js'
import EhubViewCard from '@/components/EhubViewCard.vue'

const router = useRouter()
const { t } = useI18n()
const store = useStore()

const isLogged = computed(() => !!store.getters.getToken)

const ALL_CATEGORIES = [
  'simracing', 'racingcars', 'rally', 'esports-fps', 'esports-moba',
  'esports-fighting', 'esports-strategy', 'esports-sports', 'motorsport',
  'motorbike', 'cycling', 'running', 'swimming', 'triathlon', 'hiking',
  'crossfit', 'rowing', 'archery', 'chess', 'drone-racing',
]

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

  if (category.value)            list = list.filter(t => t.category === category.value)
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

async function toggleFollow(team) {
  if (!isLogged.value) { router.push('/login'); return }
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

        <!-- Row 1: selects + count -->
        <div class="filter-row">
          <div class="filter-group">
            <span class="fb-label">{{ $t('pages.teams.index.filters.category') }}</span>
            <select v-model="category" class="form-select form-select-sm fi-sel">
              <option value="">{{ $t('pages.teams.index.filters.category_all') }}</option>
              <option v-for="cat in ALL_CATEGORIES" :key="cat" :value="cat">
                {{ $t(`categories.names.${cat}`) }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <span class="fb-label">{{ $t('pages.teams.index.filters.sort') }}</span>
            <select v-model="sort" class="form-select form-select-sm fi-sel">
              <option value="wins_count">{{ $t('pages.teams.index.sort.wins') }}</option>
              <option value="events_count">{{ $t('pages.teams.index.sort.events') }}</option>
              <option value="players_count">{{ $t('pages.teams.index.sort.players') }}</option>
              <option value="name">{{ $t('pages.teams.index.sort.name') }}</option>
            </select>
          </div>
          <span class="orgs-results-count ms-auto">
            {{ $t('pages.teams.index.results').replace('{n}', filtered.length) }}
          </span>
        </div>

        <!-- Row 2: show filter -->
        <div class="filter-row">
          <span class="fb-label">{{ $t('pages.teams.index.filters.show') }}</span>
          <div class="seg seg-sm filter-seg">
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
        </div>

      </div>
    </div>
  </div>

  <!-- CONTENT -->
  <main class="container-fluid px-4 py-4">
    <div v-if="loading" class="orgs-grid">
      <div v-for="i in 6" :key="i" class="skel" :style="{ height: '300px', borderRadius: '16px', animationDelay: (i * 0.08) + 's' }"></div>
    </div>

    <div v-else-if="!filtered.length" class="empty-state">
      <div class="ico">
        <font-awesome-icon :icon="['fas', 'shield-halved']" />
      </div>
      <p class="mb-0">{{ $t('pages.teams.index.empty') }}</p>
    </div>

    <div v-else class="orgs-grid">
      <EhubViewCard
        v-for="team in filtered"
        :key="team.id"
        :team="team"
        :follow-loading="!!followLoading[team.id]"
        @click="team.route && $router.push('/teams/' + team.route)"
        @follow="toggleFollow"
      />
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

/* Filter bar restructured for responsive */
.filter-inner {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 2px 0;
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 6px;
}
.fi-sel {
  background: var(--ehub-field-bg);
  border-color: var(--ehub-line);
  color: var(--ehub-ink);
  width: auto;
  min-width: 140px;
  max-width: 200px;
}
.filter-seg {
  flex-wrap: wrap;
}

@media (max-width: 480px) {
  .fi-sel { min-width: 0; flex: 1; }
  .filter-group { flex: 1; }
  .filter-seg { gap: 4px; }
  .filter-seg button { font-size: .72rem; padding: 3px 9px; }
}
</style>
