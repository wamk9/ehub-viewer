<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AvatarUpload from '@/components/inputs/AvatarUpload.vue'
import ehubInput    from '@/components/inputs/ehub-input.vue'
import Api          from '@/helpers/communication/Connection'
import store        from '@/store'
import { toast } from '@/helpers/toast.js'

const { t } = useI18n()
const router = useRouter()

// ─── State ────────────────────────────────────────────────────
const activeTab   = ref('personal')
const isLoading   = ref(false)
const loadingText = ref('')

const profile = reactive({
  name: '', surname: '', username: '', mail: '', phone: '',
  image: null, email_verified_at: null, created_at: null,
})

const personal = reactive({ name: '', surname: '', phone: '', username: '', image: '' })

const pwd = reactive({ current_password: '', password: '', password_confirmation: '' })

const deletePassword = ref('')
const deleteConfirm  = ref(false)

// ─── Helpers ──────────────────────────────────────────────────
function parseErrors(response) {
  if (response?.errors && typeof response.errors === 'object')
    return Object.values(response.errors).flat()
  return [response?.message ?? t('users.profile.error.generic')]
}

const isNewImage = computed(() => personal.image?.startsWith('data:'))

function withCache(url) {
  if (!url || url.startsWith('data:')) return url
  return url + (url.includes('?') ? '&' : '?') + 'cache=' + Date.now()
}

// ─── Load profile ─────────────────────────────────────────────
async function fetchProfile() {
  isLoading.value   = true
  loadingText.value = t('users.profile.loading.fetch')
  try {
    const result = await Api.getAsync('/user/profile', {
      headers: { Authorization: 'Bearer ' + store.getters.getToken }
    })
    if (result.code === 200) {
      const d = result.response
      Object.assign(profile, { ...d, image: withCache(d.image) })
      personal.name     = d.name
      personal.surname  = d.surname
      personal.phone    = d.phone
      personal.username = d.username
      personal.image    = withCache(d.image) ?? ''
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

  const payload = {
    name:     personal.name,
    surname:  personal.surname,
    phone:    personal.phone,
    username: personal.username,
  }
  if (isNewImage.value) payload.image = personal.image

  try {
    const result = await Api.patchAsync('/user/profile', payload)
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

// ─── Change password ──────────────────────────────────────────
async function savePassword() {
  if (pwd.password !== pwd.password_confirmation) {
    toast.error(t('users.profile.password.error.mismatch'))
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
      toast.success(t('users.profile.password.success'))
      pwd.current_password = ''
      pwd.password         = ''
      pwd.password_confirmation = ''
    } else if (result.code === 403) {
      toast.error(t('users.profile.password.error.wrong'))
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
    toast.error(t('users.profile.password.error.wrong'))
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
      toast.error(t('users.profile.password.error.wrong'))
    } else {
      toast.error(t('users.profile.error.generic'))
    }
  } catch {
    toast.error(t('users.profile.error.generic'))
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchProfile)
</script>

<template>
  <loading v-model:active="isLoading" :can-cancel="false"
    background-color="#000000" opacity="0.8" color="#dadada">
    <div class="text-center">
      <div class="spinner-border text-primary mb-3" role="status"></div>
      <h5 class="text-white">{{ loadingText }}</h5>
    </div>
  </loading>

  <main class="container">

    <!-- Header -->
    <div class="row justify-content-center mb-4">
      <div class="col-12 col-lg-9">
        <div class="d-flex align-items-center gap-3">
          <img
            :src="profile.image ?? 'https://placehold.co/80'"
            class="rounded-circle"
            width="64" height="64"
            style="object-fit:cover; border: 3px solid var(--bs-border-color);"
            alt="avatar"
          />
          <div>
            <h2 class="mb-0 fw-light">{{ profile.name }} {{ profile.surname }}</h2>
            <span class="text-muted small">@{{ profile.username }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs + Content -->
    <div class="row justify-content-center">
      <div class="col-12 col-lg-9">

        <!-- Nav tabs -->
        <ul class="nav nav-tabs mb-4">
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'personal' }"
              @click="activeTab = 'personal'">
              <font-awesome-icon icon="user" class="me-2" />
              {{ $t('users.profile.tabs.personal') }}
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'password' }"
              @click="activeTab = 'password'">
              <font-awesome-icon icon="lock" class="me-2" />
              {{ $t('users.profile.tabs.password') }}
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: activeTab === 'account' }"
              @click="activeTab = 'account'">
              <font-awesome-icon icon="gear" class="me-2" />
              {{ $t('users.profile.tabs.account') }}
            </button>
          </li>
        </ul>

        <!-- ── Tab: Dados Pessoais ── -->
        <div v-show="activeTab === 'personal'">
          <div class="alert alert-primary d-flex align-items-center gap-2 py-2 mb-4">
            <font-awesome-icon icon="circle-info" class="flex-shrink-0" />
            <span class="small">{{ $t('users.profile.personal.tip') }}</span>
          </div>

          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">

              <div class="d-flex flex-column flex-md-row align-items-start gap-4 mb-4">
                <AvatarUpload
                  v-model="personal.image"
                  :buttonLabel="$t('users.profile.personal.form.image.upload')"
                  :dropLabel="$t('users.profile.personal.form.image.drop')"
                />
                <div class="flex-grow-1 min-w-0">
                  <ehubInput v-model="personal.name" id="prof-name" type="text"
                    :label="$t('users.profile.personal.form.name.label')" />
                  <ehubInput v-model="personal.surname" id="prof-surname" type="text"
                    :label="$t('users.profile.personal.form.surname.label')" />
                </div>
              </div>

              <ehubInput v-model="personal.phone" id="prof-phone" type="text"
                :label="$t('users.profile.personal.form.phone.label')" />
              <ehubInput v-model="personal.username" id="prof-username" type="text"
                :label="$t('users.profile.personal.form.username.label')" />

              <div class="d-flex justify-content-end mt-3">
                <button class="btn btn-primary px-4" @click="savePersonal">
                  <font-awesome-icon icon="check" class="me-2" />
                  {{ $t('users.profile.personal.submit') }}
                </button>
              </div>

            </div>
          </div>
        </div>

        <!-- ── Tab: Senha ── -->
        <div v-show="activeTab === 'password'">
          <div class="alert alert-primary d-flex align-items-center gap-2 py-2 mb-4">
            <font-awesome-icon icon="circle-info" class="flex-shrink-0" />
            <span class="small">{{ $t('users.profile.password.tip') }}</span>
          </div>

          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">

              <ehubInput v-model="pwd.current_password" id="prof-pwd-current" type="password"
                :label="$t('users.profile.password.form.current.label')"
                :placeholder="$t('users.profile.password.form.current.placeholder')" />
              <ehubInput v-model="pwd.password" id="prof-pwd-new" type="password"
                :label="$t('users.profile.password.form.new.label')"
                :placeholder="$t('users.profile.password.form.new.placeholder')" />
              <ehubInput v-model="pwd.password_confirmation" id="prof-pwd-confirm" type="password"
                :label="$t('users.profile.password.form.confirm.label')"
                :placeholder="$t('users.profile.password.form.confirm.placeholder')" />

              <div class="d-flex justify-content-end mt-3">
                <button class="btn btn-primary px-4" @click="savePassword">
                  <font-awesome-icon icon="lock" class="me-2" />
                  {{ $t('users.profile.password.submit') }}
                </button>
              </div>

            </div>
          </div>
        </div>

        <!-- ── Tab: Conta ── -->
        <div v-show="activeTab === 'account'">

          <!-- Account info -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body p-4">
              <h6 class="fw-semibold mb-3">{{ $t('users.profile.account.title') }}</h6>
              <div class="row g-3">
                <div class="col-12 col-sm-6">
                  <span class="text-muted small d-block">{{ $t('users.profile.account.mail') }}</span>
                  <span class="fw-medium">{{ profile.mail }}</span>
                  <font-awesome-icon v-if="profile.email_verified_at"
                    icon="circle-check" class="ms-2 text-success" size="sm"
                    :title="$t('users.profile.account.verified')" />
                </div>
                <div class="col-12 col-sm-6">
                  <span class="text-muted small d-block">{{ $t('users.profile.account.since') }}</span>
                  <span class="fw-medium">{{ profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Danger zone -->
          <div class="card border-danger shadow-sm">
            <div class="card-body p-4">
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
                <ehubInput v-model="deletePassword" id="prof-delete-pwd" type="password"
                  :label="''" :placeholder="$t('users.profile.account.danger.placeholder')" />
                <div class="d-flex gap-2 mt-2">
                  <button class="btn btn-outline-secondary" @click="deleteConfirm = false; deletePassword = ''">
                    {{ $t('users.create.steps.back') }}
                  </button>
                  <button class="btn btn-danger px-4" @click="deleteAccount">
                    <font-awesome-icon icon="trash" class="me-2" />
                    {{ $t('users.profile.account.danger.submit') }}
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  </main>
</template>

<style scoped>
.min-w-0 { min-width: 0; }
.nav-link { cursor: pointer; }
</style>
