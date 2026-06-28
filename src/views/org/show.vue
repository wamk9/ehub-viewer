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

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const store = useStore()

const CAT_CONFIG = {
  simracing:          { grad: ['#0098D8', '#00d4ff'], icon: 'flag-checkered' },
  racingcars:         { grad: ['#0098D8', '#00d4ff'], icon: 'flag-checkered' },
  rally:              { grad: ['#f08c00', '#ffc93c'], icon: 'car-side' },
  'esports-fps':      { grad: ['#e23b3b', '#ff8a3b'], icon: 'crosshairs' },
  'esports-moba':     { grad: ['#7C3AED', '#b06bff'], icon: 'dragon' },
  'esports-fighting': { grad: ['#d6336c', '#ff6b9d'], icon: 'hand-fist' },
  'esports-strategy': { grad: ['#1a6e4f', '#51cf66'], icon: 'chess-pawn' },
  'esports-sports':   { grad: ['#2563eb', '#60a5fa'], icon: 'futbol' },
  motorsport:         { grad: ['#f08c00', '#ffc93c'], icon: 'car-side' },
  motorbike:          { grad: ['#dc4f00', '#ff8a3b'], icon: 'motorcycle' },
  cycling:            { grad: ['#1971c2', '#4dabf7'], icon: 'bicycle' },
  running:            { grad: ['#1f8a5b', '#51cf66'], icon: 'person-running' },
  swimming:           { grad: ['#0284c7', '#38bdf8'], icon: 'person-swimming' },
  triathlon:          { grad: ['#7C3AED', '#c084fc'], icon: 'trophy' },
  hiking:             { grad: ['#4d7c0f', '#a3e635'], icon: 'mountain-sun' },
  crossfit:           { grad: ['#9a3412', '#fb923c'], icon: 'dumbbell' },
  rowing:             { grad: ['#1d4ed8', '#93c5fd'], icon: 'water' },
  archery:            { grad: ['#92400e', '#fbbf24'], icon: 'bullseye' },
  chess:              { grad: ['#495057', '#868e96'], icon: 'chess-knight' },
  'drone-racing':     { grad: ['#0e7490', '#22d3ee'], icon: 'helicopter' },
}

function catGrad(category) {
  const c = CAT_CONFIG[category]
  return c ? `linear-gradient(135deg, ${c.grad[0]}, ${c.grad[1]})` : 'linear-gradient(135deg, #0098D8, #00d4ff)'
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
function catIcon(category) {
  return CAT_CONFIG[category]?.icon || 'trophy'
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
const activeTab = ref('events')
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
const foundedYear = computed(() => org.value.created_at ? new Date(org.value.created_at).getFullYear() : '—')

// ── Initials ─────────────────────────────────────────────────────────
function initials(name) {
  return (name || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

// ── Format date ──────────────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(locale.value === 'pt-BR' ? 'pt-BR' : locale.value, { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Fee label ────────────────────────────────────────────────────────
function feeLabel(event) {
  if (!event.fee || event.fee == 0) return t('pages.organization.show.events.free')
  const sym = event.currency === 'usd' ? 'US$' : event.currency === 'eur' ? '€' : 'R$'
  return `${sym} ${Number(event.fee).toFixed(0)}`
}

// ── Role label ───────────────────────────────────────────────────────
function roleLabel(role) {
  const key = `pages.organization.show.roles.${role}`
  const val = t(key)
  return val === key ? role : val
}

// ── Image url ────────────────────────────────────────────────────────
function imgUrl(path) {
  return path ? SystemVars.baseUrl + 'storage/' + path : ''
}

// ── Tab navigation ───────────────────────────────────────────────────
function setTab(tab) {
  activeTab.value = tab
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

watch(activeTab, (tab) => {
  if (tab === 'events'   && !eventsLoaded.value)   loadEvents()
  if (tab === 'news'     && !articlesLoaded.value)  loadArticles()
  if (tab === 'about'    && !membersLoaded.value)   loadMembers()
})

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
    <div class="cover" :style="!org.route || coverImgError
      ? { background: heroGrad }
      : { background: heroGrad, backgroundImage: `url(${orgCoverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
      <img v-if="org.route" :src="orgCoverUrl" style="display:none"
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
            <span v-if="org.created_at" class="meta-chip">
              <font-awesome-icon :icon="['fas', 'calendar-check']" />
              {{ $t('pages.organization.show.stats.founded') }} {{ foundedYear }}
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
          <button class="btn btn-ghost round px-3">
            <font-awesome-icon :icon="['fas', 'envelope']" />
            {{ $t('pages.organization.show.send_message') }}
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
    <div class="ehub-tabs">
      <button class="tab-btn" :class="{ active: activeTab === 'events' }" @click="setTab('events')">
        <font-awesome-icon :icon="['fas', 'calendar-days']" />
        {{ $t('pages.organization.show.tabs.events') }}
        <span v-if="events.length" class="pill">{{ events.length }}</span>
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'news' }" @click="setTab('news')">
        <font-awesome-icon :icon="['fas', 'newspaper']" />
        {{ $t('pages.organization.show.tabs.news') }}
        <span v-if="articles.length" class="pill">{{ articles.length }}</span>
      </button>
      <button class="tab-btn" :class="{ active: activeTab === 'about' }" @click="setTab('about')">
        <font-awesome-icon :icon="['fas', 'circle-info']" />
        {{ $t('pages.organization.show.tabs.about') }}
      </button>
    </div>

    <!-- EVENTS TAB -->
    <section class="tab-pane" :class="{ active: activeTab === 'events' }">
      <div v-if="eventsLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
      <div v-else-if="!events.length" class="empty-state">
        <div class="ico"><font-awesome-icon :icon="['fas', 'calendar']" /></div>
        <p class="mb-0">{{ $t('pages.organization.show.events.empty') }}</p>
      </div>
      <div v-else class="cards-grid">
        <router-link
          v-for="event in events"
          :key="event.id"
          :to="`/org/${$route.params.orgRoute}/event/${event.route}`"
          class="text-decoration-none"
        >
          <div class="event-card">
            <div class="event-cover" :style="{ background: org.color ? heroGrad : catGrad(event.category) }">
              <img v-if="event.cover_image" :src="imgUrl(event.cover_image)" :alt="event.name" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" />
              <font-awesome-icon v-else :icon="['fas', catIcon(event.category)]" class="cover-ico"
                :style="org.color ? { color: orgTextColor } : {}" />
              <div class="event-badges">
                <span class="ev-badge" :class="event.fee == 0 ? 'free' : 'paid'">
                  {{ feeLabel(event) }}
                </span>
                <span class="ev-badge" :class="event.finished ? 'status-finished' : 'status-active'">
                  {{ event.finished ? $t('pages.organization.show.events.finished') : $t('pages.organization.show.events.active') }}
                </span>
              </div>
              <span class="cover-org" :style="org.color ? { color: orgTextColor } : {}">{{ org.name }}</span>
            </div>
            <div class="event-body">
              <p class="ev-title">{{ event.name }}</p>
              <div v-if="event.runmode" class="ev-meta">
                <font-awesome-icon :icon="['fas', event.runmode === 'online' ? 'wifi' : 'location-dot']" />
                {{ event.runmode === 'online' ? $t('pages.organization.show.events.online') : $t('pages.organization.show.events.irl') }}
              </div>
              <div v-if="event.start_at" class="ev-meta">
                <font-awesome-icon :icon="['fas', 'calendar-days']" />
                {{ fmtDate(event.start_at) }}
              </div>
            </div>
            <div class="event-foot">
              <span v-if="event.category" class="cat-chip">{{ $t(`categories.names.${event.category}`) }}</span>
              <span v-if="event.subcategory" class="cat-chip sub">{{ $t(`categories.subcategories.${event.subcategory}`, event.subcategory) }}</span>
            </div>
          </div>
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
            <li v-if="org.created_at">
              <span class="ico"><font-awesome-icon :icon="['fas', 'calendar-check']" /></span>
              <span class="meta">
                <span class="k">{{ $t('pages.organization.show.about.founded') }}</span>
                <span class="val">{{ foundedYear }}</span>
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

      <!-- Members -->
      <div class="members-head">
        <h3>
          {{ $t('pages.organization.show.about.members') }}
          <span v-if="members.length" class="count">({{ members.length }})</span>
        </h3>
      </div>
      <div v-if="membersLoading" class="text-center py-4">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
      <div v-else class="members-grid">
        <router-link
          v-for="m in members"
          :key="m.id"
          :to="m.user?.username ? `/profile/${m.user.username}` : '#'"
          class="member-card"
          style="text-decoration:none;color:inherit;"
        >
          <span class="member-av" :style="!m.user?.image ? { background: catGrad(events[0]?.category) } : {}">
            <img v-if="m.user?.image" :src="imgUrl(m.user.image)" :alt="`${m.user.name} ${m.user.surname}`" />
            <template v-else>{{ initials(`${m.user?.name || ''} ${m.user?.surname || ''}`) }}</template>
          </span>
          <div class="member-info">
            <div class="member-name">{{ m.user?.name }} {{ m.user?.surname }}</div>
            <span class="role-chip" :class="m.role">{{ roleLabel(m.role) }}</span>
          </div>
        </router-link>
      </div>
    </section>

  </div>

  <footer class="home-footer" style="margin-top: 48px;">
    {{ $t('pages.homepage.entrance.footer') }}
  </footer>
  </template>
</template>

<style scoped>
.org-skel-page { background: var(--ehub-page); min-height: 100vh; }
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
.home-footer {
  border-top: 1px solid var(--ehub-line);
  padding: 28px 20px;
  text-align: center;
  color: var(--ehub-muted);
  font-size: .82rem;
}
</style>
