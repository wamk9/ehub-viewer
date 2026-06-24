<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import Auth from '@/helpers/communication/Auth.js'
import Api from '@/helpers/communication/Connection'
import Notification from '@/helpers/communication/Notification.js'
import { createSSE } from '@/helpers/communication/useLiveSSE.js'
import EhubLogo from '@/components/general/EhubLogo.vue'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const store = useStore()

const isLogged = computed(() => !!store.getters.getToken)

// ── Language ───────────────────────────────────────────────────────
function setLang(lang) {
  locale.value = lang
  localStorage.setItem('lang', lang)
}

// ── Theme ──────────────────────────────────────────────────────────
const theme = ref(localStorage.getItem('ehub_theme') || 'light')
function applyTheme(val) {
  document.documentElement.setAttribute('data-bs-theme', val)
  localStorage.setItem('ehub_theme', val)
}
function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  applyTheme(theme.value)
}

// ── Drawer ─────────────────────────────────────────────────────────
const drawerOpen = ref(false)
watch(() => route.path, () => { drawerOpen.value = false })

// ── Profile ────────────────────────────────────────────────────────
const profileName = ref('')
const profileUsername = ref('')
const profileImage = ref('')

async function loadProfile() {
  if (!isLogged.value) return
  try {
    const result = await Api.getAsync('/user/profile')
    if (result.code === 200) {
      const d = result.response
      profileName.value = `${d.name || ''} ${d.surname || ''}`.trim()
      profileUsername.value = d.username || ''
      profileImage.value = d.image || ''
    }
  } catch { /* keep placeholder */ }
}

// ── Notifications ──────────────────────────────────────────────────
const notifications = ref([])
const hasUnread = computed(() => notifications.value.some(n => !n.read_at))
let notifSSE = null

function notifText(notif) {
  try {
    const params = notif.description ? JSON.parse(notif.description) : {}
    const result = t(notif.title, params)
    if (result === notif.title && !notif.title.startsWith('notification.'))
      return t('notification.' + notif.title, params)
    return result
  } catch { return notif.title }
}
function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)    return t('notification.time.just_now')
  if (diff < 3600)  return t('notification.time.minutes_ago', { n: Math.floor(diff / 60) })
  if (diff < 86400) return t('notification.time.hours_ago',   { n: Math.floor(diff / 3600) })
  return t('notification.time.days_ago', { n: Math.floor(diff / 86400) })
}
async function handleNotifClick(notif) {
  if (!notif.read_at) {
    notif.read_at = new Date().toISOString()
    await Notification.markRead(notif.id)
  }
  if (notif.route) router.push(notif.route)
}
async function handleDeleteNotif(id) {
  await Notification.remove(id)
  notifications.value = notifications.value.filter(n => n.id !== id)
}
async function handleClearAll() {
  await Notification.clearAll()
  notifications.value = []
}

// ── Auth ───────────────────────────────────────────────────────────
async function handleLogout() {
  await Auth.logout()
  router.push({ name: 'home' })
}

// ── Lifecycle ──────────────────────────────────────────────────────
function onResize() {
  if (window.innerWidth >= 768) {
    drawerOpen.value = false
  } else {
    document.querySelectorAll('[data-bs-toggle="dropdown"]').forEach(el => {
      window.bootstrap?.Dropdown.getInstance(el)?.hide()
    })
  }
}

onMounted(() => {
  applyTheme(theme.value)
  loadProfile()
  window.addEventListener('resize', onResize)
  if (isLogged.value) {
    notifSSE = createSSE('notifications', {}, (payload) => {
      notifications.value = Array.isArray(payload) ? payload : []
    })
    notifSSE.connect()
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (notifSSE) notifSSE.disconnect()
})
</script>

<template>
  <nav class="ehub-navbar">
    <!-- Logo -->
    <router-link to="/" class="nav-mark">
      <EhubLogo />
    </router-link>

    <!-- Desktop nav links -->
    <div class="ehub-nav-links d-none d-md-flex">
      <router-link to="/" :class="{ active: route.path === '/' }">
        {{ $t('navbar.links.events') }}
      </router-link>
      <router-link to="/orgs" :class="{ active: route.path.startsWith('/orgs') }">
        {{ $t('navbar.links.orgs') }}
      </router-link>
      <router-link to="/teams" :class="{ active: route.path.startsWith('/teams') }">
        {{ $t('navbar.links.teams') }}
      </router-link>
      <router-link v-if="isLogged" to="/my-teams" :class="{ active: route.path.startsWith('/my-teams') }">
        {{ $t('navbar.links.myteams') }}
      </router-link>
      <router-link to="/search" :class="{ active: route.path === '/search' }">
        {{ $t('navbar.search.title') }}
      </router-link>
    </div>

    <div class="flex-grow-1"></div>

    <!-- Desktop right side -->
    <template v-if="isLogged">
      <!-- Notifications -->
      <div class="dropdown">
        <button class="nav-icon-btn position-relative" data-bs-toggle="dropdown" aria-expanded="false">
          <font-awesome-icon :icon="['fas', 'bell']" />
          <span v-if="hasUnread" class="notif-badge"></span>
        </button>
        <div class="dropdown-menu dropdown-menu-end nav-dropdown notif-panel">
          <div class="nav-dropdown-header d-flex align-items-center justify-content-between">
            <span class="fw-semibold" style="font-size:.875rem">{{ $t('navbar.user.logged.notifications.title') }}</span>
            <button v-if="notifications.length" class="clear-btn" @click="handleClearAll">
              {{ $t('notification.clear_all') }}
            </button>
          </div>
          <hr class="nav-dropdown-divider" />
          <div v-for="notif in notifications" :key="notif.id" class="notif-item" @click="handleNotifClick(notif)">
            <span class="notif-dot" :class="{ unread: !notif.read_at }"></span>
            <div class="flex-grow-1 overflow-hidden">
              <div class="notif-text" :class="notif.read_at ? 'text-muted' : ''">{{ notifText(notif) }}</div>
              <div class="notif-time">{{ timeAgo(notif.created_at) }}</div>
            </div>
            <button class="notif-del" @click.stop="handleDeleteNotif(notif.id)">×</button>
          </div>
          <div v-if="!notifications.length" class="notif-empty">
            <font-awesome-icon :icon="['fas', 'bell']" class="opacity-25 me-2" />
            {{ $t('notification.empty') }}
          </div>
        </div>
      </div>

      <!-- Profile -->
      <div class="dropdown">
        <button class="nav-profile-btn d-none d-md-flex" data-bs-toggle="dropdown" aria-expanded="false">
          <img v-if="profileImage" :src="profileImage" class="nav-avatar" alt="avatar" />
          <span v-else class="nav-avatar nav-avatar-initial">
            {{ (profileName || '?')[0].toUpperCase() }}
          </span>
        </button>
        <div class="dropdown-menu dropdown-menu-end nav-dropdown" style="min-width:210px">
          <div class="nav-dropdown-header">
            <div class="fw-semibold" style="font-size:.9rem">{{ profileName || '—' }}</div>
            <div class="text-muted" style="font-size:.78rem">@{{ profileUsername || '…' }}</div>
          </div>
          <hr class="nav-dropdown-divider" />
          <router-link class="nav-dropdown-item" to="/profile">
            <font-awesome-icon :icon="['fas', 'user']" class="me-2 opacity-75" />
            {{ $t('navbar.user.logged.profile.title') }}
          </router-link>
          <router-link class="nav-dropdown-item" to="/my-orgs">
            <font-awesome-icon :icon="['fas', 'building']" class="me-2 opacity-75" />
            {{ $t('navbar.user.logged.my-orgs.title') }}
          </router-link>
          <router-link class="nav-dropdown-item" to="/my-teams">
            <font-awesome-icon :icon="['fas', 'shield-halved']" class="me-2 opacity-75" />
            {{ $t('navbar.links.myteams') }}
          </router-link>
          <hr class="nav-dropdown-divider" />
          <button class="nav-dropdown-item logout-item w-100" @click="handleLogout">
            <font-awesome-icon :icon="['fas', 'right-from-bracket']" class="me-2 opacity-75" />
            {{ $t('navbar.user.logged.logout.title') }}
          </button>
        </div>
      </div>
    </template>

    <template v-else>
      <router-link to="/login" class="btn btn-primary round btn-sm px-3 d-none d-md-inline-flex">
        {{ $t('navbar.user.unlogged.login.title') }}
      </router-link>
    </template>

    <!-- Language selector (desktop only) -->
    <div class="lang-seg d-none d-md-flex">
      <button :class="{ active: locale === 'pt-BR' }" @click="setLang('pt-BR')">PT</button>
      <button :class="{ active: locale === 'en' }"    @click="setLang('en')">EN</button>
      <button :class="{ active: locale === 'es' }"    @click="setLang('es')">ES</button>
    </div>

    <!-- Theme toggle -->
    <button class="theme-btn" @click="toggleTheme" :title="theme === 'dark' ? 'Modo claro' : 'Modo escuro'">
      <font-awesome-icon :icon="['fas', theme === 'dark' ? 'sun' : 'moon']" />
    </button>

    <!-- Hamburger (mobile only) -->
    <button class="nav-icon-btn d-md-none" @click="drawerOpen = true" aria-label="Menu">
      <font-awesome-icon :icon="['fas', 'bars']" />
    </button>
  </nav>

  <!-- Drawer backdrop -->
  <Transition name="backdrop">
    <div v-if="drawerOpen" class="nav-backdrop" @click="drawerOpen = false"></div>
  </Transition>

  <!-- Drawer -->
  <Transition name="drawer">
    <div v-if="drawerOpen" class="nav-drawer">
      <!-- Header -->
      <div class="drawer-header">
        <button class="nav-icon-btn ms-auto" @click="drawerOpen = false">
          <font-awesome-icon :icon="['fas', 'xmark']" />
        </button>
      </div>

      <!-- Nav links -->
      <div class="drawer-nav">
        <router-link class="drawer-link" to="/">
          <font-awesome-icon :icon="['fas', 'house']" class="me-3" />
          {{ $t('navbar.links.events') }}
        </router-link>
        <router-link class="drawer-link" to="/orgs">
          <font-awesome-icon :icon="['fas', 'building-flag']" class="me-3" />
          {{ $t('navbar.links.orgs') }}
        </router-link>
        <router-link class="drawer-link" to="/teams">
          <font-awesome-icon :icon="['fas', 'shield-halved']" class="me-3" />
          {{ $t('navbar.links.teams') }}
        </router-link>
        <router-link class="drawer-link" to="/search">
          <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="me-3" />
          {{ $t('navbar.search.title') }}
        </router-link>
      </div>

      <hr class="drawer-divider" />

      <!-- Auth section -->
      <template v-if="isLogged">
        <div class="drawer-profile">
          <img v-if="profileImage" :src="profileImage" class="drawer-avatar" alt="avatar" />
          <span v-else class="drawer-avatar drawer-avatar-initial">
            {{ (profileName || '?')[0].toUpperCase() }}
          </span>
          <div class="overflow-hidden">
            <div class="fw-semibold text-truncate" style="font-size:.9rem">{{ profileName || '—' }}</div>
            <div class="text-muted text-truncate" style="font-size:.78rem">@{{ profileUsername }}</div>
          </div>
        </div>
        <div class="drawer-nav">
          <router-link class="drawer-link" to="/profile">
            <font-awesome-icon :icon="['fas', 'user']" class="me-3" />
            {{ $t('navbar.user.logged.profile.title') }}
          </router-link>
          <router-link class="drawer-link" to="/my-orgs">
            <font-awesome-icon :icon="['fas', 'building']" class="me-3" />
            {{ $t('navbar.user.logged.my-orgs.title') }}
          </router-link>
          <router-link class="drawer-link" to="/my-teams">
            <font-awesome-icon :icon="['fas', 'shield-halved']" class="me-3" />
            {{ $t('navbar.links.myteams') }}
          </router-link>
        </div>
        <hr class="drawer-divider" />
        <button class="drawer-link drawer-logout w-100" @click="handleLogout">
          <font-awesome-icon :icon="['fas', 'right-from-bracket']" class="me-3" />
          {{ $t('navbar.user.logged.logout.title') }}
        </button>
      </template>

      <template v-else>
        <div class="drawer-nav">
          <router-link class="drawer-link" to="/login">
            <font-awesome-icon :icon="['fas', 'right-to-bracket']" class="me-3" />
            {{ $t('navbar.user.unlogged.login.title') }}
          </router-link>
          <router-link class="drawer-link" to="/register">
            <font-awesome-icon :icon="['fas', 'user-plus']" class="me-3" />
            {{ $t('navbar.user.unlogged.register.title') }}
          </router-link>
        </div>
      </template>

      <!-- Footer -->
      <div class="drawer-footer">
        <div class="lang-seg">
          <button :class="{ active: locale === 'pt-BR' }" @click="setLang('pt-BR')">PT</button>
          <button :class="{ active: locale === 'en' }"    @click="setLang('en')">EN</button>
          <button :class="{ active: locale === 'es' }"    @click="setLang('es')">ES</button>
        </div>
        <button class="theme-btn" @click="toggleTheme">
          <font-awesome-icon :icon="['fas', theme === 'dark' ? 'sun' : 'moon']" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ── Nav icon button ── */
.nav-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 7px 9px;
  border-radius: 8px;
  color: var(--ehub-muted);
  font-size: 1rem;
  transition: background .15s, color .15s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-icon-btn:hover { background: var(--ehub-field-bg); color: var(--ehub-ink); }

/* ── Theme btn (from DS, scoped override to add text support) ── */
.theme-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 7px 9px;
  border-radius: 8px;
  color: var(--ehub-muted);
  font-size: .88rem;
  transition: background .15s, color .15s;
}
.theme-btn:hover { background: var(--ehub-field-bg); color: var(--ehub-ink); }

/* ── Notification badge ── */
.notif-badge {
  position: absolute;
  top: 5px; right: 5px;
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #e05454;
  border: 1px solid var(--ehub-card);
}

/* ── Profile button ── */
.nav-profile-btn {
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background .15s;
  color: var(--ehub-ink);
}
.nav-profile-btn:hover { background: var(--ehub-field-bg); }
.nav-avatar {
  width: 30px; height: 30px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.nav-avatar-initial {
  background: var(--ehub-primary);
  color: #fff;
  font-size: .8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-profile-name {
  font-size: .85rem;
  font-weight: 600;
  color: var(--ehub-ink);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Dropdown ── */
.nav-dropdown {
  background: var(--ehub-card);
  border: 1px solid var(--ehub-line);
  border-radius: 12px;
  box-shadow: var(--ehub-shadow);
  padding: 6px 0;
  overflow: hidden;
}
.nav-dropdown-header {
  padding: 10px 14px 8px;
  color: var(--ehub-ink);
}
.nav-dropdown-divider { border-color: var(--ehub-line); margin: 4px 0; }
.nav-dropdown-item {
  display: flex;
  align-items: center;
  padding: 8px 14px;
  font-size: .875rem;
  color: var(--ehub-ink);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  transition: background .15s;
  text-align: left;
}
.nav-dropdown-item:hover { background: var(--ehub-field-bg); }
.logout-item { color: #e05454; }
.logout-item:hover { background: rgba(224,84,84,.08); }

/* ── Notification panel ── */
.notif-panel { min-width: 300px; max-width: 340px; }
.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 9px 14px;
  cursor: pointer;
  transition: background .15s;
}
.notif-item:hover { background: var(--ehub-field-bg); }
.notif-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: transparent;
  flex-shrink: 0;
  margin-top: 5px;
}
.notif-dot.unread { background: var(--ehub-primary); }
.notif-text { font-size: .8rem; line-height: 1.35; color: var(--ehub-ink); }
.notif-time { font-size: .7rem; color: var(--ehub-muted); margin-top: 2px; }
.notif-del {
  background: none; border: none; color: var(--ehub-muted);
  cursor: pointer; font-size: 1rem; padding: 0 2px; line-height: 1;
  transition: color .15s; flex-shrink: 0;
}
.notif-del:hover { color: #e05454; }
.notif-empty { padding: 20px 14px; font-size: .85rem; color: var(--ehub-muted); text-align: center; }
.clear-btn {
  background: none; border: none; cursor: pointer;
  font-size: .78rem; color: var(--ehub-muted); padding: 0;
}
.clear-btn:hover { color: var(--ehub-ink); }

/* ── Drawer ── */
.nav-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.45);
  z-index: 45;
}
.nav-drawer {
  position: fixed;
  top: 0; right: 0; bottom: 0;
  width: 280px;
  background: var(--ehub-card);
  border-left: 1px solid var(--ehub-line);
  z-index: 46;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 60px;
  border-bottom: 1px solid var(--ehub-line);
  flex-shrink: 0;
}
.drawer-nav { display: flex; flex-direction: column; padding: 8px 0; }
.drawer-link {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  font-size: .92rem;
  font-weight: 500;
  color: var(--ehub-ink);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  transition: background .15s, color .15s;
  text-align: left;
}
.drawer-link:hover,
.drawer-link.router-link-active { background: var(--ehub-field-bg); color: var(--ehub-primary); }
.drawer-logout { color: #e05454; }
.drawer-logout:hover { background: rgba(224,84,84,.08); }
.drawer-divider { border-color: var(--ehub-line); margin: 4px 16px; }
.drawer-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
}
.drawer-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.drawer-avatar-initial {
  background: var(--ehub-primary);
  color: #fff;
  font-size: .9rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.drawer-footer {
  margin-top: auto;
  padding: 12px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--ehub-line);
}

/* ── Transitions ── */
.backdrop-enter-active, .backdrop-leave-active { transition: opacity .25s ease; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }

.drawer-enter-active, .drawer-leave-active { transition: transform .25s ease; }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }
</style>
