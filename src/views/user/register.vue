<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AuthLayout  from '@/layouts/AuthLayout.vue'
import ehubInput   from '@/components/inputs/ehub-input.vue'
import AvatarUpload from '@/components/inputs/AvatarUpload.vue'
import PhoneInput  from '@/components/inputs/PhoneInput.vue'
import EmailVerify from '@/components/inputs/EmailVerify.vue'
import Api         from '@/helpers/communication/Connection'
import OrgApi      from '@/helpers/communication/Organization'
import store       from '@/store'
import inputValidation from '@/helpers/frontend/input-validation'
import { i18n }   from '@/helpers/i18n'

const { t } = useI18n()
const router = useRouter()
const route  = useRoute()

const form = reactive({
  name: '', surname: '', mail: '', phone: '',
  username: '', password: '', password_confirm: '', image: '',
})
const inviteToken  = ref(null)
const mailVerified = ref(false)

onMounted(() => {
  if (route.query.invite) inviteToken.value = route.query.invite
  if (route.query.email) {
    form.mail = route.query.email
    mailVerified.value = true
  }
})

const inputs = ref([])
function collectRef(el) {
  if (el && !inputs.value.includes(el)) inputs.value.push(el)
}

const step  = ref(1)
const STEPS = 3

function nextStep() {
  if (step.value === 2 && !mailVerified.value) return
  const valid = inputs.value.every(el => el.forceValidate?.() !== false)
  if (!valid) return
  inputs.value = []
  if (step.value < STEPS) step.value++
}

function prevStep() {
  inputs.value = []
  if (step.value > 1) step.value--
}

const isLoading    = ref(false)
const loadingText  = ref('')
const serverErrors = ref([])

function parseServerErrors(response) {
  if (response?.errors && typeof response.errors === 'object') {
    return Object.values(response.errors).flat().map(key => i18n.t(key))
  }
  return [response?.message ?? i18n.t('users.create.loading.error.title')]
}

async function submit() {
  serverErrors.value = []
  const valid = inputs.value.every(el => el.forceValidate?.() !== false)
  if (!valid) return

  inputs.value.splice(0)
  isLoading.value = true
  loadingText.value = i18n.t('users.create.loading.creating.title')
  await nextTick()

  const payload = {
    name:     form.name,
    surname:  form.surname,
    mail:     form.mail,
    phone:    form.phone,
    username: form.username,
    password: form.password,
    image:    form.image || undefined,
  }

  try {
    const result = await Api.postAsync('/users', payload)
    if (result.code === 201) {
      loadingText.value = i18n.t('users.create.loading.created.title')
      store.dispatch('setAuthenticated', true)

      if (inviteToken.value) {
        await OrgApi.acceptInvite(inviteToken.value)
        const org = route.query.org
        setTimeout(() => router.push(org ? `/org/${org}` : '/my-orgs'), 1500)
      } else {
        setTimeout(() => router.push({ name: 'events' }), 2000)
      }
    } else {
      serverErrors.value = parseServerErrors(result.response)
      isLoading.value = false
    }
  } catch {
    serverErrors.value = [i18n.t('users.create.loading.error.title')]
    isLoading.value = false
  }
}
</script>

<template>
  <loading v-model:active="isLoading" :can-cancel="false"
    background-color="#000000" opacity="0.8" color="#dadada">
    <div class="text-center">
      <div class="spinner-border text-primary mb-3" role="status"></div>
      <h5 class="text-white">{{ loadingText }}</h5>
    </div>
  </loading>

  <AuthLayout
    :title="$t('users.create.title', { name: form.name ? `, ${form.name}` : '' })"
    :subtitle="$t('users.create.description')"
    max-width="520px"
  >

    <!-- Step progress -->
    <div class="step-progress mb-4">
      <div class="sp-step">
        <div class="sp-dot" :class="{ active: step === 1, done: step > 1 }">
          <font-awesome-icon v-if="step > 1" :icon="['fas', 'check']" />
          <span v-else>1</span>
        </div>
        <div class="sp-label">{{ $t('users.create.steps.identity') }}</div>
      </div>
      <div class="sp-line" :class="{ done: step > 1 }"></div>
      <div class="sp-step">
        <div class="sp-dot" :class="{ active: step === 2, done: step > 2 }">
          <font-awesome-icon v-if="step > 2" :icon="['fas', 'check']" />
          <span v-else>2</span>
        </div>
        <div class="sp-label">{{ $t('users.create.steps.contact') }}</div>
      </div>
      <div class="sp-line" :class="{ done: step > 2 }"></div>
      <div class="sp-step">
        <div class="sp-dot" :class="{ active: step === 3 }">
          <span>3</span>
        </div>
        <div class="sp-label">{{ $t('users.create.steps.credentials') }}</div>
      </div>
    </div>

    <!-- Tip -->
    <div class="tip-alert rounded-3 d-flex align-items-center gap-2 px-3 py-2 mb-3 small">
      <font-awesome-icon :icon="['fas', 'circle-info']" class="flex-shrink-0 text-primary" />
      <span>{{ $t(`users.create.tips.step${step}`) }}</span>
    </div>

    <!-- Card -->
    <div class="card ehub-card">
      <div class="card-body p-4">

        <div v-if="serverErrors.length" class="alert alert-danger py-2 small mb-3">
          <ul v-if="serverErrors.length > 1" class="mb-0 ps-3">
            <li v-for="(err, i) in serverErrors" :key="i">{{ err }}</li>
          </ul>
          <span v-else>{{ serverErrors[0] }}</span>
        </div>

        <!-- Step 1: Identidade -->
        <div v-if="step === 1">
          <div class="d-flex flex-column flex-sm-row align-items-center align-items-sm-center gap-4 mb-2">
            <AvatarUpload
              v-model="form.image"
              :buttonLabel="$t('users.create.form.image.upload')"
              :dropLabel="$t('users.create.form.image.drop')"
            />
            <div class="flex-grow-1 min-w-0 w-100">
              <ehubInput v-model="form.name" id="reg-name" type="text"
                :label="$t('users.create.form.name.label')"
                :placeholder="$t('users.create.form.name.placeholder')"
                :validation="{ ...inputValidation['user-name'], i18nPath: 'users.create.form.name.validation' }"
                :ref="collectRef" />
              <ehubInput v-model="form.surname" id="reg-surname" type="text"
                :label="$t('users.create.form.surname.label')"
                :placeholder="$t('users.create.form.surname.placeholder')"
                :validation="{ ...inputValidation['user-surname'], i18nPath: 'users.create.form.surname.validation' }"
                :ref="collectRef" />
            </div>
          </div>
        </div>

        <!-- Step 2: Contato -->
        <div v-if="step === 2">
          <EmailVerify
            v-model="form.mail"
            :label="$t('users.create.form.mail.label')"
            :placeholder="$t('users.create.form.mail.label')"
            @verified="mailVerified = true"
          />
          <PhoneInput
            v-model="form.phone"
            :label="$t('users.create.form.phone.label')"
            :placeholder="$t('users.create.form.phone.placeholder')"
          />
          <ehubInput v-model="form.username" id="reg-username" type="text"
            :icon="['fas', 'at']"
            :label="$t('users.create.form.username.label')"
            :placeholder="$t('users.create.form.username.label')"
            :validation="{ ...inputValidation['user-username'], i18nPath: 'users.create.form.username.validation' }"
            :ref="collectRef" />
        </div>

        <!-- Step 3: Credenciais -->
        <div v-if="step === 3">
          <ehubInput v-model="form.password" id="reg-password" type="password"
            :icon="['fas', 'lock']"
            :label="$t('users.create.form.password.label')"
            :placeholder="$t('users.create.form.password.label')"
            :validation="{ ...inputValidation['user-password'], i18nPath: 'users.create.form.password.validation' }"
            :ref="collectRef" />
          <ehubInput v-model="form.password_confirm" id="reg-password-confirm" type="password"
            :icon="['fas', 'lock']"
            :label="$t('users.create.form.password-confirm.label')"
            :placeholder="$t('users.create.form.password-confirm.label')"
            :validation="{ ...inputValidation['user-password-confirm'], i18nPath: 'users.create.form.password-confirm.validation' }"
            :ref="collectRef" />
        </div>

        <!-- Navigation -->
        <div class="d-flex justify-content-between mt-3 gap-2">
          <button v-if="step > 1" class="btn btn-outline-secondary round px-4" @click="prevStep">
            <font-awesome-icon :icon="['fas', 'arrow-left']" class="me-2" />
            {{ $t('users.create.steps.back') }}
          </button>
          <div v-else></div>

          <button v-if="step < STEPS" class="btn btn-primary round px-4 ms-auto" @click="nextStep">
            {{ $t('users.create.steps.next') }}
            <font-awesome-icon :icon="['fas', 'arrow-right']" class="ms-2" />
          </button>
          <button v-else class="btn btn-primary round px-4 ms-auto" @click="submit">
            <font-awesome-icon :icon="['fas', 'check']" class="me-2" />
            {{ $t('users.create.form.submit') }}
          </button>
        </div>

      </div>
    </div>

    <!-- Switch to login -->
    <p class="text-center text-muted small mt-3 mb-0">
      {{ $t('users.create.has_account') }}
      <router-link to="/login" class="fw-semibold">{{ $t('users.create.login_link') }}</router-link>
    </p>

  </AuthLayout>
</template>

<style scoped>
.min-w-0 { min-width: 0; }
</style>
