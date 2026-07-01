<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AvatarUpload from '@/components/inputs/AvatarUpload.vue'
import Api          from '@/helpers/communication/Connection'
import store        from '@/store'
import { toast }   from '@/helpers/toast.js'

const { t } = useI18n()
const router = useRouter()
const route  = useRoute()

const activePanel = ref('overview')
const panels = ['overview', 'personal', 'appearance', 'social', 'privacy', 'notifications', 'account']

function switchPanel(panel) {
  activePanel.value = panel
  router.replace({ query: { ...route.query, panel } })
}

watch(() => route.query.panel, (p) => {
  if (p && panels.includes(p)) activePanel.value = p
})

const loading = ref(true)
const isSaving = ref(false)

const profile = reactive({
  name: '', surname: '', username: '', mail: '', phone: '',
  bio: '', location: '', birthdate: '', car_number: '', driving_style: '',
  favorite_category: '', motto: '',
  discord: '', youtube: '', twitch: '', x_twitter: '', linkedin: '', website: '',
  profile_color: '#0098D8', profile_visibility: 'public', notification_prefs: null,
  auth_provider: null,
  image: null, cover: null,
  email_verified_at: null, created_at: null,
  stats: { events: 0, wins: 0, followers: 0 },
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
  profile_visibility: 'public',
  show_email: false, show_phone: false, show_birthdate: false, show_followers: true,
})

const fNotifications = reactive({
  championship: { event_start: true, stage_update: true, results: true },
  social:       { new_follower: true, org_invitation: true },
  email:        { event_start: false, results: false },
})

const pwd = reactive({ current_password: '', password: '', password_confirmation: '' })
const deletePassword = ref('')
const deleteConfirm  = ref(false)

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

const completeness = computed(() => {
  const checks = [
    !!profile.bio, !!profile.location, !!profile.birthdate, !!profile.car_number,
    !!profile.driving_style, !!profile.favorite_category, !!profile.motto,
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
    stats: d.stats ?? { events: 0, wins: 0, followers: 0 },
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
  fPrivacy.show_email     = prefs.privacy?.show_email     ?? false
  fPrivacy.show_phone     = prefs.privacy?.show_phone     ?? false
  fPrivacy.show_birthdate = prefs.privacy?.show_birthdate ?? false
  fPrivacy.show_followers = prefs.privacy?.show_followers ?? true
  Object.assign(fNotifications.championship, prefs.championship ?? {})
  Object.assign(fNotifications.social,       prefs.social       ?? {})
  Object.assign(fNotifications.email,        prefs.email        ?? {})
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
    const result = await Api.patchAsync('/user/profile', { profile_visibility: fPrivacy.profile_visibility, notification_prefs: prefs })
    if (result.code === 200) { toast.success(t('users.profile.privacy.success')); await fetchProfile() }
    else toast.error(parseErrors(result.response).join('\n'))
  } catch { toast.error(t('users.profile.error.generic')) }
  finally { isSaving.value = false }
}

async function saveNotifications() {
  isSaving.value = true
  const prefs = {
    ...(profile.notification_prefs ?? defaultPrefs()),
    championship: { ...fNotifications.championship },
    social:       { ...fNotifications.social },
    email:        { ...fNotifications.email },
  }
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
    const result = await Api.deleteAsync('/user', { password: deletePassword.value })
    if (result.code === 200) { store.dispatch('removeToken'); router.push({ name: 'events' }) }
    else if (result.code === 403) toast.error(t('users.profile.privacy.password.error.wrong'))
    else toast.error(t('users.profile.error.generic'))
  } catch { toast.error(t('users.profile.error.generic')) }
  finally { isSaving.value = false }
}

const panelIcons = {
  overview: 'chart-line', personal: 'circle-user', appearance: 'palette',
  social: 'earth-americas', privacy: 'shield-halved', notifications: 'bell', account: 'gear',
}

onMounted(() => {
  const p = route.query.panel
  if (p && panels.includes(p)) activePanel.value = p
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
        <button
          v-for="p in panels" :key="p"
          class="nav-item"
          :class="{ active: activePanel === p }"
          @click="switchPanel(p)"
        >
          <font-awesome-icon :icon="['fas', panelIcons[p]]" class="nav-ico" />
          <span>{{ $t('users.profile.nav.' + p) }}</span>
        </button>
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
            <span style="font-size:.88rem;font-weight:800;color:var(--ehub-primary);flex-shrink:0">{{ completeness }}%</span>
          </div>
          <div class="comp-grid">
            <div class="comp-item" :class="profile.image ? 'done' : 'miss'">
              <font-awesome-icon :icon="['fas', profile.image ? 'check' : 'circle']" />
              <span>{{ $t('users.profile.appearance.avatar.title') }}</span>
            </div>
            <div class="comp-item" :class="profile.bio ? 'done' : 'miss'">
              <font-awesome-icon :icon="['fas', profile.bio ? 'check' : 'circle']" />
              <span>{{ $t('users.profile.personal.form.bio.label') }}</span>
            </div>
            <div class="comp-item" :class="profile.location ? 'done' : 'miss'">
              <font-awesome-icon :icon="['fas', profile.location ? 'check' : 'circle']" />
              <span>{{ $t('users.profile.personal.form.location.label') }}</span>
            </div>
            <div class="comp-item" :class="profile.car_number ? 'done' : 'miss'">
              <font-awesome-icon :icon="['fas', profile.car_number ? 'check' : 'circle']" />
              <span>{{ $t('users.profile.personal.form.car_number.label') }}</span>
            </div>
            <div class="comp-item" :class="profile.driving_style ? 'done' : 'miss'">
              <font-awesome-icon :icon="['fas', profile.driving_style ? 'check' : 'circle']" />
              <span>{{ $t('users.profile.personal.form.driving_style.label') }}</span>
            </div>
            <div class="comp-item" :class="profile.favorite_category ? 'done' : 'miss'">
              <font-awesome-icon :icon="['fas', profile.favorite_category ? 'check' : 'circle']" />
              <span>{{ $t('users.profile.personal.form.favorite_category.label') }}</span>
            </div>
            <div class="comp-item" :class="profile.cover ? 'done' : 'miss'">
              <font-awesome-icon :icon="['fas', profile.cover ? 'check' : 'circle']" />
              <span>{{ $t('users.profile.appearance.cover.title') }}</span>
            </div>
            <div class="comp-item" :class="(profile.discord || profile.youtube || profile.twitch) ? 'done' : 'miss'">
              <font-awesome-icon :icon="['fas', (profile.discord || profile.youtube || profile.twitch) ? 'check' : 'circle']" />
              <span>{{ $t('users.profile.nav.social') }}</span>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="stat-grid mb-4">
          <div class="stat-card">
            <div class="sc-ico" style="background:var(--ehub-primary-tint);color:var(--ehub-primary)"><font-awesome-icon :icon="['fas', 'flag-checkered']" /></div>
            <div class="sc-val">{{ profile.stats.events }}</div>
            <div class="sc-lbl">{{ $t('users.profile.overview.stats.events') }}</div>
          </div>
          <div class="stat-card">
            <div class="sc-ico" style="background:rgba(234,179,8,.15);color:#ca8a04"><font-awesome-icon :icon="['fas', 'trophy']" /></div>
            <div class="sc-val">{{ profile.stats.wins }}</div>
            <div class="sc-lbl">{{ $t('users.profile.overview.stats.wins') }}</div>
          </div>
          <div class="stat-card">
            <div class="sc-ico" style="background:rgba(31,138,91,.13);color:#1f8a5b"><font-awesome-icon :icon="['fas', 'users']" /></div>
            <div class="sc-val">{{ profile.stats.followers }}</div>
            <div class="sc-lbl">{{ $t('users.profile.overview.stats.followers') }}</div>
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
          <div class="mb-3">
            <label class="form-label">{{ $t('users.profile.personal.form.name.label') }}</label>
            <input v-model="fPersonal.name" type="text" class="form-control" maxlength="180" />
          </div>
          <div class="form-grid-2 mb-3">
            <div>
              <label class="form-label">{{ $t('users.profile.personal.form.username.label') }}</label>
              <div class="input-group">
                <span class="input-group-text">@</span>
                <input v-model="fPersonal.username" type="text" class="form-control" />
              </div>
            </div>
            <div>
              <label class="form-label">{{ $t('users.profile.personal.form.car_number.label') }}</label>
              <div class="input-group">
                <span class="input-group-text">#</span>
                <input v-model="fPersonal.car_number" type="text" class="form-control" maxlength="20" />
              </div>
            </div>
          </div>
          <div>
            <label class="form-label">{{ $t('users.profile.personal.form.bio.label') }}</label>
            <textarea v-model="fPersonal.bio" class="form-control" rows="3" maxlength="500" style="resize:vertical"></textarea>
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
              <label class="form-label">{{ $t('users.profile.personal.form.location.label') }}</label>
              <input v-model="fPersonal.location" type="text" class="form-control" maxlength="180" />
            </div>
            <div>
              <label class="form-label">{{ $t('users.profile.personal.form.birthdate.label') }}</label>
              <input v-model="fPersonal.birthdate" type="date" class="form-control" />
            </div>
          </div>
          <div class="form-grid-2 mb-3">
            <div>
              <label class="form-label">{{ $t('users.profile.personal.form.driving_style.label') }}</label>
              <select v-model="fPersonal.driving_style" class="form-select">
                <option value="">—</option>
                <option value="aggressive">{{ $t('users.profile.personal.driving_styles.aggressive') }}</option>
                <option value="smooth">{{ $t('users.profile.personal.driving_styles.smooth') }}</option>
                <option value="strategic">{{ $t('users.profile.personal.driving_styles.strategic') }}</option>
                <option value="technical">{{ $t('users.profile.personal.driving_styles.technical') }}</option>
                <option value="defensive">{{ $t('users.profile.personal.driving_styles.defensive') }}</option>
              </select>
            </div>
            <div>
              <label class="form-label">{{ $t('users.profile.personal.form.favorite_category.label') }}</label>
              <input v-model="fPersonal.favorite_category" type="text" class="form-control" maxlength="80" />
            </div>
          </div>
          <div>
            <label class="form-label">{{ $t('users.profile.personal.form.motto.label') }}</label>
            <input v-model="fPersonal.motto" type="text" class="form-control" maxlength="160" />
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
          <h3><font-awesome-icon :icon="['fas', 'sliders']" class="set-ico" />{{ $t('users.profile.privacy.interactions.title') }}</h3>
          <p class="set-desc">{{ $t('users.profile.privacy.interactions.desc') }}</p>
          <div v-for="key in ['show_email', 'show_phone', 'show_birthdate', 'show_followers']" :key="key" class="toggle-row">
            <div class="toggle-info">
              <div class="ti-label">{{ $t('users.profile.privacy.toggles.' + key + '.label') }}</div>
              <div class="ti-desc">{{ $t('users.profile.privacy.toggles.' + key + '.desc') }}</div>
            </div>
            <div class="form-check form-switch mb-0">
              <input class="form-check-input" type="checkbox" :id="'t-' + key" v-model="fPrivacy[key]" style="width:2.6em;height:1.4em;cursor:pointer" />
            </div>
          </div>
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
          <h3><font-awesome-icon :icon="['fas', 'trophy']" class="set-ico" />{{ $t('users.profile.notifications.championship.title') }}</h3>
          <p class="set-desc">{{ $t('users.profile.notifications.championship.desc') }}</p>
          <div v-for="key in ['event_start', 'stage_update', 'results']" :key="'ch-' + key" class="toggle-row">
            <div class="toggle-info">
              <div class="ti-label">{{ $t('users.profile.notifications.championship.' + key + '.label') }}</div>
              <div class="ti-desc">{{ $t('users.profile.notifications.championship.' + key + '.desc') }}</div>
            </div>
            <div class="form-check form-switch mb-0">
              <input class="form-check-input" type="checkbox" v-model="fNotifications.championship[key]" style="width:2.6em;height:1.4em;cursor:pointer" />
            </div>
          </div>
        </div>

        <div class="set-card mb-4">
          <h3><font-awesome-icon :icon="['fas', 'users']" class="set-ico" />{{ $t('users.profile.notifications.social.title') }}</h3>
          <p class="set-desc">{{ $t('users.profile.notifications.social.desc') }}</p>
          <div v-for="key in ['new_follower', 'org_invitation']" :key="'soc-' + key" class="toggle-row">
            <div class="toggle-info">
              <div class="ti-label">{{ $t('users.profile.notifications.social.' + key + '.label') }}</div>
              <div class="ti-desc">{{ $t('users.profile.notifications.social.' + key + '.desc') }}</div>
            </div>
            <div class="form-check form-switch mb-0">
              <input class="form-check-input" type="checkbox" v-model="fNotifications.social[key]" style="width:2.6em;height:1.4em;cursor:pointer" />
            </div>
          </div>
        </div>

        <div class="set-card mb-4">
          <h3><font-awesome-icon :icon="['fas', 'envelope']" class="set-ico" />{{ $t('users.profile.notifications.email.title') }}</h3>
          <p class="set-desc">{{ $t('users.profile.notifications.email.desc') }}</p>
          <div v-for="key in ['event_start', 'results']" :key="'em-' + key" class="toggle-row">
            <div class="toggle-info">
              <div class="ti-label">{{ $t('users.profile.notifications.email.' + key + '.label') }}</div>
              <div class="ti-desc">{{ $t('users.profile.notifications.email.' + key + '.desc') }}</div>
            </div>
            <div class="form-check form-switch mb-0">
              <input class="form-check-input" type="checkbox" v-model="fNotifications.email[key]" style="width:2.6em;height:1.4em;cursor:pointer" />
            </div>
          </div>
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
                <span v-if="profile.email_verified_at" class="input-group-text" style="color:#1f8a5b">
                  <font-awesome-icon :icon="['fas', 'circle-check']" />
                </span>
              </div>
            </div>
            <div>
              <label class="form-label">{{ $t('users.profile.account.since') }}</label>
              <input type="text" class="form-control" :value="profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'" disabled />
            </div>
          </div>
        </div>

        <div class="set-card mb-4">
          <h3><font-awesome-icon :icon="['fas', 'download']" class="set-ico" />{{ $t('users.profile.account.export') }}</h3>
          <p class="set-desc">{{ $t('users.profile.account.export_desc') }}</p>
          <button class="btn btn-outline-secondary round px-4">
            <font-awesome-icon :icon="['fas', 'download']" class="me-2" />{{ $t('users.profile.account.export_btn') }}
          </button>
        </div>

        <div class="set-card mb-4">
          <h3><font-awesome-icon :icon="['fas', 'link-slash']" class="set-ico" />{{ $t('users.profile.account.oauth.title') }}</h3>
          <p class="set-desc">{{ $t('users.profile.account.oauth.desc') }}</p>
          <div class="toggle-row">
            <div class="toggle-info d-flex align-items-center gap-3">
              <div class="oauth-logo">
                <svg viewBox="0 0 24 24" width="18" height="18"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              </div>
              <div>
                <div class="ti-label">Google</div>
                <div class="ti-desc">{{ profile.auth_provider === 'google' ? $t('users.profile.account.oauth.connected') : $t('users.profile.account.oauth.not_connected') }}</div>
              </div>
            </div>
            <span class="role-chip" :class="profile.auth_provider === 'google' ? 'admin' : 'member'">
              {{ profile.auth_provider === 'google' ? $t('users.profile.account.oauth.connected') : $t('users.profile.account.oauth.not_connected') }}
            </span>
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
            <div class="mb-3">
              <label class="form-label">{{ $t('users.profile.privacy.password.form.current.label') }}</label>
              <input v-model="deletePassword" type="password" class="form-control" :placeholder="$t('users.profile.account.danger.placeholder')" />
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
.nav-item.active { background: var(--ehub-primary-tint); color: var(--ehub-primary); }
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
.set-ico { color: var(--ehub-primary); font-size: .88rem; }
.set-desc { font-size: .83rem; color: var(--ehub-muted); margin: 0 0 18px; line-height: 1.5; }
.set-card.danger { border-color: color-mix(in srgb, #e23b3b 30%, var(--ehub-line)); }
.set-card.danger h3 { color: #e23b3b; }
.set-card.danger .set-ico { color: #e23b3b; }

/* ── Form grids ── */
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media (max-width: 600px) { .form-grid-2 { grid-template-columns: 1fr; } }

/* ── Completeness ── */
.comp-bar-wrap { background: var(--ehub-field-bg); border-radius: 50rem; height: 8px; overflow: hidden; }
.comp-bar-fill { height: 100%; border-radius: 50rem; background: linear-gradient(90deg, var(--ehub-primary), #00d4ff); transition: width .5s ease; }
.comp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 16px; }
.comp-item { display: flex; align-items: center; gap: 8px; font-size: .82rem; padding: 5px 0; }
.comp-item.done { color: #1f8a5b; }
.comp-item.miss { color: var(--ehub-muted); }

/* ── Stats ── */
.stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.stat-card { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 13px; padding: 16px 18px; }
.sc-ico { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: .8rem; margin-bottom: 10px; }
.sc-val { font-size: 1.65rem; font-weight: 800; color: var(--ehub-ink); letter-spacing: -.03em; line-height: 1; }
.sc-lbl { font-size: .7rem; color: var(--ehub-muted); margin-top: 3px; text-transform: uppercase; letter-spacing: .04em; font-weight: 600; }

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
.vis-seg input[type="radio"]:checked + label { background: var(--ehub-primary-tint); color: var(--ehub-primary); }

/* ── Toggle rows ── */
.toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 13px 0; border-bottom: 1px solid var(--ehub-line); gap: 16px;
}
.toggle-row:last-child { border-bottom: 0; padding-bottom: 0; }
.toggle-row:first-child { padding-top: 0; }
.toggle-info .ti-label { font-size: .9rem; font-weight: 600; color: var(--ehub-ink); }
.toggle-info .ti-desc  { font-size: .78rem; color: var(--ehub-muted); margin-top: 2px; }
.form-check-input:checked { background-color: var(--ehub-primary); border-color: var(--ehub-primary); }

/* ── OAuth logo ── */
.oauth-logo {
  width: 32px; height: 32px; border-radius: 8px; background: var(--ehub-card);
  border: 1px solid var(--ehub-line); display: flex; align-items: center; justify-content: center;
}

/* ── Role chip ── */
.role-chip { font-size: .72rem; font-weight: 700; padding: 3px 9px; border-radius: 50rem; }
.role-chip.admin { background: var(--ehub-primary-tint); color: var(--ehub-primary); }
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
</style>
