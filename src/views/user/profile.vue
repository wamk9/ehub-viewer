<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AvatarUpload from '@/components/inputs/AvatarUpload.vue'
import ehubInput    from '@/components/inputs/ehub-input.vue'
import Api          from '@/helpers/communication/Connection'
import store        from '@/store'
import { toast }   from '@/helpers/toast.js'

const { t } = useI18n()
const router = useRouter()
const route  = useRoute()

// ─── Panel ────────────────────────────────────────────────────
const activePanel = ref('overview')
const panels = ['overview', 'personal', 'appearance', 'social', 'privacy', 'notifications', 'account']

function switchPanel(panel) {
  activePanel.value = panel
  router.replace({ query: { ...route.query, panel } })
}

watch(() => route.query.panel, (p) => {
  if (p && panels.includes(p)) activePanel.value = p
})

// ─── Loading ──────────────────────────────────────────────────
const isLoading   = ref(false)
const loadingText = ref('')

// ─── Profile data (display) ───────────────────────────────────
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

// ─── Editable forms ───────────────────────────────────────────
const fPersonal = reactive({
  name: '', surname: '', phone: '', username: '',
  bio: '', location: '', birthdate: '', car_number: '',
  driving_style: '', favorite_category: '', motto: '',
})

const fAppearance = reactive({ image: '', profile_color: '#0098D8' })
const coverPreview  = ref(null)   // base64 of new cover file
const coverRemoved  = ref(false)
const coverFileRef  = ref(null)

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

// ─── Computed ─────────────────────────────────────────────────
const completeness = computed(() => {
  const checks = [
    !!profile.bio,
    !!profile.location,
    !!profile.birthdate,
    !!profile.car_number,
    !!profile.driving_style,
    !!profile.favorite_category,
    !!profile.motto,
    !!profile.image,
    !!profile.cover,
    !!(profile.discord || profile.youtube || profile.twitch ||
       profile.x_twitter || profile.linkedin || profile.website),
  ]
  return Math.round(checks.filter(Boolean).length / checks.length * 100)
})

const completenessColor = computed(() => {
  if (completeness.value >= 80) return '#10b981'
  if (completeness.value >= 50) return 'var(--ehub-gold)'
  return '#ef4444'
})

const profileColors = [
  '#0098D8', '#6366f1', '#10b981', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#6b7280',
]

// ─── Helpers ──────────────────────────────────────────────────
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
    image:  withCache(d.image),
    cover:  withCache(d.cover),
    stats:  d.stats ?? { events: 0, wins: 0, followers: 0 },
    notification_prefs: d.notification_prefs ?? defaultPrefs(),
  })

  Object.assign(fPersonal, {
    name: d.name ?? '', surname: d.surname ?? '', phone: d.phone ?? '',
    username: d.username ?? '', bio: d.bio ?? '', location: d.location ?? '',
    birthdate: d.birthdate ?? '', car_number: d.car_number ?? '',
    driving_style: d.driving_style ?? '', favorite_category: d.favorite_category ?? '',
    motto: d.motto ?? '',
  })

  fAppearance.image        = withCache(d.image) ?? ''
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

// ─── Load ─────────────────────────────────────────────────────
async function fetchProfile() {
  isLoading.value   = true
  loadingText.value = t('users.profile.loading.fetch')
  try {
    const result = await Api.getAsync('/user/profile')
    if (result.code === 200) {
      applyProfile(result.response)
    } else {
      toast.error(t('users.profile.error.fetch'))
    }
  } catch {
    toast.error(t('users.profile.error.fetch'))
  } finally {
    isLoading.value = false
  }
}

// ─── Save personal ────────────────────────────────────────────
async function savePersonal() {
  isLoading.value   = true
  loadingText.value = t('users.profile.loading.saving')
  try {
    const result = await Api.patchAsync('/user/profile', { ...fPersonal })
    if (result.code === 200) {
      toast.success(t('users.profile.personal.success'))
      await fetchProfile()
    } else {
      toast.error(parseErrors(result.response).join('\n'))
    }
  } catch {
    toast.error(t('users.profile.error.generic'))
  } finally {
    isLoading.value = false
  }
}

// ─── Save appearance ──────────────────────────────────────────
async function saveAppearance() {
  isLoading.value   = true
  loadingText.value = t('users.profile.loading.saving')
  try {
    const tasks = []

    const profilePayload = { profile_color: fAppearance.profile_color }
    if (fAppearance.image?.startsWith('data:')) profilePayload.image = fAppearance.image
    tasks.push(Api.patchAsync('/user/profile', profilePayload))

    if (coverPreview.value) {
      tasks.push(Api.postAsync('/user/upload/cover', { cover: coverPreview.value }))
    } else if (coverRemoved.value) {
      tasks.push(Api.deleteAsync('/user/upload/cover'))
    }

    await Promise.all(tasks)
    toast.success(t('users.profile.appearance.success'))
    await fetchProfile()
  } catch {
    toast.error(t('users.profile.error.generic'))
  } finally {
    isLoading.value = false
  }
}

// ─── Cover file input ─────────────────────────────────────────
function onCoverFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    coverPreview.value = ev.target.result
    coverRemoved.value = false
  }
  reader.readAsDataURL(file)
}

function removeCoverLocal() {
  coverPreview.value = null
  coverRemoved.value = true
}

// ─── Save social ──────────────────────────────────────────────
async function saveSocial() {
  isLoading.value   = true
  loadingText.value = t('users.profile.loading.saving')
  try {
    const result = await Api.patchAsync('/user/profile', { ...fSocial })
    if (result.code === 200) {
      toast.success(t('users.profile.social.success'))
      await fetchProfile()
    } else {
      toast.error(parseErrors(result.response).join('\n'))
    }
  } catch {
    toast.error(t('users.profile.error.generic'))
  } finally {
    isLoading.value = false
  }
}

// ─── Save privacy ─────────────────────────────────────────────
async function savePrivacy() {
  isLoading.value   = true
  loadingText.value = t('users.profile.loading.saving')
  const prefs = {
    ...(profile.notification_prefs ?? defaultPrefs()),
    privacy: {
      show_email:     fPrivacy.show_email,
      show_phone:     fPrivacy.show_phone,
      show_birthdate: fPrivacy.show_birthdate,
      show_followers: fPrivacy.show_followers,
    },
  }
  try {
    const result = await Api.patchAsync('/user/profile', {
      profile_visibility: fPrivacy.profile_visibility,
      notification_prefs: prefs,
    })
    if (result.code === 200) {
      toast.success(t('users.profile.privacy.success'))
      await fetchProfile()
    } else {
      toast.error(parseErrors(result.response).join('\n'))
    }
  } catch {
    toast.error(t('users.profile.error.generic'))
  } finally {
    isLoading.value = false
  }
}

// ─── Save notifications ───────────────────────────────────────
async function saveNotifications() {
  isLoading.value   = true
  loadingText.value = t('users.profile.loading.saving')
  const prefs = {
    ...(profile.notification_prefs ?? defaultPrefs()),
    championship: { ...fNotifications.championship },
    social:       { ...fNotifications.social },
    email:        { ...fNotifications.email },
  }
  try {
    const result = await Api.patchAsync('/user/profile', { notification_prefs: prefs })
    if (result.code === 200) {
      toast.success(t('users.profile.notifications.success'))
      await fetchProfile()
    } else {
      toast.error(parseErrors(result.response).join('\n'))
    }
  } catch {
    toast.error(t('users.profile.error.generic'))
  } finally {
    isLoading.value = false
  }
}

// ─── Change password ──────────────────────────────────────────
async function savePassword() {
  if (pwd.password !== pwd.password_confirmation) {
    toast.error(t('users.profile.privacy.password.error.mismatch'))
    return
  }
  isLoading.value   = true
  loadingText.value = t('users.profile.loading.saving')
  try {
    const result = await Api.patchAsync('/user/password', {
      current_password:      pwd.current_password,
      password:              pwd.password,
      password_confirmation: pwd.password_confirmation,
    })
    if (result.code === 200) {
      toast.success(t('users.profile.privacy.password.success'))
      pwd.current_password = ''
      pwd.password         = ''
      pwd.password_confirmation = ''
    } else if (result.code === 403) {
      toast.error(t('users.profile.privacy.password.error.wrong'))
    } else {
      toast.error(parseErrors(result.response).join('\n'))
    }
  } catch {
    toast.error(t('users.profile.error.generic'))
  } finally {
    isLoading.value = false
  }
}

// ─── Delete account ───────────────────────────────────────────
async function deleteAccount() {
  if (!deletePassword.value) {
    toast.error(t('users.profile.privacy.password.error.wrong'))
    return
  }
  isLoading.value   = true
  loadingText.value = t('users.profile.loading.deleting')
  try {
    const result = await Api.deleteAsync('/user', { password: deletePassword.value })
    if (result.code === 200) {
      store.dispatch('removeToken')
      router.push({ name: 'home' })
    } else if (result.code === 403) {
      toast.error(t('users.profile.privacy.password.error.wrong'))
    } else {
      toast.error(t('users.profile.error.generic'))
    }
  } catch {
    toast.error(t('users.profile.error.generic'))
  } finally {
    isLoading.value = false
  }
}

function panelIcon(p) {
  const m = {
    overview: 'chart-bar', personal: 'user', appearance: 'palette',
    social: 'share-nodes', privacy: 'lock', notifications: 'bell', account: 'gear',
  }
  return m[p] ?? 'circle'
}

onMounted(() => {
  const p = route.query.panel
  if (p && panels.includes(p)) activePanel.value = p
  fetchProfile()
})
</script>

<template>
  <loading v-model:active="isLoading" :can-cancel="false"
    background-color="#000000" opacity="0.8" color="#dadada">
    <div class="text-center">
      <div class="spinner-border text-primary mb-3" role="status"></div>
      <h5 class="text-white">{{ loadingText }}</h5>
    </div>
  </loading>

  <div class="profile-layout container py-4">

    <!-- ── Sidebar ── -->
    <aside class="profile-sidebar">
      <!-- User identity -->
      <div class="sidebar-identity">
        <div class="sidebar-avatar-wrap">
          <img
            :src="profile.image ?? 'https://placehold.co/80/0098D8/ffffff?text=' + (profile.name?.[0] ?? '?')"
            class="sidebar-avatar"
            alt="avatar"
          />
          <div class="sidebar-color-dot" :style="{ background: profile.profile_color }"></div>
        </div>
        <p class="sidebar-name">{{ profile.name }} {{ profile.surname }}</p>
        <p class="sidebar-handle">@{{ profile.username }}</p>

        <!-- Completeness bar -->
        <div class="comp-wrap">
          <div class="comp-bar">
            <div class="comp-fill" :style="{ width: completeness + '%', background: completenessColor }"></div>
          </div>
          <span class="comp-pct" :style="{ color: completenessColor }">{{ completeness }}%</span>
        </div>
        <p class="comp-label">{{ $t('users.profile.overview.completeness') }}</p>
      </div>

      <!-- Nav -->
      <nav class="sidebar-nav">
        <button
          v-for="p in panels"
          :key="p"
          class="snav-btn"
          :class="{ active: activePanel === p }"
          @click="switchPanel(p)"
        >
          <font-awesome-icon :icon="panelIcon(p)" class="snav-ico" />
          {{ $t('users.profile.nav.' + p) }}
        </button>
      </nav>
    </aside>

    <!-- ── Content ── -->
    <div class="profile-content">

      <!-- ── Overview ── -->
      <div v-show="activePanel === 'overview'">
        <h2 class="panel-title">{{ $t('users.profile.nav.overview') }}</h2>

        <!-- Stats -->
        <div class="stats-row mb-4">
          <div class="stat-card">
            <span class="stat-v">{{ profile.stats.events }}</span>
            <span class="stat-l">{{ $t('users.profile.overview.stats.events') }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-v">{{ profile.stats.wins }}</span>
            <span class="stat-l">{{ $t('users.profile.overview.stats.wins') }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-v">{{ profile.stats.followers }}</span>
            <span class="stat-l">{{ $t('users.profile.overview.stats.followers') }}</span>
          </div>
        </div>

        <!-- Profile completeness detail -->
        <div class="ehub-card p-4 mb-4">
          <p class="mb-2 fw-semibold" style="font-size:.9rem">{{ $t('users.profile.overview.completeness') }} — {{ completeness }}%</p>
          <div class="comp-bar-lg mb-3">
            <div class="comp-fill-lg" :style="{ width: completeness + '%', background: completenessColor }"></div>
          </div>
          <div class="comp-checklist">
            <span class="comp-item" :class="{ done: profile.image }">
              <font-awesome-icon :icon="profile.image ? 'circle-check' : 'circle'" />
              {{ $t('users.profile.nav.appearance') }} — {{ $t('users.profile.appearance.avatar.title') }}
            </span>
            <span class="comp-item" :class="{ done: profile.cover }">
              <font-awesome-icon :icon="profile.cover ? 'circle-check' : 'circle'" />
              {{ $t('users.profile.nav.appearance') }} — {{ $t('users.profile.appearance.cover.title') }}
            </span>
            <span class="comp-item" :class="{ done: profile.bio }">
              <font-awesome-icon :icon="profile.bio ? 'circle-check' : 'circle'" />
              {{ $t('users.profile.personal.form.bio.label') }}
            </span>
            <span class="comp-item" :class="{ done: profile.location }">
              <font-awesome-icon :icon="profile.location ? 'circle-check' : 'circle'" />
              {{ $t('users.profile.personal.form.location.label') }}
            </span>
            <span class="comp-item" :class="{ done: profile.birthdate }">
              <font-awesome-icon :icon="profile.birthdate ? 'circle-check' : 'circle'" />
              {{ $t('users.profile.personal.form.birthdate.label') }}
            </span>
            <span class="comp-item" :class="{ done: profile.car_number }">
              <font-awesome-icon :icon="profile.car_number ? 'circle-check' : 'circle'" />
              {{ $t('users.profile.personal.form.car_number.label') }}
            </span>
            <span class="comp-item" :class="{ done: profile.driving_style }">
              <font-awesome-icon :icon="profile.driving_style ? 'circle-check' : 'circle'" />
              {{ $t('users.profile.personal.form.driving_style.label') }}
            </span>
            <span class="comp-item" :class="{ done: profile.favorite_category }">
              <font-awesome-icon :icon="profile.favorite_category ? 'circle-check' : 'circle'" />
              {{ $t('users.profile.personal.form.favorite_category.label') }}
            </span>
            <span class="comp-item" :class="{ done: profile.motto }">
              <font-awesome-icon :icon="profile.motto ? 'circle-check' : 'circle'" />
              {{ $t('users.profile.personal.form.motto.label') }}
            </span>
            <span class="comp-item" :class="{ done: profile.discord || profile.youtube || profile.twitch || profile.x_twitter || profile.linkedin || profile.website }">
              <font-awesome-icon :icon="(profile.discord || profile.youtube || profile.twitch || profile.x_twitter || profile.linkedin || profile.website) ? 'circle-check' : 'circle'" />
              {{ $t('users.profile.nav.social') }}
            </span>
          </div>
        </div>
      </div>

      <!-- ── Personal ── -->
      <div v-show="activePanel === 'personal'">
        <h2 class="panel-title">{{ $t('users.profile.nav.personal') }}</h2>
        <div class="alert tip-alert d-flex align-items-center gap-2 py-2 mb-4 small">
          <font-awesome-icon icon="circle-info" />
          {{ $t('users.profile.personal.tip') }}
        </div>

        <div class="ehub-card p-4">
          <!-- Avatar + name row -->
          <div class="d-flex flex-column flex-md-row align-items-start gap-4 mb-4">
            <AvatarUpload
              v-model="fAppearance.image"
              :buttonLabel="$t('users.profile.appearance.avatar.change')"
              :dropLabel="$t('users.profile.appearance.avatar.drop')"
              :fallbackName="profile.name + ' ' + profile.surname"
            />
            <div class="flex-grow-1 min-w-0">
              <ehubInput v-model="fPersonal.name"     id="pf-name"     type="text"  :label="$t('users.profile.personal.form.name.label')" />
              <ehubInput v-model="fPersonal.surname"  id="pf-surname"  type="text"  :label="$t('users.profile.personal.form.surname.label')" />
            </div>
          </div>

          <div class="row g-3">
            <div class="col-12 col-md-6">
              <ehubInput v-model="fPersonal.username" id="pf-username" type="text"  :label="$t('users.profile.personal.form.username.label')" />
            </div>
            <div class="col-12 col-md-6">
              <ehubInput v-model="fPersonal.phone"    id="pf-phone"    type="text"  :label="$t('users.profile.personal.form.phone.label')" />
            </div>
          </div>

          <!-- Bio -->
          <div class="mb-3">
            <label class="form-label">{{ $t('users.profile.personal.form.bio.label') }}</label>
            <textarea
              v-model="fPersonal.bio"
              class="form-control"
              rows="3"
              maxlength="160"
              :placeholder="$t('users.profile.personal.form.bio.placeholder')"
            ></textarea>
            <div class="text-end mt-1" style="font-size:.76rem; color:var(--ehub-muted)">
              {{ $t('users.profile.personal.form.bio.chars', { n: fPersonal.bio?.length ?? 0 }) }}
            </div>
          </div>

          <div class="row g-3">
            <div class="col-12 col-md-6">
              <ehubInput v-model="fPersonal.location" id="pf-location" type="text" :label="$t('users.profile.personal.form.location.label')" :placeholder="$t('users.profile.personal.form.location.placeholder')" />
            </div>
            <div class="col-12 col-md-6">
              <ehubInput v-model="fPersonal.birthdate" id="pf-birthdate" type="date" :label="$t('users.profile.personal.form.birthdate.label')" />
            </div>
            <div class="col-12 col-md-4">
              <ehubInput v-model="fPersonal.car_number" id="pf-car" type="text" :label="$t('users.profile.personal.form.car_number.label')" :placeholder="$t('users.profile.personal.form.car_number.placeholder')" />
            </div>
            <div class="col-12 col-md-4">
              <div class="mb-3">
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
            </div>
            <div class="col-12 col-md-4">
              <ehubInput v-model="fPersonal.favorite_category" id="pf-cat" type="text" :label="$t('users.profile.personal.form.favorite_category.label')" :placeholder="$t('users.profile.personal.form.favorite_category.placeholder')" />
            </div>
            <div class="col-12">
              <ehubInput v-model="fPersonal.motto" id="pf-motto" type="text" :label="$t('users.profile.personal.form.motto.label')" :placeholder="$t('users.profile.personal.form.motto.placeholder')" />
            </div>
          </div>

          <div class="d-flex justify-content-end mt-3">
            <button class="btn btn-primary px-4" @click="savePersonal">
              <font-awesome-icon icon="check" class="me-2" />
              {{ $t('users.profile.personal.submit') }}
            </button>
          </div>
        </div>
      </div>

      <!-- ── Appearance ── -->
      <div v-show="activePanel === 'appearance'">
        <h2 class="panel-title">{{ $t('users.profile.nav.appearance') }}</h2>

        <!-- Cover -->
        <div class="ehub-card p-4 mb-4">
          <p class="fw-semibold mb-3" style="font-size:.9rem">{{ $t('users.profile.appearance.cover.title') }}</p>
          <div class="cover-upload-area" @click="coverFileRef?.click()">
            <img
              v-if="coverPreview || (!coverRemoved && profile.cover)"
              :src="coverPreview || profile.cover"
              class="cover-preview-img"
              alt="cover"
            />
            <div v-else class="cover-placeholder">
              <font-awesome-icon icon="image" style="font-size:1.6rem; margin-bottom:8px" />
              <span>{{ $t('users.profile.appearance.cover.drop') }}</span>
            </div>
          </div>
          <input type="file" ref="coverFileRef" accept="image/*" class="d-none" @change="onCoverFile" />
          <div class="d-flex gap-2 mt-3">
            <button class="btn btn-ghost btn-sm" @click="coverFileRef?.click()">
              <font-awesome-icon icon="upload" class="me-2" />
              {{ $t('users.profile.appearance.cover.change') }}
            </button>
            <button v-if="coverPreview || (!coverRemoved && profile.cover)" class="btn btn-outline-danger btn-sm" @click="removeCoverLocal">
              <font-awesome-icon icon="trash" class="me-2" />
              {{ $t('users.profile.appearance.cover.remove') }}
            </button>
          </div>
        </div>

        <!-- Avatar -->
        <div class="ehub-card p-4 mb-4">
          <p class="fw-semibold mb-3" style="font-size:.9rem">{{ $t('users.profile.appearance.avatar.title') }}</p>
          <div class="d-flex align-items-center gap-4">
            <AvatarUpload
              v-model="fAppearance.image"
              :buttonLabel="$t('users.profile.appearance.avatar.change')"
              :dropLabel="$t('users.profile.appearance.avatar.drop')"
              :fallbackName="profile.name + ' ' + profile.surname"
            />
            <p class="text-muted small mb-0">{{ $t('users.profile.appearance.avatar.change') }} — JPG, PNG, WebP</p>
          </div>
        </div>

        <!-- Profile color -->
        <div class="ehub-card p-4 mb-4">
          <p class="fw-semibold mb-1" style="font-size:.9rem">{{ $t('users.profile.appearance.color.title') }}</p>
          <p class="text-muted small mb-3">{{ $t('users.profile.appearance.color.tip') }}</p>
          <div class="color-swatches">
            <button
              v-for="color in profileColors"
              :key="color"
              class="color-swatch"
              :class="{ active: fAppearance.profile_color === color }"
              :style="{ background: color }"
              @click="fAppearance.profile_color = color"
            >
              <font-awesome-icon v-if="fAppearance.profile_color === color" icon="check" style="color:#fff; font-size:.7rem" />
            </button>
          </div>
        </div>

        <div class="d-flex justify-content-end">
          <button class="btn btn-primary px-4" @click="saveAppearance">
            <font-awesome-icon icon="check" class="me-2" />
            {{ $t('users.profile.appearance.submit') }}
          </button>
        </div>
      </div>

      <!-- ── Social ── -->
      <div v-show="activePanel === 'social'">
        <h2 class="panel-title">{{ $t('users.profile.nav.social') }}</h2>
        <div class="alert tip-alert d-flex align-items-center gap-2 py-2 mb-4 small">
          <font-awesome-icon icon="circle-info" />
          {{ $t('users.profile.social.tip') }}
        </div>

        <div class="ehub-card p-4">
          <div class="row g-3">
            <div class="col-12 col-md-6">
              <div class="input-group-social">
                <font-awesome-icon :icon="['fab', 'discord']" class="social-ico" style="color:#5865f2" />
                <ehubInput v-model="fSocial.discord" id="pf-discord" type="text"
                  :label="$t('users.profile.social.form.discord.label')"
                  :placeholder="$t('users.profile.social.form.discord.placeholder')" />
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="input-group-social">
                <font-awesome-icon :icon="['fab', 'youtube']" class="social-ico" style="color:#ff0000" />
                <ehubInput v-model="fSocial.youtube" id="pf-youtube" type="text"
                  :label="$t('users.profile.social.form.youtube.label')"
                  :placeholder="$t('users.profile.social.form.youtube.placeholder')" />
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="input-group-social">
                <font-awesome-icon :icon="['fab', 'twitch']" class="social-ico" style="color:#9146ff" />
                <ehubInput v-model="fSocial.twitch" id="pf-twitch" type="text"
                  :label="$t('users.profile.social.form.twitch.label')"
                  :placeholder="$t('users.profile.social.form.twitch.placeholder')" />
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="input-group-social">
                <font-awesome-icon :icon="['fab', 'x-twitter']" class="social-ico" />
                <ehubInput v-model="fSocial.x_twitter" id="pf-twitter" type="text"
                  :label="$t('users.profile.social.form.x_twitter.label')"
                  :placeholder="$t('users.profile.social.form.x_twitter.placeholder')" />
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="input-group-social">
                <font-awesome-icon :icon="['fab', 'linkedin']" class="social-ico" style="color:#0a66c2" />
                <ehubInput v-model="fSocial.linkedin" id="pf-linkedin" type="text"
                  :label="$t('users.profile.social.form.linkedin.label')"
                  :placeholder="$t('users.profile.social.form.linkedin.placeholder')" />
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="input-group-social">
                <font-awesome-icon icon="globe" class="social-ico" />
                <ehubInput v-model="fSocial.website" id="pf-website" type="url"
                  :label="$t('users.profile.social.form.website.label')"
                  :placeholder="$t('users.profile.social.form.website.placeholder')" />
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end mt-3">
            <button class="btn btn-primary px-4" @click="saveSocial">
              <font-awesome-icon icon="check" class="me-2" />
              {{ $t('users.profile.social.submit') }}
            </button>
          </div>
        </div>
      </div>

      <!-- ── Privacy ── -->
      <div v-show="activePanel === 'privacy'">
        <h2 class="panel-title">{{ $t('users.profile.nav.privacy') }}</h2>

        <!-- Visibility -->
        <div class="ehub-card p-4 mb-4">
          <p class="fw-semibold mb-3" style="font-size:.9rem">{{ $t('users.profile.privacy.visibility.label') }}</p>
          <div class="seg">
            <button :class="{ active: fPrivacy.profile_visibility === 'public' }" @click="fPrivacy.profile_visibility = 'public'">
              <font-awesome-icon icon="globe" />
              {{ $t('users.profile.privacy.visibility.public') }}
            </button>
            <button :class="{ active: fPrivacy.profile_visibility === 'followers' }" @click="fPrivacy.profile_visibility = 'followers'">
              <font-awesome-icon icon="users" />
              {{ $t('users.profile.privacy.visibility.followers') }}
            </button>
            <button :class="{ active: fPrivacy.profile_visibility === 'private' }" @click="fPrivacy.profile_visibility = 'private'">
              <font-awesome-icon icon="lock" />
              {{ $t('users.profile.privacy.visibility.private') }}
            </button>
          </div>
        </div>

        <!-- Toggles -->
        <div class="ehub-card p-4 mb-4">
          <div v-for="key in ['show_email', 'show_phone', 'show_birthdate', 'show_followers']" :key="key"
            class="toggle-row">
            <div>
              <p class="toggle-label">{{ $t('users.profile.privacy.toggles.' + key + '.label') }}</p>
              <p class="toggle-desc">{{ $t('users.profile.privacy.toggles.' + key + '.desc') }}</p>
            </div>
            <div class="form-check form-switch mb-0">
              <input class="form-check-input" type="checkbox" :id="'t-' + key" v-model="fPrivacy[key]" />
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-end mb-4">
          <button class="btn btn-primary px-4" @click="savePrivacy">
            <font-awesome-icon icon="check" class="me-2" />
            {{ $t('users.profile.privacy.submit') }}
          </button>
        </div>

        <!-- Change password -->
        <div class="ehub-card p-4">
          <h6 class="fw-semibold mb-2">{{ $t('users.profile.privacy.password.title') }}</h6>
          <div class="alert tip-alert d-flex align-items-center gap-2 py-2 mb-4 small">
            <font-awesome-icon icon="circle-info" />
            {{ $t('users.profile.privacy.password.tip') }}
          </div>

          <ehubInput v-model="pwd.current_password" id="pf-pwd-cur" type="password"
            :label="$t('users.profile.privacy.password.form.current.label')"
            :placeholder="$t('users.profile.privacy.password.form.current.placeholder')" />
          <ehubInput v-model="pwd.password" id="pf-pwd-new" type="password"
            :label="$t('users.profile.privacy.password.form.new.label')"
            :placeholder="$t('users.profile.privacy.password.form.new.placeholder')" />
          <ehubInput v-model="pwd.password_confirmation" id="pf-pwd-confirm" type="password"
            :label="$t('users.profile.privacy.password.form.confirm.label')"
            :placeholder="$t('users.profile.privacy.password.form.confirm.placeholder')" />

          <div class="d-flex justify-content-end mt-3">
            <button class="btn btn-primary px-4" @click="savePassword">
              <font-awesome-icon icon="lock" class="me-2" />
              {{ $t('users.profile.privacy.password.submit') }}
            </button>
          </div>
        </div>
      </div>

      <!-- ── Notifications ── -->
      <div v-show="activePanel === 'notifications'">
        <h2 class="panel-title">{{ $t('users.profile.nav.notifications') }}</h2>

        <!-- Championship -->
        <div class="ehub-card p-4 mb-4">
          <p class="fw-semibold mb-3" style="font-size:.9rem">
            <font-awesome-icon icon="trophy" class="me-2 text-primary" />
            {{ $t('users.profile.notifications.championship.title') }}
          </p>
          <div v-for="key in ['event_start', 'stage_update', 'results']" :key="'ch-' + key" class="toggle-row">
            <div>
              <p class="toggle-label">{{ $t('users.profile.notifications.championship.' + key + '.label') }}</p>
              <p class="toggle-desc">{{ $t('users.profile.notifications.championship.' + key + '.desc') }}</p>
            </div>
            <div class="form-check form-switch mb-0">
              <input class="form-check-input" type="checkbox" :id="'ch-' + key" v-model="fNotifications.championship[key]" />
            </div>
          </div>
        </div>

        <!-- Social -->
        <div class="ehub-card p-4 mb-4">
          <p class="fw-semibold mb-3" style="font-size:.9rem">
            <font-awesome-icon icon="users" class="me-2 text-primary" />
            {{ $t('users.profile.notifications.social.title') }}
          </p>
          <div v-for="key in ['new_follower', 'org_invitation']" :key="'soc-' + key" class="toggle-row">
            <div>
              <p class="toggle-label">{{ $t('users.profile.notifications.social.' + key + '.label') }}</p>
              <p class="toggle-desc">{{ $t('users.profile.notifications.social.' + key + '.desc') }}</p>
            </div>
            <div class="form-check form-switch mb-0">
              <input class="form-check-input" type="checkbox" :id="'soc-' + key" v-model="fNotifications.social[key]" />
            </div>
          </div>
        </div>

        <!-- Email -->
        <div class="ehub-card p-4 mb-4">
          <p class="fw-semibold mb-3" style="font-size:.9rem">
            <font-awesome-icon icon="envelope" class="me-2 text-primary" />
            {{ $t('users.profile.notifications.email.title') }}
          </p>
          <div v-for="key in ['event_start', 'results']" :key="'em-' + key" class="toggle-row">
            <div>
              <p class="toggle-label">{{ $t('users.profile.notifications.email.' + key + '.label') }}</p>
              <p class="toggle-desc">{{ $t('users.profile.notifications.email.' + key + '.desc') }}</p>
            </div>
            <div class="form-check form-switch mb-0">
              <input class="form-check-input" type="checkbox" :id="'em-' + key" v-model="fNotifications.email[key]" />
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-end">
          <button class="btn btn-primary px-4" @click="saveNotifications">
            <font-awesome-icon icon="check" class="me-2" />
            {{ $t('users.profile.notifications.submit') }}
          </button>
        </div>
      </div>

      <!-- ── Account ── -->
      <div v-show="activePanel === 'account'">
        <h2 class="panel-title">{{ $t('users.profile.nav.account') }}</h2>

        <!-- Account info -->
        <div class="ehub-card p-4 mb-4">
          <div class="row g-3">
            <div class="col-12 col-sm-6">
              <span class="text-muted small d-block">{{ $t('users.profile.account.mail') }}</span>
              <span class="fw-medium">{{ profile.mail }}</span>
              <font-awesome-icon v-if="profile.email_verified_at" icon="circle-check"
                class="ms-2 text-success" size="sm" :title="$t('users.profile.account.verified')" />
            </div>
            <div class="col-12 col-sm-6">
              <span class="text-muted small d-block">{{ $t('users.profile.account.since') }}</span>
              <span class="fw-medium">{{ profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—' }}</span>
            </div>
          </div>
        </div>

        <!-- OAuth -->
        <div class="ehub-card p-4 mb-4">
          <p class="fw-semibold mb-3" style="font-size:.9rem">{{ $t('users.profile.account.oauth.title') }}</p>
          <div class="d-flex align-items-center gap-3">
            <div class="oauth-row">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <span class="fw-medium">{{ $t('users.profile.account.oauth.google') }}</span>
              <span class="role-chip" :class="profile.auth_provider === 'google' ? 'admin' : 'member'">
                {{ profile.auth_provider === 'google' ? $t('users.profile.account.oauth.connected') : $t('users.profile.account.oauth.not_connected') }}
              </span>
            </div>
          </div>
        </div>

        <!-- Danger zone -->
        <div class="ehub-card p-4 border-danger">
          <h6 class="fw-semibold text-danger mb-2">
            <font-awesome-icon icon="triangle-exclamation" class="me-2" />
            {{ $t('users.profile.account.danger.title') }}
          </h6>
          <p class="text-muted small mb-3">{{ $t('users.profile.account.danger.description') }}</p>

          <div v-if="!deleteConfirm">
            <button class="btn btn-outline-danger" @click="deleteConfirm = true">
              <font-awesome-icon icon="trash" class="me-2" />
              {{ $t('users.profile.account.danger.submit') }}
            </button>
          </div>
          <div v-else>
            <div class="alert alert-warning py-2 small mb-3">
              <font-awesome-icon icon="triangle-exclamation" class="me-2" />
              {{ $t('users.profile.account.danger.confirm') }}
            </div>
            <ehubInput v-model="deletePassword" id="pf-del-pwd" type="password"
              :label="''" :placeholder="$t('users.profile.account.danger.placeholder')" />
            <div class="d-flex gap-2 mt-2">
              <button class="btn btn-outline-secondary btn-sm" @click="deleteConfirm = false; deletePassword = ''">
                {{ $t('users.create.steps.back') }}
              </button>
              <button class="btn btn-danger" @click="deleteAccount">
                <font-awesome-icon icon="trash" class="me-2" />
                {{ $t('users.profile.account.danger.submit') }}
              </button>
            </div>
          </div>
        </div>
      </div>

    </div><!-- /profile-content -->
  </div><!-- /profile-layout -->
</template>

<style scoped>
.min-w-0 { min-width: 0; }

/* ── Layout ── */
.profile-layout {
  display: flex;
  gap: 28px;
  align-items: flex-start;
}

/* ── Sidebar ── */
.profile-sidebar {
  width: 240px;
  flex-shrink: 0;
  position: sticky;
  top: 80px;
}

.sidebar-identity {
  background: var(--ehub-card);
  border: 1px solid var(--ehub-line);
  border-radius: var(--ehub-radius-card);
  padding: 20px;
  text-align: center;
  margin-bottom: 12px;
}
.sidebar-avatar-wrap { position: relative; display: inline-block; margin-bottom: 12px; }
.sidebar-avatar {
  width: 72px; height: 72px; border-radius: 50%; object-fit: cover;
  border: 3px solid var(--ehub-line);
}
.sidebar-color-dot {
  width: 14px; height: 14px; border-radius: 50%;
  position: absolute; bottom: 2px; right: 2px;
  border: 2px solid var(--ehub-card);
}
.sidebar-name { font-size: .95rem; font-weight: 700; color: var(--ehub-ink); margin: 0 0 2px; }
.sidebar-handle { font-size: .8rem; color: var(--ehub-muted); margin: 0 0 12px; }

.comp-wrap { display: flex; align-items: center; gap: 8px; }
.comp-bar { flex: 1; height: 5px; border-radius: 3px; background: var(--ehub-field-bg); overflow: hidden; }
.comp-fill { height: 100%; border-radius: 3px; transition: width .4s ease; }
.comp-pct { font-size: .72rem; font-weight: 700; }
.comp-label { font-size: .7rem; color: var(--ehub-muted); margin: 4px 0 0; }

.sidebar-nav {
  background: var(--ehub-card);
  border: 1px solid var(--ehub-line);
  border-radius: var(--ehub-radius-card);
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.snav-btn {
  display: flex; align-items: center; gap: 10px;
  width: 100%; border: 0; background: transparent;
  color: var(--ehub-muted); font-size: .88rem; font-weight: 600;
  padding: 9px 12px; border-radius: 10px; cursor: pointer;
  text-align: left; transition: background .15s, color .15s;
}
.snav-btn:hover { background: var(--ehub-field-bg); color: var(--ehub-ink); }
.snav-btn.active { background: var(--ehub-primary-tint); color: var(--ehub-primary); }
.snav-ico { width: 16px; flex-shrink: 0; }

/* ── Content ── */
.profile-content { flex: 1; min-width: 0; }
.panel-title {
  font-size: 1.2rem; font-weight: 700; color: var(--ehub-ink);
  margin: 0 0 20px; letter-spacing: -.01em;
}

/* ── Stats row ── */
.stats-row { display: flex; gap: 16px; }
.stat-card {
  flex: 1; background: var(--ehub-card); border: 1px solid var(--ehub-line);
  border-radius: 12px; padding: 18px 16px; display: flex; flex-direction: column; gap: 4px;
}
.stat-v { font-size: 1.6rem; font-weight: 800; color: var(--ehub-ink); letter-spacing: -.02em; line-height: 1; }
.stat-l { font-size: .72rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--ehub-muted); }

/* ── Completeness detail ── */
.comp-bar-lg { height: 8px; border-radius: 4px; background: var(--ehub-field-bg); overflow: hidden; }
.comp-fill-lg { height: 100%; border-radius: 4px; transition: width .5s ease; }
.comp-checklist { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-top: 4px; }
.comp-item { font-size: .8rem; color: var(--ehub-muted); display: flex; align-items: center; gap: 6px; }
.comp-item.done { color: #10b981; }
.comp-item.done svg { color: #10b981; }

/* ── Cover upload ── */
.cover-upload-area {
  border: 2px dashed var(--ehub-line); border-radius: 12px;
  overflow: hidden; cursor: pointer; min-height: 160px;
  display: flex; align-items: center; justify-content: center;
  transition: border-color .15s;
}
.cover-upload-area:hover { border-color: var(--ehub-primary); }
.cover-preview-img { width: 100%; height: 200px; object-fit: cover; display: block; }
.cover-placeholder {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: var(--ehub-muted); font-size: .85rem; padding: 40px;
}

/* ── Color swatches ── */
.color-swatches { display: flex; gap: 10px; flex-wrap: wrap; }
.color-swatch {
  width: 38px; height: 38px; border-radius: 50%; border: 3px solid transparent;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: transform .15s, border-color .15s;
}
.color-swatch:hover { transform: scale(1.12); }
.color-swatch.active { border-color: var(--ehub-ink); transform: scale(1.15); }

/* ── Social icons ── */
.input-group-social { position: relative; }
.social-ico {
  position: absolute; left: 0; top: 50%; transform: translateY(-50%);
  color: var(--ehub-muted); font-size: .9rem; z-index: 1; pointer-events: none;
}

/* ── Toggle rows ── */
.toggle-row {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 12px 0; border-bottom: 1px solid var(--ehub-line);
}
.toggle-row:last-child { border-bottom: 0; padding-bottom: 0; }
.toggle-label { font-size: .88rem; font-weight: 600; color: var(--ehub-ink); margin: 0 0 2px; }
.toggle-desc  { font-size: .78rem; color: var(--ehub-muted); margin: 0; }

/* ── OAuth row ── */
.oauth-row { display: flex; align-items: center; gap: 10px; }

/* ── Danger zone border ── */
.border-danger { border: 1px solid #ef4444 !important; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .profile-layout { flex-direction: column; }
  .profile-sidebar { width: 100%; position: static; }
  .sidebar-nav { flex-direction: row; flex-wrap: wrap; }
  .snav-btn { width: auto; flex: 1 1 auto; justify-content: center; font-size: .78rem; padding: 8px 10px; }
  .snav-ico { display: none; }
  .stats-row { gap: 10px; }
}
</style>
