<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AvatarUpload from '@/components/inputs/AvatarUpload.vue'
import Api          from '@/helpers/communication/Connection'
import store        from '@/store'
import { toast }   from '@/helpers/toast.js'
import SystemVars   from '@/helpers/General/SystemVars'

const { t } = useI18n()
const router = useRouter()
const route  = useRoute()

const activePanel = ref('overview')
const panels = ['overview', 'personal', 'appearance', 'social', 'privacy', 'notifications', 'account']

function switchPanel(panel) {
  activePanel.value = panel
  router.replace({ name: 'user-profile', params: { panel: panel === 'overview' ? '' : panel } })
}

watch(() => route.params.panel, (p) => {
  activePanel.value = p && panels.includes(p) ? p : 'overview'
}, { immediate: true })

const loading = ref(true)
const isSaving = ref(false)

const profile = reactive({
  name: '', surname: '', username: '', mail: '', phone: '',
  bio: '', location: '', birthdate: '', car_number: '', driving_style: '',
  favorite_category: '', motto: '',
  discord: '', youtube: '', twitch: '', x_twitter: '', linkedin: '', website: '',
  profile_color: '#0098D8', profile_visibility: 'public', notification_prefs: null,
  auth_provider: null, google_linked: false,
  image: null, cover: null,
  email_verified_at: null, created_at: null,
  stats: { events: 0, wins: 0, podiums: 0 },
})

const fPersonal = reactive({
  name: '', surname: '', phone: '', username: '',
  bio: '', location: '', birthdate: '', car_number: '',
  driving_style: '', favorite_category: '', motto: '',
})

const fAppearance = reactive({ image: '', profile_color: '#0098D8' })
const coverPreview  = ref(null)
const coverRemoved  = ref(false)
const coverFileRef  = ref(null)
const avatarFileRef = ref(null)

const fSocial = reactive({
  discord: '', youtube: '', twitch: '', x_twitter: '', linkedin: '', website: '',
})

const fPrivacy = reactive({
  profile_visibility: 'public', profile_indexable: false,
  show_email: false, show_phone: false, show_birthdate: false, show_followers: true,
})

// Notification choices: one row per type, "in eHub" and "by e-mail" (mirrors NotificationService::DEFAULTS).
const NOTIF_TYPES = ['registration', 'event_start', 'results', 'notices', 'news', 'teams', 'org', 'org_admin']
const NOTIF_DEFAULTS = {
  registration: { app: true, email: true }, event_start: { app: true, email: true }, results: { app: true, email: true },
  notices: { app: true, email: true }, news: { app: true, email: false }, teams: { app: true, email: true },
  org: { app: true, email: true }, org_admin: { app: true, email: true },
}
const NOTIF_LOCKED = ['registration']   // about the person's own registration/account: always sent
const fChannels = reactive(JSON.parse(JSON.stringify(NOTIF_DEFAULTS)))

const pwd = reactive({ current_password: '', password: '', password_confirmation: '' })
const deletePassword = ref('')
const deleteConfirm  = ref(false)
const deleteBlockers = ref(null)
const exporting = ref(false)

// ── Change e-mail: password → code sent to the new address → done ──
const mailChange = reactive({ step: 'idle', mail: '', password: '', code: '', busy: false })
function resetMailChange() { Object.assign(mailChange, { step: 'idle', mail: '', password: '', code: '', busy: false }) }
async function sendMailCode() {
  if (!mailChange.mail.trim() || !mailChange.password) { toast.error(t('users.profile.account.change_mail.fill')); return }
  mailChange.busy = true
  try {
    const r = await Api.postAsync('/user/email/send-code', { mail: mailChange.mail.trim(), password: mailChange.password })
    if (r.code === 200) { mailChange.step = 'code'; toast.success(t('users.profile.account.change_mail.code_sent', { mail: mailChange.mail.trim() })) }
    else if (r.code === 403) toast.error(t('users.profile.privacy.password.error.wrong'))
    else if (r.code === 429) toast.error(t('users.profile.account.change_mail.too_many'))
    else if (r.response?.message === 'same_mail') toast.error(t('users.profile.account.change_mail.same'))
    else toast.error(Object.values(r.response?.errors || {})[0]?.[0] || t('users.profile.error.generic'))
  } finally { mailChange.busy = false }
}
async function confirmMailCode() {
  mailChange.busy = true
  try {
    const r = await Api.postAsync('/user/email/confirm', { code: mailChange.code.trim() })
    if (r.code === 200) {
      profile.mail = r.response.mail
      profile.email_verified_at = new Date().toISOString()
      toast.success(t('users.profile.account.change_mail.done'))
      resetMailChange()
    } else if (r.response?.message === 'code_expired' || r.code === 429) {
      toast.error(t('users.profile.account.change_mail.expired')); mailChange.step = 'form'; mailChange.code = ''
    } else toast.error(t('users.profile.account.change_mail.wrong_code'))
  } finally { mailChange.busy = false }
}

// ── Google sign-in for e-mail accounts ──
const unlinking = ref(false)
function linkGoogle() { window.location.href = SystemVars.baseUrl + 'auth/social/google/link' }
async function unlinkGoogle() {
  unlinking.value = true
  try {
    const r = await Api.deleteAsync('/user/social/google')
    if (r.code === 200) { profile.google_linked = false; toast.success(t('users.profile.account.oauth.unlinked')) }
    else toast.error(t('users.profile.error.generic'))
  } finally { unlinking.value = false }
}
// Coming back from Google: /profile/account/google-linked (or -mismatch / -failed).
function readLinkStatus(status) {
  if (!status) return
  if (status === 'google-linked') toast.success(t('users.profile.account.oauth.linked'))
  else if (status === 'google-mismatch') toast.error(t('users.profile.account.oauth.mismatch'))
  else toast.error(t('users.profile.account.oauth.failed'))
  router.replace({ name: 'user-profile', params: { panel: 'account' } })
}

// LGPD art. 18: the person downloads everything eHub keeps about them.
async function exportData() {
  exporting.value = true
  try {
    const result = await Api.getAsync('/user/export')
    if (result.code !== 200) { toast.error(t('users.profile.error.generic')); return }
    const blob = new Blob([JSON.stringify(result.response, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `ehub-${profile.username || 'meus-dados'}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  } catch { toast.error(t('users.profile.error.generic')) }
  finally { exporting.value = false }
}

const GRAD_SWATCHES = [
  ['#0098D8', '#00d4ff'],
  ['#7C3AED', '#b06bff'],
  ['#e23b3b', '#ff8a3b'],
  ['#1f8a5b', '#51cf66'],
  ['#f08c00', '#ffc93c'],
  ['#d6336c', '#ff6b9d'],
  ['#495057', '#868e96'],
  ['#0f172a', '#334155'],
]

const selectedGrad = computed(() => {
  const idx = GRAD_SWATCHES.findIndex(g => g[0] === fAppearance.profile_color)
  return idx >= 0 ? idx : 0
})

function selectGrad(i) {
  fAppearance.profile_color = GRAD_SWATCHES[i][0]
}

function gradStyle(i) {
  const g = GRAD_SWATCHES[i]
  return `linear-gradient(135deg, ${g[0]}, ${g[1]})`
}

const avatarGrad = computed(() => {
  const idx = selectedGrad.value
  return gradStyle(idx)
})

// Competition number / style only matter for racing sports (eHub is multi-sport).
const RACING = ['simracing', 'racingcars', 'rally', 'motorsport', 'motorbike', 'karting', 'drone-racing']
const isRacing = computed(() => RACING.includes(profile.favorite_category))
const completeness = computed(() => {
  const checks = [
    !!profile.bio, !!profile.location, !!profile.birthdate,
    ...(isRacing.value ? [!!profile.car_number, !!profile.driving_style] : []),
    !!profile.favorite_category, !!profile.motto,
    !!profile.image, !!profile.cover,
    !!(profile.discord || profile.youtube || profile.twitch || profile.x_twitter || profile.linkedin || profile.website),
  ]
  return Math.round(checks.filter(Boolean).length / checks.length * 100)
})

function parseErrors(response) {
  if (response?.errors && typeof response.errors === 'object')
    return Object.values(response.errors).flat()
  return [response?.message ?? t('users.profile.error.generic')]
}

function withCache(url) {
  if (!url || url.startsWith('data:')) return url
  return url + (url.includes('?') ? '&' : '?') + 'cb=' + Date.now()
}

function defaultPrefs() {
  return {
    privacy: { show_email: false, show_phone: false, show_birthdate: false, show_followers: true },
    championship: { event_start: true, stage_update: true, results: true },
    social: { new_follower: true, org_invitation: true },
    email: { event_start: false, results: false },
  }
}

function applyProfile(d) {
  Object.assign(profile, {
    ...d,
    image: withCache(d.image),
    cover: withCache(d.cover),
    stats: d.stats ?? { events: 0, wins: 0, podiums: 0 },
    notification_prefs: d.notification_prefs ?? defaultPrefs(),
  })
  Object.assign(fPersonal, {
    name: d.name ?? '', surname: d.surname ?? '', phone: d.phone ?? '',
    username: d.username ?? '', bio: d.bio ?? '', location: d.location ?? '',
    birthdate: d.birthdate ?? '', car_number: d.car_number ?? '',
    driving_style: d.driving_style ?? '', favorite_category: d.favorite_category ?? '',
    motto: d.motto ?? '',
  })
  fAppearance.image         = withCache(d.image) ?? ''
  fAppearance.profile_color = d.profile_color ?? '#0098D8'
  Object.assign(fSocial, {
    discord: d.discord ?? '', youtube: d.youtube ?? '', twitch: d.twitch ?? '',
    x_twitter: d.x_twitter ?? '', linkedin: d.linkedin ?? '', website: d.website ?? '',
  })
  const prefs = profile.notification_prefs ?? defaultPrefs()
  fPrivacy.profile_visibility = d.profile_visibility ?? 'public'
  fPrivacy.profile_indexable = !!d.profile_indexable
  fPrivacy.show_email     = prefs.privacy?.show_email     ?? false
  fPrivacy.show_phone     = prefs.privacy?.show_phone     ?? false
  fPrivacy.show_birthdate = prefs.privacy?.show_birthdate ?? false
  fPrivacy.show_followers = prefs.privacy?.show_followers ?? true
  NOTIF_TYPES.forEach((k) => { fChannels[k] = { ...NOTIF_DEFAULTS[k], ...(prefs.channels?.[k] || {}) } })
  coverPreview.value = null
  coverRemoved.value = false
}

async function fetchProfile() {
  try {
    const result = await Api.getAsync('/user/profile')
    if (result.code === 200) applyProfile(result.response)
    else toast.error(t('users.profile.error.fetch'))
  } catch {
    toast.error(t('users.profile.error.fetch'))
  } finally {
    loading.value = false
  }
}

async function savePersonal() {
  isSaving.value = true
  try {
    const result = await Api.patchAsync('/user/profile', { ...fPersonal })
    if (result.code === 200) { toast.success(t('users.profile.personal.success')); await fetchProfile() }
    else toast.error(parseErrors(result.response).join('\n'))
  } catch { toast.error(t('users.profile.error.generic')) }
  finally { isSaving.value = false }
}

async function saveAppearance() {
  isSaving.value = true
  try {
    const tasks = []
    const profilePayload = { profile_color: fAppearance.profile_color }
    if (fAppearance.image?.startsWith('data:')) profilePayload.image = fAppearance.image
    tasks.push(Api.patchAsync('/user/profile', profilePayload))
    if (coverPreview.value) tasks.push(Api.postAsync('/user/upload/cover', { cover: coverPreview.value }))
    else if (coverRemoved.value) tasks.push(Api.deleteAsync('/user/upload/cover'))
    await Promise.all(tasks)
    toast.success(t('users.profile.appearance.success'))
    await fetchProfile()
  } catch { toast.error(t('users.profile.error.generic')) }
  finally { isSaving.value = false }
}

function onCoverFile(e) {
  const file = e.target.files?.[0]; if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { coverPreview.value = ev.target.result; coverRemoved.value = false }
  reader.readAsDataURL(file)
}

function onAvatarFile(e) {
  const file = e.target.files?.[0]; if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { fAppearance.image = ev.target.result }
  reader.readAsDataURL(file)
}

async function saveSocial() {
  isSaving.value = true
  try {
    const result = await Api.patchAsync('/user/profile', { ...fSocial })
    if (result.code === 200) { toast.success(t('users.profile.social.success')); await fetchProfile() }
    else toast.error(parseErrors(result.response).join('\n'))
  } catch { toast.error(t('users.profile.error.generic')) }
  finally { isSaving.value = false }
}

async function savePrivacy() {
  isSaving.value = true
  const prefs = {
    ...(profile.notification_prefs ?? defaultPrefs()),
    privacy: { show_email: fPrivacy.show_email, show_phone: fPrivacy.show_phone, show_birthdate: fPrivacy.show_birthdate, show_followers: fPrivacy.show_followers },
  }
  try {
    // Search engines only make sense for a public profile.
    const indexable = fPrivacy.profile_visibility === 'public' && fPrivacy.profile_indexable
    const result = await Api.patchAsync('/user/profile', { profile_visibility: fPrivacy.profile_visibility, profile_indexable: indexable, notification_prefs: prefs })
    if (result.code === 200) { toast.success(t('users.profile.privacy.success')); await fetchProfile() }
    else toast.error(parseErrors(result.response).join('\n'))
  } catch { toast.error(t('users.profile.error.generic')) }
  finally { isSaving.value = false }
}

async function saveNotifications() {
  isSaving.value = true
  const channels = {}
  NOTIF_TYPES.forEach((k) => { channels[k] = { app: !!fChannels[k].app, email: !!fChannels[k].email } })
  const prefs = { ...(profile.notification_prefs ?? defaultPrefs()), channels }
  try {
    const result = await Api.patchAsync('/user/profile', { notification_prefs: prefs })
    if (result.code === 200) { toast.success(t('users.profile.notifications.success')); await fetchProfile() }
    else toast.error(parseErrors(result.response).join('\n'))
  } catch { toast.error(t('users.profile.error.generic')) }
  finally { isSaving.value = false }
}

async function savePassword() {
  if (pwd.password !== pwd.password_confirmation) { toast.error(t('users.profile.privacy.password.error.mismatch')); return }
  isSaving.value = true
  try {
    const result = await Api.patchAsync('/user/password', { current_password: pwd.current_password, password: pwd.password, password_confirmation: pwd.password_confirmation })
    if (result.code === 200) {
      toast.success(t('users.profile.privacy.password.success'))
      pwd.current_password = ''; pwd.password = ''; pwd.password_confirmation = ''
    } else if (result.code === 403) toast.error(t('users.profile.privacy.password.error.wrong'))
    else toast.error(parseErrors(result.response).join('\n'))
  } catch { toast.error(t('users.profile.error.generic')) }
  finally { isSaving.value = false }
}

async function deleteAccount() {
  if (!deletePassword.value) { toast.error(t('users.profile.privacy.password.error.wrong')); return }
  isSaving.value = true
  try {
    deleteBlockers.value = null
    const body = profile.auth_provider ? { confirm: deletePassword.value.trim() } : { password: deletePassword.value }
    const result = await Api.deleteAsync('/user', body)
    if (result.code === 200) { store.dispatch('removeToken'); toast.success(t('users.profile.account.danger.done')); router.push({ name: 'events' }) }
    else if (result.code === 409) deleteBlockers.value = { organizations: result.response?.organizations || [], teams: result.response?.teams || [] }
    else if (result.code === 403 || result.code === 422) toast.error(t(profile.auth_provider ? 'users.profile.account.danger.wrong_username' : 'users.profile.privacy.password.error.wrong'))
    else toast.error(t('users.profile.error.generic'))
  } catch { toast.error(t('users.profile.error.generic')) }
  finally { isSaving.value = false }
}

const panelIcons = {
  overview: 'chart-line', personal: 'circle-user', appearance: 'palette',
  social: 'earth-americas', privacy: 'shield-halved', notifications: 'bell', account: 'gear',
}

watch(() => route.params.status, readLinkStatus)

onMounted(() => {
  readLinkStatus(route.params.status)
  fetchProfile()
})
</script>

<template>
  <div class="mgmt-wrap">

    <!-- ── Skeleton ── -->
    <template v-if="loading">
      <aside class="mgmt-sidebar">
        <div class="sb-user">
          <div class="skel" style="width:44px;height:44px;border-radius:12px;flex-shrink:0"></div>
          <div style="flex:1;display:flex;flex-direction:column;gap:6px">
            <div class="skel" style="height:14px;width:120px"></div>
            <div class="skel" style="height:11px;width:80px"></div>
          </div>
        </div>
        <div class="sb-nav" style="display:flex;flex-direction:column;gap:4px">
          <div v-for="i in 7" :key="i" class="skel" :style="{ height:'36px', borderRadius:'9px', animationDelay: (i * 0.06) + 's' }"></div>
        </div>
      </aside>
      <main class="mgmt-main">
        <div class="skel" style="height:28px;width:200px;border-radius:8px;margin-bottom:8px"></div>
        <div class="skel" style="height:14px;width:320px;border-radius:6px;margin-bottom:28px"></div>
        <div class="skel" style="height:160px;border-radius:14px;margin-bottom:16px"></div>
        <div class="skel" style="height:120px;border-radius:14px"></div>
      </main>
    </template>

    <!-- ── Sidebar ── -->
    <aside v-if="!loading" class="mgmt-sidebar">
      <div class="sb-user">
        <div class="sb-avatar" :style="{ background: avatarGrad }">
          <img v-if="profile.image" :src="profile.image" class="sb-avatar-img" alt="avatar" />
          <span v-else>{{ (profile.name || '?')[0].toUpperCase() }}</span>
        </div>
        <div class="overflow-hidden">
          <div class="sb-name text-truncate">{{ profile.name }} {{ profile.surname }}</div>
          <div class="sb-handle text-truncate">@{{ profile.username }}</div>
        </div>
      </div>
      <nav class="sb-nav">
        <router-link
          v-for="p in panels" :key="p"
          class="nav-item"
          :class="{ active: activePanel === p }"
          :to="{ name: 'user-profile', params: { panel: p === 'overview' ? '' : p } }"
          :aria-current="activePanel === p ? 'page' : undefined"
          replace
        >
          <font-awesome-icon :icon="['fas', panelIcons[p]]" class="nav-ico" />
          <span>{{ $t('users.profile.nav.' + p) }}</span>
        </router-link>
        <div class="nav-div"></div>
        <router-link class="nav-item" :to="'/profile/' + profile.username">
          <font-awesome-icon :icon="['fas', 'arrow-up-right-from-square']" class="nav-ico" />
          <span>{{ $t('users.profile.nav.view_public') }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- ── Main ── -->
    <main v-if="!loading" class="mgmt-main">

      <!-- ─── OVERVIEW ─── -->
      <section v-show="activePanel === 'overview'">
        <div class="pnl-hd">
          <div>
            <h1>{{ $t('users.profile.nav.overview') }}</h1>
            <p>{{ $t('users.profile.overview.sub') }}</p>
          </div>
        </div>

        <!-- Completeness -->
        <div class="set-card mb-4">
          <h3><font-awesome-icon :icon="['fas', 'circle-check']" class="set-ico" />{{ $t('users.profile.overview.completeness') }}</h3>
          <p class="set-desc">{{ $t('users.profile.overview.completeness_desc') }}</p>
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="comp-bar-wrap" style="flex:1"><div class="comp-bar-fill" :style="{ width: completeness + '%' }"></div></div>
            <span style="font-size:.88rem;font-weight:800;color:var(--ehub-primary-text);flex-shrink:0">{{ completeness }}%</span>
          </div>
          <div class="comp-grid">
            <button type="button" class="comp-item" :class="profile.image ? 'done' : 'miss'" @click="switchPanel('appearance')">
              <font-awesome-icon :icon="['fas', profile.image ? 'check' : 'circle']" />
              <span>{{ $t('users.profile.appearance.avatar.title') }}</span>
            </button>
            <button type="button" class="comp-item" :class="profile.bio ? 'done' : 'miss'" @click="switchPanel('personal')">
              <font-awesome-icon :icon="['fas', profile.bio ? 'check' : 'circle']" />
              <span>{{ $t('users.profile.personal.form.bio.label') }}</span>
            </button>
            <button type="button" class="comp-item" :class="profile.location ? 'done' : 'miss'" @click="switchPanel('personal')">
              <font-awesome-icon :icon="['fas', profile.location ? 'check' : 'circle']" />
              <span>{{ $t('users.profile.personal.form.location.label') }}</span>
            </button>
            <button v-if="isRacing" type="button" class="comp-item" :class="profile.car_number ? 'done' : 'miss'" @click="switchPanel('personal')">
              <font-awesome-icon :icon="['fas', profile.car_number ? 'check' : 'circle']" />
              <span>{{ $t('users.profile.personal.form.car_number.label') }}</span>
            </button>
            <button v-if="isRacing" type="button" class="comp-item" :class="profile.driving_style ? 'done' : 'miss'" @click="switchPanel('personal')">
              <font-awesome-icon :icon="['fas', profile.driving_style ? 'check' : 'circle']" />
              <span>{{ $t('users.profile.personal.form.driving_style.label') }}</span>
            </button>
            <button type="button" class="comp-item" :class="profile.favorite_category ? 'done' : 'miss'" @click="switchPanel('personal')">
              <font-awesome-icon :icon="['fas', profile.favorite_category ? 'check' : 'circle']" />
              <span>{{ $t('users.profile.personal.form.favorite_category.label') }}</span>
            </button>
            <button type="button" class="comp-item" :class="profile.cover ? 'done' : 'miss'" @click="switchPanel('appearance')">
              <font-awesome-icon :icon="['fas', profile.cover ? 'check' : 'circle']" />
              <span>{{ $t('users.profile.appearance.cover.title') }}</span>
            </button>
            <button type="button" class="comp-item" :class="(profile.discord || profile.youtube || profile.twitch) ? 'done' : 'miss'" @click="switchPanel('social')">
              <font-awesome-icon :icon="['fas', (profile.discord || profile.youtube || profile.twitch) ? 'check' : 'circle']" />
              <span>{{ $t('users.profile.nav.social') }}</span>
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="stat-grid mb-4">
          <div class="stat-card">
            <div class="sc-ico" style="background:var(--ehub-primary-tint);color:var(--ehub-primary-text)"><font-awesome-icon :icon="['fas', 'trophy']" /></div>
            <div class="sc-val">{{ profile.stats.events }}</div>
            <div class="sc-lbl">{{ $t('users.profile.overview.stats.events') }}</div>
          </div>
          <div class="stat-card">
            <div class="sc-ico" style="background:rgba(234,179,8,.15);color:#ca8a04"><font-awesome-icon :icon="['fas', 'trophy']" /></div>
            <div class="sc-val">{{ profile.stats.wins }}</div>
            <div class="sc-lbl">{{ $t('users.profile.overview.stats.wins') }}</div>
          </div>
          <div class="stat-card">
            <div class="sc-ico" style="background:rgba(31,138,91,.13);color:var(--ehub-success-text)"><font-awesome-icon :icon="['fas', 'medal']" /></div>
            <div class="sc-val">{{ profile.stats.podiums ?? 0 }}</div>
            <div class="sc-lbl">{{ $t('users.profile.overview.stats.podiums') }}</div>
          </div>
        </div>
      </section>

      <!-- ─── PERSONAL ─── -->
      <section v-show="activePanel === 'personal'">
        <div class="pnl-hd">
          <div>
            <h1>{{ $t('users.profile.nav.personal') }}</h1>
            <p>{{ $t('users.profile.personal.sub') }}</p>
          </div>
        </div>

        <div class="set-card mb-4">
          <h3><font-awesome-icon :icon="['fas', 'id-card']" class="set-ico" />{{ $t('users.profile.personal.identity') }}</h3>
          <p class="set-desc">{{ $t('users.profile.personal.identityDesc') }}</p>
          <div class="form-grid-2 mb-3">
            <div>
              <label class="form-label" for="pf-name">{{ $t('users.profile.personal.form.first_name') }}</label>
              <input id="pf-name" v-model="fPersonal.name" type="text" class="form-control" maxlength="180" autocomplete="given-name" />
            </div>
            <div>
              <label class="form-label" for="pf-surname">{{ $t('users.profile.personal.form.surname') }}</label>
              <input id="pf-surname" v-model="fPersonal.surname" type="text" class="form-control" maxlength="180" autocomplete="family-name" />
            </div>
          </div>
          <div class="form-grid-2 mb-3">
            <div>
              <label class="form-label" for="pf-username">{{ $t('users.profile.personal.form.username.label') }}</label>
              <div class="input-group">
                <span class="input-group-text">@</span>
                <input id="pf-username" v-model="fPersonal.username" type="text" class="form-control" />
              </div>
            </div>
            <div>
              <label class="form-label" for="pf-number">{{ $t('users.profile.personal.form.car_number.label') }}</label>
              <div class="input-group">
                <span class="input-group-text">#</span>
                <input id="pf-number" v-model="fPersonal.car_number" type="text" class="form-control" maxlength="20" />
              </div>
            </div>
          </div>
          <div>
            <label class="form-label" for="pf-bio">{{ $t('users.profile.personal.form.bio.label') }}</label>
            <textarea id="pf-bio" v-model="fPersonal.bio" class="form-control" rows="3" maxlength="500" style="resize:vertical"></textarea>
            <div style="font-size:.74rem;color:var(--ehub-muted);margin-top:5px">
              {{ Math.max(0, 500 - (fPersonal.bio?.length ?? 0)) }} {{ $t('users.profile.personal.form.bio.chars_left') }}
            </div>
          </div>
        </div>

        <div class="set-card mb-4">
          <h3><font-awesome-icon :icon="['fas', 'location-dot']" class="set-ico" />{{ $t('users.profile.personal.details') }}</h3>
          <p class="set-desc">{{ $t('users.profile.personal.detailsDesc') }}</p>
          <div class="form-grid-2 mb-3">
            <div>
              <label class="form-label" for="pf-location">{{ $t('users.profile.personal.form.location.label') }}</label>
              <input id="pf-location" v-model="fPersonal.location" type="text" class="form-control" maxlength="180" />
            </div>
            <div>
              <label class="form-label" for="pf-birth">{{ $t('users.profile.personal.form.birthdate.label') }}</label>
              <input id="pf-birth" v-model="fPersonal.birthdate" type="date" class="form-control" />
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label" for="pf-phone">{{ $t('users.profile.personal.form.phone') }}</label>
            <input id="pf-phone" v-model="fPersonal.phone" type="tel" inputmode="tel" class="form-control" maxlength="20" autocomplete="tel" placeholder="(11) 99999-0000" />
            <p class="small text-muted mt-1 mb-0">{{ $t('users.profile.personal.form.phone_hint') }}</p>
          </div>
          <div class="form-grid-2 mb-3">
            <div>
              <label class="form-label" for="pf-style">{{ $t('users.profile.personal.form.driving_style.label') }}</label>
              <select id="pf-style" v-model="fPersonal.driving_style" class="form-select">
                <option value="">—</option>
                <option value="aggressive">{{ $t('users.profile.personal.driving_styles.aggressive') }}</option>
                <option value="smooth">{{ $t('users.profile.personal.driving_styles.smooth') }}</option>
                <option value="strategic">{{ $t('users.profile.personal.driving_styles.strategic') }}</option>
                <option value="technical">{{ $t('users.profile.personal.driving_styles.technical') }}</option>
                <option value="defensive">{{ $t('users.profile.personal.driving_styles.defensive') }}</option>
              </select>
            </div>
            <div>
              <label class="form-label" for="pf-fav">{{ $t('users.profile.personal.form.favorite_category.label') }}</label>
              <input id="pf-fav" v-model="fPersonal.favorite_category" type="text" class="form-control" maxlength="80" />
            </div>
          </div>
          <div>
            <label class="form-label" for="pf-motto">{{ $t('users.profile.personal.form.motto.label') }}</label>
            <input id="pf-motto" v-model="fPersonal.motto" type="text" class="form-control" maxlength="160" />
          </div>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-primary round px-4" :disabled="isSaving" @click="savePersonal">
            <font-awesome-icon :icon="['fas', 'floppy-disk']" class="me-2" />{{ $t('users.profile.personal.submit') }}
          </button>
        </div>
      </section>

      <!-- ─── APPEARANCE ─── -->
      <section v-show="activePanel === 'appearance'">
        <div class="pnl-hd">
          <div>
            <h1>{{ $t('users.profile.nav.appearance') }}</h1>
            <p>{{ $t('users.profile.appearance.sub') }}</p>
          </div>
        </div>

        <!-- Avatar -->
        <div class="set-card mb-4">
          <h3><font-awesome-icon :icon="['fas', 'circle-user']" class="set-ico" />{{ $t('users.profile.appearance.avatar.title') }}</h3>
          <p class="set-desc">{{ $t('users.profile.appearance.avatar.desc') }}</p>
          <div class="avatar-picker-wrap">
            <div class="avatar-preview" :style="{ background: avatarGrad }" @click="avatarFileRef?.click()">
              <img v-if="fAppearance.image" :src="fAppearance.image" class="avatar-preview-img" alt="avatar" />
              <span v-else>{{ (profile.name || '?')[0].toUpperCase() }}</span>
              <div class="av-overlay">
                <font-awesome-icon :icon="['fas', 'camera']" />
                <span>{{ $t('users.profile.appearance.avatar.change') }}</span>
              </div>
            </div>
            <div class="avatar-picker-info">
              <p>{{ $t('users.profile.appearance.avatar.hint') }}</p>
              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-primary round px-4" @click="avatarFileRef?.click()">
                  <font-awesome-icon :icon="['fas', 'upload']" class="me-2" />{{ $t('users.profile.appearance.avatar.upload') }}
                </button>
                <button class="btn btn-outline-secondary round px-4" @click="fAppearance.image = ''">
                  {{ $t('users.profile.appearance.avatar.remove') }}
                </button>
              </div>
            </div>
          </div>
          <input type="file" ref="avatarFileRef" accept="image/*" class="d-none" @change="onAvatarFile" />
        </div>

        <!-- Cover -->
        <div class="set-card mb-4">
          <h3><font-awesome-icon :icon="['fas', 'image']" class="set-ico" />{{ $t('users.profile.appearance.cover.title') }}</h3>
          <p class="set-desc">{{ $t('users.profile.appearance.cover.desc') }}</p>
          <div class="cover-preview" @click="coverFileRef?.click()">
            <img v-if="coverPreview || (!coverRemoved && profile.cover)"
              :src="coverPreview || profile.cover"
              class="cover-preview-img" alt="cover" />
            <div class="cover-preview-lbl">
              <font-awesome-icon :icon="['fas', 'camera']" />
              <span>{{ $t('users.profile.appearance.cover.change') }}</span>
            </div>
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn btn-primary round px-4" @click="coverFileRef?.click()">
              <font-awesome-icon :icon="['fas', 'upload']" class="me-2" />{{ $t('users.profile.appearance.cover.change') }}
            </button>
            <button v-if="coverPreview || (!coverRemoved && profile.cover)"
              class="btn btn-outline-secondary round px-4"
              @click="coverPreview = null; coverRemoved = true">
              {{ $t('users.profile.appearance.cover.remove') }}
            </button>
          </div>
          <input type="file" ref="coverFileRef" accept="image/*" class="d-none" @change="onCoverFile" />
        </div>

        <!-- Color -->
        <div class="set-card mb-4">
          <h3><font-awesome-icon :icon="['fas', 'palette']" class="set-ico" />{{ $t('users.profile.appearance.color.title') }}</h3>
          <p class="set-desc">{{ $t('users.profile.appearance.color.tip') }}</p>
          <div class="d-flex align-items-center gap-3 flex-wrap">
            <div class="avatar-preview sm" :style="{ background: avatarGrad }">
              <img v-if="fAppearance.image" :src="fAppearance.image" class="avatar-preview-img" alt="" />
              <span v-else>{{ (profile.name || '?')[0].toUpperCase() }}</span>
            </div>
            <div>
              <div class="swatch-grid">
                <div
                  v-for="(g, i) in GRAD_SWATCHES" :key="i"
                  class="grad-sw"
                  :class="{ sel: selectedGrad === i }"
                  :style="{ background: gradStyle(i) }"
                  @click="selectGrad(i)"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-primary round px-4" :disabled="isSaving" @click="saveAppearance">
            <font-awesome-icon :icon="['fas', 'floppy-disk']" class="me-2" />{{ $t('users.profile.appearance.submit') }}
          </button>
        </div>
      </section>

      <!-- ─── SOCIAL ─── -->
      <section v-show="activePanel === 'social'">
        <div class="pnl-hd">
          <div>
            <h1>{{ $t('users.profile.nav.social') }}</h1>
            <p>{{ $t('users.profile.social.sub') }}</p>
          </div>
        </div>

        <div class="set-card mb-4">
          <h3><font-awesome-icon :icon="['fas', 'earth-americas']" class="set-ico" />{{ $t('users.profile.social.networks') }}</h3>
          <p class="set-desc">{{ $t('users.profile.social.networksDesc') }}</p>
          <div class="social-row">
            <div class="soc-ico" style="background:rgba(88,101,242,.12);color:#5865F2;border-color:rgba(88,101,242,.22)"><font-awesome-icon :icon="['fab', 'discord']" /></div>
            <label>Discord</label>
            <input v-model="fSocial.discord" type="text" class="form-control" placeholder="user#0000" />
          </div>
          <div class="social-row">
            <div class="soc-ico" style="background:rgba(255,0,0,.09);color:#FF0000;border-color:rgba(255,0,0,.2)"><font-awesome-icon :icon="['fab', 'youtube']" /></div>
            <label>YouTube</label>
            <input v-model="fSocial.youtube" type="text" class="form-control" placeholder="youtube.com/c/..." />
          </div>
          <div class="social-row">
            <div class="soc-ico" style="background:rgba(145,70,255,.12);color:#9146FF;border-color:rgba(145,70,255,.22)"><font-awesome-icon :icon="['fab', 'twitch']" /></div>
            <label>Twitch</label>
            <input v-model="fSocial.twitch" type="text" class="form-control" placeholder="twitch.tv/..." />
          </div>
          <div class="social-row">
            <div class="soc-ico"><font-awesome-icon :icon="['fab', 'x-twitter']" /></div>
            <label>X / Twitter</label>
            <input v-model="fSocial.x_twitter" type="text" class="form-control" placeholder="@usuario" />
          </div>
          <div class="social-row">
            <div class="soc-ico" style="background:rgba(10,102,194,.1);color:#0A66C2;border-color:rgba(10,102,194,.22)"><font-awesome-icon :icon="['fab', 'linkedin']" /></div>
            <label>LinkedIn</label>
            <input v-model="fSocial.linkedin" type="text" class="form-control" placeholder="linkedin.com/in/..." />
          </div>
          <div class="social-row">
            <div class="soc-ico"><font-awesome-icon :icon="['fas', 'link']" /></div>
            <label>{{ $t('users.profile.social.form.website.label') }}</label>
            <input v-model="fSocial.website" type="url" class="form-control" placeholder="https://..." />
          </div>
        </div>

        <button class="btn btn-primary round px-4" :disabled="isSaving" @click="saveSocial">
          <font-awesome-icon :icon="['fas', 'floppy-disk']" class="me-2" />{{ $t('users.profile.social.submit') }}
        </button>
      </section>

      <!-- ─── PRIVACY ─── -->
      <section v-show="activePanel === 'privacy'">
        <div class="pnl-hd">
          <div>
            <h1>{{ $t('users.profile.nav.privacy') }}</h1>
            <p>{{ $t('users.profile.privacy.sub') }}</p>
          </div>
        </div>

        <div class="set-card mb-4">
          <h3><font-awesome-icon :icon="['fas', 'eye']" class="set-ico" />{{ $t('users.profile.privacy.visibility.label') }}</h3>
          <p class="set-desc">{{ $t('users.profile.privacy.visibility.desc') }}</p>
          <div class="vis-seg">
            <input type="radio" name="vis" id="vis-pub" :value="'public'" v-model="fPrivacy.profile_visibility" />
            <label for="vis-pub"><font-awesome-icon :icon="['fas', 'globe']" /><span>{{ $t('users.profile.privacy.visibility.public') }}</span></label>
            <input type="radio" name="vis" id="vis-fol" :value="'followers'" v-model="fPrivacy.profile_visibility" />
            <label for="vis-fol"><font-awesome-icon :icon="['fas', 'users']" /><span>{{ $t('users.profile.privacy.visibility.followers') }}</span></label>
            <input type="radio" name="vis" id="vis-prv" :value="'private'" v-model="fPrivacy.profile_visibility" />
            <label for="vis-prv"><font-awesome-icon :icon="['fas', 'lock']" /><span>{{ $t('users.profile.privacy.visibility.private') }}</span></label>
          </div>
        </div>

        <div class="set-card mb-4">
          <h3><font-awesome-icon :icon="['fab', 'google']" class="set-ico" />{{ $t('users.profile.privacy.search_title') }}</h3>
          <div class="toggle-row">
            <div class="toggle-info">
              <label class="ti-label" for="pv-index">{{ $t('users.profile.privacy.search_label') }}</label>
              <div class="ti-desc">{{ $t(fPrivacy.profile_visibility === 'public' ? 'users.profile.privacy.search_desc' : 'users.profile.privacy.search_needs_public') }}</div>
            </div>
            <div class="form-check form-switch mb-0">
              <input id="pv-index" v-model="fPrivacy.profile_indexable" class="form-check-input" type="checkbox" role="switch" :disabled="fPrivacy.profile_visibility !== 'public'" />
            </div>
          </div>
        </div>

        <div class="set-card mb-4">
          <h3><font-awesome-icon :icon="['fas', 'shield-halved']" class="set-ico" />{{ $t('users.profile.privacy.contact_title') }}</h3>
          <p class="set-desc mb-0">{{ $t('users.profile.privacy.contact_desc') }}</p>
        </div>

        <div class="d-flex gap-2 mb-4">
          <button class="btn btn-primary round px-4" :disabled="isSaving" @click="savePrivacy">
            <font-awesome-icon :icon="['fas', 'floppy-disk']" class="me-2" />{{ $t('users.profile.privacy.submit') }}
          </button>
        </div>

        <div class="set-card">
          <h3><font-awesome-icon :icon="['fas', 'key']" class="set-ico" />{{ $t('users.profile.privacy.password.title') }}</h3>
          <p class="set-desc">{{ $t('users.profile.privacy.password.tip') }}</p>
          <div class="mb-3">
            <label class="form-label">{{ $t('users.profile.privacy.password.form.current.label') }}</label>
            <input v-model="pwd.current_password" type="password" class="form-control" placeholder="••••••••" />
          </div>
          <div class="form-grid-2 mb-3">
            <div>
              <label class="form-label">{{ $t('users.profile.privacy.password.form.new.label') }}</label>
              <input v-model="pwd.password" type="password" class="form-control" placeholder="••••••••" />
            </div>
            <div>
              <label class="form-label">{{ $t('users.profile.privacy.password.form.confirm.label') }}</label>
              <input v-model="pwd.password_confirmation" type="password" class="form-control" placeholder="••••••••" />
            </div>
          </div>
          <button class="btn btn-primary round px-4" :disabled="isSaving" @click="savePassword">
            <font-awesome-icon :icon="['fas', 'key']" class="me-2" />{{ $t('users.profile.privacy.password.submit') }}
          </button>
        </div>
      </section>

      <!-- ─── NOTIFICATIONS ─── -->
      <section v-show="activePanel === 'notifications'">
        <div class="pnl-hd">
          <div>
            <h1>{{ $t('users.profile.nav.notifications') }}</h1>
            <p>{{ $t('users.profile.notifications.sub') }}</p>
          </div>
        </div>

        <div class="set-card mb-4">
          <div class="nt-head">
            <span></span>
            <span class="nt-col"><font-awesome-icon :icon="['fas', 'bell']" /> {{ $t('users.profile.notifications.ch_app') }}</span>
            <span class="nt-col"><font-awesome-icon :icon="['fas', 'envelope']" /> {{ $t('users.profile.notifications.ch_email') }}</span>
          </div>
          <div v-for="key in NOTIF_TYPES" :key="'nt-' + key" class="nt-row">
            <div class="toggle-info">
              <div class="ti-label">
                {{ $t('users.profile.notifications.types.' + key + '.label') }}
                <font-awesome-icon v-if="NOTIF_LOCKED.includes(key)" :icon="['fas', 'lock']" class="ms-1 text-muted" :title="$t('users.profile.notifications.locked')" />
              </div>
              <div class="ti-desc">{{ $t('users.profile.notifications.types.' + key + '.desc') }}</div>
            </div>
            <div v-for="ch in ['app', 'email']" :key="ch" class="nt-col">
              <div class="form-check form-switch mb-0">
                <input :id="'nt-' + key + '-' + ch" v-model="fChannels[key][ch]" class="form-check-input" type="checkbox" :disabled="NOTIF_LOCKED.includes(key)"
                  :aria-label="$t('users.profile.notifications.types.' + key + '.label') + ' — ' + $t('users.profile.notifications.ch_' + ch)"
                  style="width:2.6em;height:1.4em;cursor:pointer" />
              </div>
            </div>
          </div>
          <p class="set-desc mt-3 mb-0"><font-awesome-icon :icon="['fas', 'circle-info']" class="me-1" />{{ $t('users.profile.notifications.email_to', { mail: profile.mail || '' }) }}</p>
        </div>

        <button class="btn btn-primary round px-4" :disabled="isSaving" @click="saveNotifications">
          <font-awesome-icon :icon="['fas', 'floppy-disk']" class="me-2" />{{ $t('users.profile.notifications.submit') }}
        </button>
      </section>

      <!-- ─── ACCOUNT ─── -->
      <section v-show="activePanel === 'account'">
        <div class="pnl-hd">
          <div>
            <h1>{{ $t('users.profile.nav.account') }}</h1>
            <p>{{ $t('users.profile.account.sub') }}</p>
          </div>
        </div>

        <div class="set-card mb-4">
          <h3><font-awesome-icon :icon="['fas', 'envelope']" class="set-ico" />{{ $t('users.profile.account.mail') }}</h3>
          <p class="set-desc">{{ $t('users.profile.account.mail_desc') }}</p>
          <div class="form-grid-2">
            <div>
              <label class="form-label">{{ $t('users.profile.account.current_mail') }}</label>
              <div class="input-group">
                <input type="email" class="form-control" :value="profile.mail" disabled />
                <span v-if="profile.email_verified_at" class="input-group-text" style="color:var(--ehub-success-text)">
                  <font-awesome-icon :icon="['fas', 'circle-check']" />
                </span>
              </div>
            </div>
            <div>
              <label class="form-label">{{ $t('users.profile.account.since') }}</label>
              <input type="text" class="form-control" :value="profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'" disabled />
            </div>
          </div>

          <p v-if="profile.auth_provider" class="set-desc mt-3 mb-0">{{ $t('users.profile.account.change_mail.google') }}</p>
          <template v-else>
            <button v-if="mailChange.step === 'idle'" type="button" class="btn btn-outline-secondary round px-4 mt-3" @click="mailChange.step = 'form'">
              <font-awesome-icon :icon="['fas', 'pen']" class="me-2" />{{ $t('users.profile.account.change_mail.open') }}
            </button>
            <form v-else-if="mailChange.step === 'form'" class="mail-change mt-3" @submit.prevent="sendMailCode">
              <div class="form-grid-2">
                <div>
                  <label class="form-label" for="mc-mail">{{ $t('users.profile.account.change_mail.new') }}</label>
                  <input id="mc-mail" v-model="mailChange.mail" type="email" class="form-control" autocomplete="email" required />
                </div>
                <div>
                  <label class="form-label" for="mc-pass">{{ $t('users.profile.account.change_mail.password') }}</label>
                  <input id="mc-pass" v-model="mailChange.password" type="password" class="form-control" autocomplete="current-password" required />
                </div>
              </div>
              <p class="set-desc mt-2 mb-2">{{ $t('users.profile.account.change_mail.hint') }}</p>
              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary round px-4" :disabled="mailChange.busy">
                  <font-awesome-icon :icon="['fas', mailChange.busy ? 'spinner' : 'paper-plane']" :spin="mailChange.busy" class="me-2" />{{ $t('users.profile.account.change_mail.send') }}
                </button>
                <button type="button" class="btn btn-ghost round" @click="resetMailChange">{{ $t('users.profile.account.danger.cancel') }}</button>
              </div>
            </form>
            <form v-else class="mail-change mt-3" @submit.prevent="confirmMailCode">
              <label class="form-label" for="mc-code">{{ $t('users.profile.account.change_mail.code', { mail: mailChange.mail }) }}</label>
              <input id="mc-code" v-model="mailChange.code" type="text" inputmode="numeric" maxlength="6" class="form-control mc-code" autocomplete="one-time-code" required />
              <div class="d-flex gap-2 mt-2">
                <button type="submit" class="btn btn-primary round px-4" :disabled="mailChange.busy || mailChange.code.trim().length !== 6">
                  {{ $t('users.profile.account.change_mail.confirm') }}
                </button>
                <button type="button" class="btn btn-ghost round" @click="resetMailChange">{{ $t('users.profile.account.danger.cancel') }}</button>
              </div>
            </form>
          </template>
        </div>

        <div class="set-card mb-4">
          <h3><font-awesome-icon :icon="['fas', 'download']" class="set-ico" />{{ $t('users.profile.account.export') }}</h3>
          <p class="set-desc">{{ $t('users.profile.account.export_desc') }}</p>
          <button class="btn btn-outline-secondary round px-4" :disabled="exporting" @click="exportData">
            <font-awesome-icon :icon="['fas', exporting ? 'spinner' : 'download']" :spin="exporting" class="me-2" />{{ $t('users.profile.account.export_btn') }}
          </button>
        </div>

        <div class="set-card mb-4">
          <h3><font-awesome-icon :icon="['fas', 'link']" class="set-ico" />{{ $t('users.profile.account.oauth.title') }}</h3>
          <p class="set-desc">{{ $t('users.profile.account.oauth.desc') }}</p>
          <div class="toggle-row">
            <div class="toggle-info d-flex align-items-center gap-3">
              <div class="oauth-logo">
                <svg viewBox="0 0 24 24" width="18" height="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              </div>
              <div>
                <div class="ti-label">Google</div>
                <div class="ti-desc">{{ profile.auth_provider === 'google' ? $t('users.profile.account.oauth.main') : (profile.google_linked ? $t('users.profile.account.oauth.connected_desc') : $t('users.profile.account.oauth.not_connected_desc')) }}</div>
              </div>
            </div>
            <span v-if="profile.auth_provider === 'google'" class="role-chip admin">{{ $t('users.profile.account.oauth.connected') }}</span>
            <button v-else-if="profile.google_linked" type="button" class="btn btn-outline-secondary btn-sm round" :disabled="unlinking" @click="unlinkGoogle">
              {{ $t('users.profile.account.oauth.unlink') }}
            </button>
            <button v-else type="button" class="btn btn-outline-primary btn-sm round" @click="linkGoogle">
              {{ $t('users.profile.account.oauth.link') }}
            </button>
          </div>
        </div>

        <div class="set-card danger">
          <h3><font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="set-ico" />{{ $t('users.profile.account.danger.title') }}</h3>
          <p class="set-desc">{{ $t('users.profile.account.danger.description') }}</p>
          <div v-if="!deleteConfirm" class="d-flex gap-2 flex-wrap">
            <button class="btn btn-outline-secondary round px-4" @click="deleteConfirm = true">
              <font-awesome-icon :icon="['fas', 'user-slash']" class="me-2" />{{ $t('users.profile.account.danger.submit') }}
            </button>
          </div>
          <div v-else>
            <div class="alert alert-warning py-2 small mb-3">
              <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="me-2" />
              {{ $t('users.profile.account.danger.confirm') }}
            </div>
            <div v-if="deleteBlockers" class="alert alert-danger py-2 small mb-3" role="alert">
              <div>{{ $t('users.profile.account.danger.blocked') }}</div>
              <ul class="mb-0 mt-1">
                <li v-for="o in deleteBlockers.organizations" :key="'o' + o">{{ $t('users.profile.account.danger.blocked_org', { name: o }) }}</li>
                <li v-for="tm in deleteBlockers.teams" :key="'t' + tm">{{ $t('users.profile.account.danger.blocked_team', { name: tm }) }}</li>
              </ul>
            </div>
            <div class="mb-3">
              <template v-if="profile.auth_provider">
                <label class="form-label" for="del-confirm">{{ $t('users.profile.account.danger.confirm_username', { username: profile.username }) }}</label>
                <input id="del-confirm" v-model="deletePassword" type="text" class="form-control" autocomplete="off" :placeholder="profile.username" />
              </template>
              <template v-else>
                <label class="form-label" for="del-pass">{{ $t('users.profile.privacy.password.form.current.label') }}</label>
                <input id="del-pass" v-model="deletePassword" type="password" class="form-control" :placeholder="$t('users.profile.account.danger.placeholder')" />
              </template>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-secondary round" @click="deleteConfirm = false; deletePassword = ''">
                {{ $t('users.profile.account.danger.cancel') }}
              </button>
              <button class="btn btn-danger round" :disabled="isSaving" @click="deleteAccount">
                <font-awesome-icon :icon="['fas', 'trash']" class="me-2" />{{ $t('users.profile.account.danger.submit') }}
              </button>
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
/* ── Layout ── */
.mgmt-wrap { display: flex; min-height: calc(100vh - 60px); }

/* ── Sidebar ── */
.mgmt-sidebar {
  width: 240px; flex-shrink: 0;
  background: var(--ehub-card); border-right: 1px solid var(--ehub-line);
  position: sticky; top: 60px; height: calc(100vh - 60px);
  overflow-y: auto; display: flex; flex-direction: column;
}
.sb-user {
  padding: 18px 14px; border-bottom: 1px solid var(--ehub-line);
  display: flex; align-items: center; gap: 11px;
}
.sb-avatar {
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: .9rem; font-weight: 800; color: #fff; overflow: hidden; position: relative;
}
.sb-avatar-img { width: 100%; height: 100%; object-fit: cover; }
.sb-name { font-size: .85rem; font-weight: 700; color: var(--ehub-ink); line-height: 1.2; }
.sb-handle { font-size: .72rem; color: var(--ehub-muted); margin-top: 1px; }
.sb-nav { padding: 9px 7px; flex: 1; }
.nav-item {
  display: flex; align-items: center; gap: 9px; padding: 8px 11px; border-radius: 9px;
  cursor: pointer; color: var(--ehub-muted); font-size: .875rem; font-weight: 600;
  transition: all .15s; text-decoration: none; border: 0; background: transparent;
  width: 100%; text-align: left; margin-bottom: 2px;
}
.nav-ico { width: 15px; text-align: center; font-size: .8rem; flex-shrink: 0; }
.nav-item:hover { background: var(--ehub-field-bg); color: var(--ehub-ink); text-decoration: none; }
.nav-item.active { background: var(--ehub-primary-tint); color: var(--ehub-primary-text); }
.nav-div { height: 1px; background: var(--ehub-line); margin: 6px 3px; }

/* ── Main ── */
.mgmt-main { flex: 1; padding: 28px 32px; min-width: 0; max-width: 780px; }

/* ── Panel header ── */
.pnl-hd { margin-bottom: 24px; }
.pnl-hd h1 { font-size: 1.3rem; font-weight: 800; color: var(--ehub-ink); margin: 0 0 2px; letter-spacing: -.02em; }
.pnl-hd p { color: var(--ehub-muted); font-size: .84rem; margin: 0; }

/* ── Set card ── */
.set-card {
  background: var(--ehub-card); border: 1px solid var(--ehub-line);
  border-radius: var(--ehub-radius-card); padding: 22px 24px;
}
.set-card h3 {
  font-size: .97rem; font-weight: 700; color: var(--ehub-ink);
  margin: 0 0 3px; display: flex; align-items: center; gap: 8px;
}
.set-ico { color: var(--ehub-primary-text); font-size: .88rem; }
.set-desc { font-size: .83rem; color: var(--ehub-muted); margin: 0 0 18px; line-height: 1.5; }
.set-card.danger { border-color: color-mix(in srgb, #e23b3b 30%, var(--ehub-line)); }
.set-card.danger h3 { color: var(--ehub-danger-text); }
.set-card.danger .set-ico { color: var(--ehub-danger-text); }

/* ── Form grids ── */
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media (max-width: 600px) { .form-grid-2 { grid-template-columns: 1fr; } }

/* ── Completeness ── */
.comp-bar-wrap { background: var(--ehub-field-bg); border-radius: 50rem; height: 8px; overflow: hidden; }
.comp-bar-fill { height: 100%; border-radius: 50rem; background: linear-gradient(90deg, var(--ehub-primary), #00d4ff); transition: width .5s ease; }
.comp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 16px; }
.comp-item { display: flex; align-items: center; gap: 8px; font-size: .82rem; padding: 5px 0; }
.comp-item.done { color: var(--ehub-success-text); }
.comp-item.miss { color: var(--ehub-muted); }

/* ── Stats ── */
.stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.stat-card { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 13px; padding: 16px 18px; }
.sc-ico { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: .8rem; margin-bottom: 10px; }
.sc-val { font-size: 1.65rem; font-weight: 800; color: var(--ehub-ink); letter-spacing: -.03em; line-height: 1; }
.sc-lbl { font-size: .72rem; color: var(--ehub-muted); margin-top: 3px; text-transform: uppercase; letter-spacing: .04em; font-weight: 600; }

/* ── Avatar picker ── */
.avatar-picker-wrap { display: flex; align-items: flex-start; gap: 20px; flex-wrap: wrap; }
.avatar-preview {
  width: 90px; height: 90px; border-radius: 22px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.9rem; font-weight: 800; color: #fff;
  box-shadow: 0 4px 14px rgba(0,0,0,.18);
  position: relative; cursor: pointer; overflow: hidden;
}
.avatar-preview.sm { width: 54px; height: 54px; border-radius: 14px; font-size: 1.1rem; cursor: default; }
.avatar-preview-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.avatar-preview:hover .av-overlay { opacity: 1; }
.avatar-preview.sm .av-overlay { display: none; }
.av-overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,.5);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: #fff; font-size: .72rem; font-weight: 600; gap: 4px;
  opacity: 0; transition: opacity .15s; z-index: 1;
}
.av-overlay svg { font-size: 1.1rem; }
.avatar-picker-info { flex: 1; }
.avatar-picker-info p { font-size: .84rem; color: var(--ehub-muted); margin: 0 0 12px; line-height: 1.5; }

/* ── Cover preview ── */
.cover-preview {
  height: 90px; border-radius: 14px; position: relative; overflow: hidden;
  background: linear-gradient(135deg, #004f72, #0098D8, #00c6ff);
  margin-bottom: 14px; cursor: pointer;
}
.cover-preview::after {
  content: ''; position: absolute; inset: 0;
  background-image: repeating-linear-gradient(118deg, transparent 0 28px, rgba(255,255,255,.06) 28px 30px);
}
.cover-preview-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
.cover-preview-lbl {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,.9); font-size: .82rem; font-weight: 600; gap: 7px;
  background: rgba(0,0,0,.28); z-index: 1;
}

/* ── Gradient swatches ── */
.swatch-grid { display: flex; gap: 8px; flex-wrap: wrap; }
.grad-sw {
  width: 38px; height: 38px; border-radius: 10px; cursor: pointer;
  border: 2px solid transparent; transition: transform .12s, box-shadow .12s;
}
.grad-sw:hover { transform: scale(1.08); }
.grad-sw.sel { border-color: var(--ehub-ink); box-shadow: 0 0 0 2px var(--ehub-card), 0 0 0 4px var(--ehub-ink); transform: scale(1.05); }

/* ── Social rows ── */
.social-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.social-row:last-child { margin-bottom: 0; }
.soc-ico {
  width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--ehub-field-bg); border: 1px solid var(--ehub-line);
  color: var(--ehub-muted); font-size: .85rem;
}
.social-row label { font-size: .8rem; font-weight: 600; color: var(--ehub-muted); width: 80px; flex-shrink: 0; margin: 0; }

/* ── Visibility seg ── */
.vis-seg { display: flex; gap: 0; border: 1px solid var(--ehub-line); border-radius: 10px; overflow: hidden; margin-bottom: 0; }
.vis-seg label {
  flex: 1; text-align: center; padding: 9px 6px; cursor: pointer;
  font-size: .82rem; font-weight: 600; color: var(--ehub-muted);
  border-right: 1px solid var(--ehub-line); transition: all .15s;
  display: flex; flex-direction: column; align-items: center; gap: 4px; margin: 0;
}
.vis-seg label:last-child { border-right: 0; }
.vis-seg label svg { font-size: 1rem; }
.vis-seg input[type="radio"] { display: none; }
.vis-seg input[type="radio"]:checked + label { background: var(--ehub-primary-tint); color: var(--ehub-primary-text); }

/* ── Toggle rows ── */
.toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px 0; border-bottom: 1px solid var(--ehub-line); gap: 16px;
}
.toggle-row:last-child { border-bottom: 0; padding-bottom: 0; }
.toggle-row:first-child { padding-top: 0; }
.toggle-info .ti-label { font-size: .9rem; font-weight: 600; color: var(--ehub-ink); }
.toggle-info .ti-desc  { font-size: .78rem; color: var(--ehub-muted); margin-top: 2px; }
.form-check-input:checked { background-color: var(--ehub-primary-strong); border-color: var(--ehub-primary); }

/* ── OAuth logo ── */
.oauth-logo {
  width: 32px; height: 32px; border-radius: 8px; background: var(--ehub-card);
  border: 1px solid var(--ehub-line); display: flex; align-items: center; justify-content: center;
}

/* ── Role chip ── */
.role-chip { font-size: .72rem; font-weight: 700; padding: 3px 9px; border-radius: 50rem; }
.role-chip.admin { background: var(--ehub-primary-tint); color: var(--ehub-primary-text); }
.role-chip.member { background: var(--ehub-field-bg); color: var(--ehub-muted); }

/* ── Responsive ── */
@media (max-width: 768px) {
  .mgmt-wrap { flex-direction: column; }
  .mgmt-sidebar { width: 100%; height: auto; position: relative; top: 0; border-right: 0; border-bottom: 1px solid var(--ehub-line); }
  .sb-nav { display: flex; flex-direction: row; overflow-x: auto; padding: 6px; gap: 3px; }
  .nav-item { white-space: nowrap; flex-shrink: 0; margin-bottom: 0; }
  .nav-div { display: none; }
  .mgmt-main { padding: 18px 16px; max-width: none; }
  .stat-grid { grid-template-columns: 1fr 1fr; }
  .comp-grid { grid-template-columns: 1fr; }
}
.nt-head, .nt-row { display: grid; grid-template-columns: minmax(0, 1fr) 90px 90px; align-items: center; gap: 8px; }
.nt-head { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--ehub-muted); padding-bottom: 8px; border-bottom: 1px solid var(--ehub-line); }
.nt-row { padding: 12px 0; border-bottom: 1px solid var(--ehub-line); }
.nt-row:last-of-type { border-bottom: 0; }
.nt-col { display: flex; justify-content: center; align-items: center; gap: 5px; text-align: center; }
@media (max-width: 560px) { .nt-head, .nt-row { grid-template-columns: minmax(0, 1fr) 64px 64px; } }
button.comp-item { border: 0; background: none; text-align: left; padding: 0; cursor: pointer; font: inherit; color: inherit; }
button.comp-item.miss:hover span { text-decoration: underline; }
.mail-change { border-top: 1px solid var(--ehub-line); padding-top: 1rem; }
.mc-code { max-width: 180px; letter-spacing: .3em; font-weight: 700; font-size: 1.1rem; }
</style>
