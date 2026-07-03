<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, useCssVars } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import Organization from '@/helpers/communication/Organization.js'
import Article from '@/helpers/communication/Article.js'
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js'
import { createSSE } from '@/helpers/communication/useLiveSSE.js'
import SystemVars from '@/helpers/General/SystemVars'
import { toast } from '@/helpers/toast.js'
import EhubEventCard from '@/components/EhubEventCard.vue'
import EhubTabs from '@/components/EhubTabs.vue'
import EhubRoster from '@/components/EhubRoster.vue'
import EhubFilterBar from '@/components/EhubFilterBar.vue'
import { categoryGradient } from '@/helpers/General/CategoryConfig.js'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const store = useStore()

const ALL_CATEGORIES = [
  'simracing', 'esports-fps', 'esports-moba', 'esports-fighting',
  'esports-strategy', 'esports-sports', 'motorsport', 'motorbike',
  'cycling', 'running', 'swimming', 'triathlon', 'hiking', 'crossfit',
  'rowing', 'archery', 'chess', 'drone-racing',
]

function catGrad(category) {
  return categoryGradient(category)
}

function hexGrad(hex) {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return null
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, ((n >> 16) & 0xff) - 50)
  const g = Math.max(0, ((n >> 8) & 0xff) - 50)
  const b = Math.max(0, (n & 0xff) - 50)
  const dark = '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
  return `linear-gradient(135deg, ${hex}, ${dark})`
}

function contrastColor(hex) {
  if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) return '#fff'
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 0xff
  const g = (n >> 8) & 0xff
  const b = n & 0xff
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.55 ? '#111' : '#fff'
}
// ── Loading ─────────────────────────────────────────────────────────
const loading = ref(true)

// ── Data ────────────────────────────────────────────────────────────
const org = ref({
  name: '', description: '', about: '', route: '', logo_image: '',
  instagram: '', facebook: '', x_twitter: '', website: '', phone: '', contact_email: '',
  created_at: null, role: null, is_following: false,
})
const isFollowing = ref(false)
const followLoading = ref(false)
const members = ref([])
const membersLoaded = ref(false)
const membersLoading = ref(false)
const events = ref([])
const eventsLoaded = ref(false)
const eventsLoading = ref(false)
const articles = ref([])
const articlesLoaded = ref(false)
const articlesLoading = ref(false)
const activeTab = computed(() => route.params.tab || 'about')
function tabTo(key) {
  return { name: 'show-organization-info', params: { orgRoute: route.params.orgRoute, tab: key } }
}
let orgSSE = null

// ── Auth ────────────────────────────────────────────────────────────
const isLogged = computed(() => !!store.getters.getToken)
const canManage = computed(() => ['owner', 'admin'].includes(org.value.role))

// ── Hero gradient ───────────────────────────────────────────────────
const heroGrad = computed(() => {
  if (org.value.color) return hexGrad(org.value.color) ?? catGrad(events.value[0]?.category)
  if (events.value.length) return catGrad(events.value[0].category)
  return 'linear-gradient(135deg, var(--ehub-primary), #0060a0)'
})

// ── Org accent + contrast ────────────────────────────────────────────
const orgTextColor = computed(() => contrastColor(org.value.color))
useCssVars(() => ({ 'org-accent': org.value.color || 'var(--ehub-primary)' }))

// ── Org image URLs (convention: org/{route}/logo.webp, cover.webp) ──
const orgLogoUrl = computed(() =>
  SystemVars.baseUrl + 'storage/org/' + org.value.route + '/logo.webp'
)
const orgCoverUrl = computed(() =>
  SystemVars.baseUrl + 'storage/org/' + org.value.route + '/cover.webp'
)
const coverImgError = ref(false)
const logoImgError = ref(false)

// ── Stats ────────────────────────────────────────────────────────────
const foundedYear = computed(() => org.value.founded_at ? new Date(org.value.founded_at).getUTCFullYear() : '—')

// ── Founded / registered copy ───────────────────────────────────────
function monthYear(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr.length <= 7 ? dateStr + '-01' : dateStr)
  return new Intl.DateTimeFormat(locale.value, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d)
}
const foundedText = computed(() => monthYear(org.value.founded_at))
const registeredText = computed(() => monthYear(org.value.created_at))

// ── Tabs ─────────────────────────────────────────────────────────────
const tabsList = computed(() => [
  { key: 'about',   label: t('pages.organization.show.tabs.about'),   icon: ['fas', 'circle-info'],    to: tabTo('about') },
  { key: 'events',  label: t('pages.organization.show.tabs.events'),  icon: ['fas', 'calendar-days'],  count: events.value.length,   to: tabTo('events') },
  { key: 'news',    label: t('pages.organization.show.tabs.news'),    icon: ['fas', 'newspaper'],      count: articles.value.length, to: tabTo('news') },
  { key: 'members', label: t('pages.organization.show.tabs.members'), icon: ['fas', 'users'],          count: members.value.length,  to: tabTo('members') },
])

// ── Events filter bar ────────────────────────────────────────────────
const feeFilter      = ref('all')
const modeFilter     = ref('all')
const categoryFilter = ref('')
const statusFilter   = ref('all')

function eventStatus(e) {
  if (e.finished) return 'closed'
  if (e.max_registrations && e.registrations_count >= e.max_registrations) return 'full'
  if (e.initialized) return 'in_progress'
  return 'open'
}

const filteredEvents = computed(() => {
  return events.value
    .filter(e => feeFilter.value === 'all'  || (feeFilter.value === 'free' ? !e.fee : e.fee > 0))
    .filter(e => modeFilter.value === 'all' || e.runmode === modeFilter.value)
    .filter(e => !categoryFilter.value      || e.category === categoryFilter.value)
    .filter(e => statusFilter.value === 'all' || eventStatus(e) === statusFilter.value)
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

// ── Roster (normalized for EhubRoster) ──────────────────────────────
const rosterMembers = computed(() => members.value.map(m => ({
  id: m.id,
  name: `${m.user?.name || ''} ${m.user?.surname || ''}`.trim(),
  username: m.user?.username || '',
  avatarUrl: m.user?.image ? imgUrl(m.user.image) : '',
  role: m.role,
})))

// ── Initials ─────────────────────────────────────────────────────────
function initials(name) {
  return (name || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

// ── Format date ──────────────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(locale.value === 'pt-BR' ? 'pt-BR' : locale.value, { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Image url ────────────────────────────────────────────────────────
function imgUrl(path) {
  return path ? SystemVars.baseUrl + 'storage/' + path : ''
}

// ── Load lazy data ───────────────────────────────────────────────────
async function loadMembers() {
  if (membersLoaded.value) return
  membersLoading.value = true
  const result = await Organization.getMembers(route.params.orgRoute)
  membersLoading.value = false
  membersLoaded.value = true
  if (result.code === 200) members.value = result.data ?? []
}

async function loadEvents() {
  if (eventsLoaded.value) return
  eventsLoading.value = true
  const result = await OrganizationEvent.index(route.params.orgRoute)
  eventsLoading.value = false
  eventsLoaded.value = true
  if (result.code === 200) events.value = result.data ?? []
}

async function loadArticles() {
  if (articlesLoaded.value) return
  articlesLoading.value = true
  const result = await Article.getAll(route.params.orgRoute)
  articlesLoading.value = false
  articlesLoaded.value = true
  if (result.code === 200) articles.value = result.data ?? []
}

function loadTabData(tab) {
  if (tab === 'events'  && !eventsLoaded.value)   loadEvents()
  if (tab === 'news'    && !articlesLoaded.value) loadArticles()
  if (tab === 'members' && !membersLoaded.value)  loadMembers()
}

watch(activeTab, loadTabData)

// ── Follow ───────────────────────────────────────────────────────────
async function toggleFollow() {
  followLoading.value = true
  if (isFollowing.value) {
    await Organization.unfollow(route.params.orgRoute)
    isFollowing.value = false
  } else {
    await Organization.follow(route.params.orgRoute)
    isFollowing.value = true
  }
  followLoading.value = false
}

// ── Init ────────────────────────────────────────────────────────────
onMounted(async () => {
  if (route.query.created === 'true') {
    toast.success(t('pages.organization.show.created_alert'))
    router.replace({ query: {} })
  }

  const result = await Organization.show(route.params.orgRoute)
  loading.value = false
  if (result.code === 200) {
    org.value = result.data
    isFollowing.value = !!result.data.is_following
  }

  orgSSE = createSSE('org-content', { orgRoute: route.params.orgRoute }, (payload) => {
    if (!payload) return
    if (payload.events)   { events.value = payload.events;     eventsLoaded.value   = true }
    if (payload.articles) { articles.value = payload.articles; articlesLoaded.value = true }
  })
  orgSSE.connect()

  loadEvents()
  loadTabData(activeTab.value)
})

onBeforeUnmount(() => {
  if (orgSSE) orgSSE.disconnect()
})
</script>

<template>
  <!-- SKELETON -->
  <template v-if="loading">
    <div class="org-skel-page">
      <div class="skel" style="height:200px;border-radius:0;width:100%"></div>
      <div class="container-fluid px-4">
        <div style="display:flex;gap:1rem;margin-top:-40px;align-items:flex-end;padding-bottom:1rem">
          <div class="skel" style="width:90px;height:90px;border-radius:16px;flex-shrink:0;border:3px solid var(--ehub-card)"></div>
          <div style="flex:1;display:flex;flex-direction:column;gap:8px;padding-bottom:.5rem">
            <div class="skel" style="height:26px;width:240px"></div>
            <div class="skel" style="height:14px;width:160px"></div>
          </div>
        </div>
        <div style="display:flex;gap:1.5rem;margin:1rem 0 1.5rem">
          <div v-for="i in 3" :key="i" class="skel" :style="{ height:'52px', width:'90px', borderRadius:'10px', animationDelay: (i*0.09)+'s' }"></div>
        </div>
        <div style="display:flex;gap:.5rem;margin-bottom:1.5rem;border-bottom:1px solid var(--ehub-line);padding-bottom:4px">
          <div v-for="i in 3" :key="'t'+i" class="skel" :style="{ height:'36px', width:'110px', borderRadius:'8px', animationDelay: (i*0.07)+'s' }"></div>
        </div>
        <div class="skel" style="height:280px;border-radius:14px"></div>
      </div>
    </div>
  </template>

  <!-- PAGE CONTENT -->
  <template v-else>
  <!-- HERO COVER -->
  <header class="org-hero">
    <div class="cover" :style="{ background: heroGrad }">
      <img v-if="org.route && !coverImgError" :src="orgCoverUrl" class="cover-img" alt=""
        @error="coverImgError = true" @load="coverImgError = false" />
    </div>
    <div class="cover-fade"></div>
  </header>

  <div class="container-fluid px-4">
    <!-- HEAD -->
    <div class="org-head">
      <div class="org-identity">
        <!-- Logo -->
        <div class="org-detail-logo" :style="{ background: heroGrad }">
          <img v-if="org.route && !logoImgError" :src="orgLogoUrl" :alt="org.name" @error="logoImgError = true" />
          <template v-else>{{ initials(org.name) }}</template>
        </div>

        <!-- Title block -->
        <div class="org-titleblock">
          <h1>
            {{ org.name || '—' }}
          </h1>
          <p class="org-tagline">{{ org.description }}</p>
          <div class="org-meta-chips">
            <span v-if="registeredText" class="meta-chip">
              <font-awesome-icon :icon="['fas', 'calendar-check']" />
              {{ foundedText
                ? $t('pages.organization.show.stats.founded_full', { founded: foundedText, registered: registeredText })
                : $t('pages.organization.show.stats.since_only', { registered: registeredText }) }}
            </span>
            <span v-if="org.website" class="meta-chip">
              <font-awesome-icon :icon="['fas', 'globe']" />
              {{ org.website }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="org-actions">
          <button
            v-if="isLogged"
            class="btn btn-follow-lg round px-4"
            :class="{ following: isFollowing }"
            :disabled="followLoading"
            @click="toggleFollow"
          >
            <font-awesome-icon :icon="['fas', isFollowing ? 'bell-slash' : 'bell']" />
            {{ isFollowing ? $t('pages.organization.show.unfollow') : $t('pages.organization.show.follow') }}
          </button>
          <router-link
            v-if="canManage"
            :to="`/org/${$route.params.orgRoute}/manage`"
            class="btn btn-ghost round px-3"
          >
            <font-awesome-icon :icon="['fas', 'gear']" />
            {{ $t('pages.organization.show.manage') }}
          </router-link>
        </div>
      </div>

      <!-- Stats bar -->
      <div class="org-statbar">
        <div class="stat">
          <span class="v">{{ events.length || '—' }}</span>
          <span class="l">{{ $t('pages.organization.show.stats.events') }}</span>
        </div>
        <div class="stat">
          <span class="v">{{ members.length || '—' }}</span>
          <span class="l">{{ $t('pages.organization.show.stats.members') }}</span>
        </div>
        <div class="stat">
          <span class="v">{{ foundedYear }}</span>
          <span class="l">{{ $t('pages.organization.show.stats.founded') }}</span>
        </div>
      </div>
    </div>

    <!-- TABS -->
    <EhubTabs :tabs="tabsList" :model-value="activeTab" />

    <!-- ABOUT TAB -->
    <section class="tab-pane" :class="{ active: activeTab === 'about' }">
      <div class="about-grid">
        <!-- Description -->
        <div class="about-card">
          <h3>{{ $t('pages.organization.show.about.title') }}</h3>
          <p v-if="org.about || org.description" class="body">{{ org.about || org.description }}</p>
          <p v-else class="body" style="opacity:.5">{{ $t('pages.organization.show.about.empty') }}</p>
        </div>

        <!-- Info list -->
        <div class="about-card">
          <h3>{{ $t('pages.organization.show.about.info') }}</h3>
          <ul class="info-list">
            <li v-if="org.founded_at">
              <span class="ico"><font-awesome-icon :icon="['fas', 'calendar-check']" /></span>
              <span class="meta">
                <span class="k">{{ $t('pages.organization.show.about.founded') }}</span>
                <span class="val">{{ foundedText }}</span>
              </span>
            </li>
            <li>
              <span class="ico"><font-awesome-icon :icon="['fas', 'calendar-days']" /></span>
              <span class="meta">
                <span class="k">{{ $t('pages.organization.show.about.since') }}</span>
                <span class="val">{{ registeredText }}</span>
              </span>
            </li>
            <li v-if="org.website">
              <span class="ico"><font-awesome-icon :icon="['fas', 'globe']" /></span>
              <span class="meta">
                <span class="k">{{ $t('pages.organization.show.about.website') }}</span>
                <a :href="org.website.startsWith('http') ? org.website : 'https://' + org.website" target="_blank" rel="noopener" class="val">{{ org.website }}</a>
              </span>
            </li>
            <li v-if="org.contact_email">
              <span class="ico"><font-awesome-icon :icon="['fas', 'envelope']" /></span>
              <span class="meta">
                <span class="k">{{ $t('pages.organization.show.about.email') }}</span>
                <a :href="`mailto:${org.contact_email}`" class="val">{{ org.contact_email }}</a>
              </span>
            </li>
            <li v-if="org.phone">
              <span class="ico"><font-awesome-icon :icon="['fas', 'phone']" /></span>
              <span class="meta">
                <span class="k">{{ $t('pages.organization.show.about.phone') }}</span>
                <span class="val">{{ org.phone }}</span>
              </span>
            </li>
            <li v-if="org.instagram || org.facebook || org.x_twitter">
              <span class="ico"><font-awesome-icon :icon="['fas', 'share-nodes']" /></span>
              <span class="meta">
                <span class="k">{{ $t('pages.organization.show.about.social') }}</span>
                <span class="val d-flex gap-3 mt-1">
                  <a v-if="org.instagram" :href="`https://instagram.com/${org.instagram.replace('@','')}`" target="_blank" rel="noopener">
                    <font-awesome-icon :icon="['fab', 'instagram']" />
                  </a>
                  <a v-if="org.facebook" :href="`https://facebook.com/${org.facebook}`" target="_blank" rel="noopener">
                    <font-awesome-icon :icon="['fab', 'facebook']" />
                  </a>
                  <a v-if="org.x_twitter" :href="`https://x.com/${org.x_twitter.replace('@','')}`" target="_blank" rel="noopener">
                    <font-awesome-icon :icon="['fab', 'x-twitter']" />
                  </a>
                </span>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- EVENTS TAB -->
    <section class="tab-pane" :class="{ active: activeTab === 'events' }">
      <EhubFilterBar v-if="events.length">
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

      <div v-if="eventsLoading" class="cards-grid py-2">
        <div v-for="i in 6" :key="i" class="skel" :style="{ height: '260px', borderRadius: '16px', animationDelay: (i * 0.08) + 's' }"></div>
      </div>
      <div v-else-if="!events.length" class="empty-state">
        <div class="ico"><font-awesome-icon :icon="['fas', 'calendar']" /></div>
        <p class="mb-0">{{ $t('pages.organization.show.events.empty') }}</p>
      </div>
      <div v-else-if="!filteredEvents.length" class="empty-state">
        <div class="ico"><font-awesome-icon :icon="['fas', 'sliders']" /></div>
        <p class="mb-0">{{ $t('pages.search.results.empty') }}</p>
      </div>
      <div v-else class="cards-grid py-2">
        <router-link
          v-for="event in filteredEvents"
          :key="event.id"
          :to="`/org/${$route.params.orgRoute}/event/${event.route}`"
          class="text-decoration-none"
        >
          <EhubEventCard
            :event="event"
            :org-color="org.color"
            :org-name="org.name"
          />
        </router-link>
      </div>
    </section>

    <!-- NEWS TAB -->
    <section class="tab-pane" :class="{ active: activeTab === 'news' }">
      <div v-if="articlesLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
      <div v-else-if="!articles.length" class="empty-state">
        <div class="ico"><font-awesome-icon :icon="['fas', 'file-lines']" /></div>
        <p class="mb-0">{{ $t('pages.organization.show.news.empty') }}</p>
      </div>
      <div v-else class="cards-grid">
        <router-link
          v-for="article in articles"
          :key="article.id"
          :to="`/org/${$route.params.orgRoute}/news/${article.slug}`"
          class="text-decoration-none"
        >
          <div class="news-card">
            <div class="news-cover" :style="{ background: heroGrad }">
              <img v-if="article.cover_image" :src="imgUrl(article.cover_image)" :alt="article.title" />
              <font-awesome-icon v-else :icon="['fas', 'newspaper']" class="cover-ico" />
            </div>
            <div class="news-body">
              <p class="news-date">{{ fmtDate(article.published_at) }}</p>
              <p class="news-title">{{ article.title }}</p>
              <p v-if="article.excerpt" class="news-excerpt">{{ article.excerpt }}</p>
              <div v-if="article.author" class="news-author">
                <span class="mini-av" :style="{ background: heroGrad }">
                  {{ initials(`${article.author.name || ''} ${article.author.surname || ''}`) }}
                </span>
                {{ $t('pages.organization.show.news.by') }} {{ article.author.name }}
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </section>

    <!-- MEMBERS TAB -->
    <section class="tab-pane" :class="{ active: activeTab === 'members' }">
      <div v-if="membersLoading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
      <EhubRoster v-else :members="rosterMembers" role-label-prefix="pages.organization.show.roles." />
    </section>

  </div>

  </template>
</template>

<style scoped>
.org-skel-page { background: var(--ehub-page); min-height: 100vh; }
.cover-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.empty-state {
  text-align: center;
  padding: 56px 20px;
  color: var(--ehub-muted);
}
.empty-state .ico {
  font-size: 2.4rem;
  opacity: .4;
  margin-bottom: 12px;
}
</style>
