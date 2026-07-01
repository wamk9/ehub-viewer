<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import Organization from '@/helpers/communication/Organization.js'
import EhubFilterBar from '@/components/EhubFilterBar.vue'
import EhubViewCard from '@/components/EhubViewCard.vue'

const router = useRouter()
const { t } = useI18n()
const store = useStore()

const isLogged = computed(() => !!store.getters.getToken)

const ALL_CATEGORIES = [
  'simracing', 'esports-fps', 'esports-moba', 'esports-fighting',
  'esports-strategy', 'esports-sports', 'motorsport', 'motorbike',
  'cycling', 'running', 'swimming', 'triathlon', 'hiking', 'crossfit',
  'rowing', 'archery', 'chess', 'drone-racing',
]

function fmtNum(n) {
  if (!n) return '0'
  return n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : String(n)
}

function orgAsCard(org) {
  return { ...org, category: org.primary_category, is_open: false }
}

function orgStats(org) {
  return [
    { value: org.events_count ?? 0,         label: t('pages.organization.index.card.events') },
    { value: fmtNum(org.members_count),      label: t('pages.organization.index.card.members') },
    { value: fmtNum(org.followers_count),    label: t('pages.organization.index.card.followers') },
  ]
}

// ── Data ─────────────────────────────────────────────────────────────
const allOrgs = ref([])
const loading = ref(true)
const followLoading = ref({})

// ── Filters ───────────────────────────────────────────────────────────
const q        = ref('')
const category = ref('')
const showMode = ref('all')
const sort     = ref('name')

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

// ── Follow ────────────────────────────────────────────────────────────
async function handleFollow(org) {
  if (!isLogged.value) { router.push('/login'); return }
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
  <EhubFilterBar>
    <template #filters>
      <button class="fchip" :class="{ active: showMode === 'all' }" @click="showMode = 'all'">
        {{ $t('pages.organization.index.filters.all') }}
      </button>
      <button v-if="isLogged" class="fchip" :class="{ active: showMode === 'following' }" @click="showMode = 'following'">
        {{ $t('pages.organization.index.filters.following') }}
      </button>
      <span class="fchip-sep"></span>
      <div class="fchip-sel">
        <select v-model="category" class="fchip-select">
          <option value="">{{ $t('pages.organization.index.filters.category_all') }}</option>
          <option v-for="cat in ALL_CATEGORIES" :key="cat" :value="cat">
            {{ $t(`categories.names.${cat}`) }}
          </option>
        </select>
      </div>
      <span class="fchip-sep"></span>
      <div class="fchip-sel">
        <select v-model="sort" class="fchip-select">
          <option value="name">{{ $t('pages.organization.index.sort.name') }}</option>
          <option value="followers">{{ $t('pages.organization.index.sort.followers') }}</option>
          <option value="events">{{ $t('pages.organization.index.sort.events') }}</option>
          <option value="members">{{ $t('pages.organization.index.sort.members') }}</option>
        </select>
      </div>
    </template>
  </EhubFilterBar>

  <!-- CONTENT -->
  <main class="container-fluid px-4 py-4">
    <!-- Loading -->
    <div v-if="loading" class="orgs-grid">
      <div v-for="i in 6" :key="i" class="skel" :style="{ height: '300px', borderRadius: '16px', animationDelay: (i * 0.08) + 's' }"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="!filtered.length" class="empty-state">
      <div class="ico"><font-awesome-icon :icon="['far', 'building']" /></div>
      <p class="mb-0">{{ $t('pages.organization.index.empty') }}</p>
    </div>

    <!-- Grid -->
    <div v-else class="orgs-grid">
      <EhubViewCard
        v-for="org in filtered"
        :key="org.id"
        :team="orgAsCard(org)"
        :follow-loading="!!followLoading[org.id]"
        :stats="orgStats(org)"
        banner-icon="building-flag"
        @click="router.push('/org/' + org.route)"
        @follow="handleFollow(org)"
      >
        <template #badges>
          <span v-if="org.is_verified" class="vc-badge verified">
            <font-awesome-icon :icon="['fas', 'circle-check']" />
            {{ $t('pages.organization.index.card.verified') }}
          </span>
        </template>
      </EhubViewCard>
    </div>
  </main>
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
.vc-badge {
  font-size: .62rem;
  font-weight: 700;
  letter-spacing: .05em;
  text-transform: uppercase;
  padding: 4px 9px;
  border-radius: 6px;
  background: rgba(0,0,0,.42);
  backdrop-filter: blur(8px);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  white-space: nowrap;
  width: 100%;
}
.vc-badge.verified { background: color-mix(in srgb, var(--ehub-primary) 80%, #000 20%); }
</style>
