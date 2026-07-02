<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import Organization from '@/helpers/communication/Organization.js'
import EhubViewCard from '@/components/EhubViewCard.vue'

const props = defineProps({
  title: { type: String, default: null },
  limit: { type: Number, default: 6 },
})

const router = useRouter()
const store = useStore()
const { t } = useI18n()
const isLogged = computed(() => !!store.getters.getToken)

const orgs = ref([])
const loading = ref(true)
const followLoading = ref({})

const sectionTitle = computed(() => props.title || t('pages.organization.feed.featured.title'))

function fmtNum(n) {
  if (!n) return '0'
  return n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'k' : String(n)
}
function orgAsCard(org) {
  return { ...org, category: org.primary_category, is_open: false }
}
function orgStats(org) {
  return [
    { value: org.events_count ?? 0,       label: t('pages.organization.index.card.events') },
    { value: fmtNum(org.members_count),   label: t('pages.organization.index.card.members') },
    { value: fmtNum(org.followers_count), label: t('pages.organization.index.card.followers') },
  ]
}

async function load() {
  loading.value = true
  const result = await Organization.index()
  loading.value = false
  if (result.code !== 200) return
  orgs.value = [...(result.data ?? [])]
    .sort((a, b) => (b.followers_count || 0) - (a.followers_count || 0))
    .slice(0, props.limit)
}
onMounted(load)

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
  <section class="ef-section">
    <div class="ef-header">
      <h2 class="ef-title">{{ sectionTitle }}</h2>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="ef-track">
      <div v-for="i in 4" :key="i" class="skel ef-skel" :style="{ animationDelay: (i * 0.07) + 's' }"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="!orgs.length" class="ef-empty">
      <div class="ef-empty-card">
        <font-awesome-icon :icon="['fas', 'building']" />
        <span>{{ $t('pages.organization.feed.empty') }}</span>
      </div>
    </div>

    <!-- Cards -->
    <div v-else class="ef-track">
      <div v-for="org in orgs" :key="org.id" class="ef-card-wrap">
        <EhubViewCard
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
    </div>
  </section>
</template>

<style scoped>
.ef-section {
  width: 100%;
  overflow: hidden;
}

.ef-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px 12px;
}

.ef-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ehub-ink);
  margin: 0;
}

.ef-track {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 8px;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.ef-track::-webkit-scrollbar { display: none; }

.ef-card-wrap {
  flex: 0 0 300px;
  height: 360px;
  scroll-snap-align: start;
}

.ef-skel {
  flex: 0 0 300px;
  height: 360px;
  border-radius: 16px;
}

.ef-empty {
  display: flex;
  justify-content: flex-start;
  padding: 8px 4px;
}
.ef-empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  max-width: 300px;
  min-height: 360px;
  padding: 32px 20px;
  border: 1px dashed var(--ehub-line);
  border-radius: 16px;
  background: var(--ehub-field-bg);
  color: var(--ehub-muted);
  font-size: .88rem;
  text-align: center;
}
.ef-empty-card svg {
  font-size: 1.5rem;
  opacity: .5;
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
