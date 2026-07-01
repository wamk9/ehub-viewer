<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import EhubFilterBar from '@/components/EhubFilterBar.vue'
import EhubEventFeed from '@/components/EhubEventFeed.vue'

const { t } = useI18n()
const store    = useStore()
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
const searchQuery    = ref('')
const debouncedName  = ref('')

let debounceTimer = null
watch(searchQuery, (val) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { debouncedName.value = val.trim() }, 400)
})

const feedParams = computed(() => {
  const p = {}
  if (debouncedName.value)          p.name      = debouncedName.value
  if (modeFilter.value !== 'all')   p.runmode   = modeFilter.value
  if (categoryFilter.value)          p.category  = categoryFilter.value
  if (feeFilter.value === 'free')    p.price_max = 0
  if (feeFilter.value === 'paid')    p.price_min = 0.01
  return p
})
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

      <!-- Public feeds -->
      <EhubEventFeed type="upcoming" :params="feedParams" />
      <EhubEventFeed type="latest"   :params="feedParams" />
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
</style>
