<script setup>
import { ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ehubInput    from '@/components/inputs/ehub-input.vue'
import AvatarUpload from '@/components/inputs/AvatarUpload.vue'
import PhoneInput   from '@/components/inputs/PhoneInput.vue'
import EmailVerify  from '@/components/inputs/EmailVerify.vue'
import StepProgress from '@/components/general/StepProgress.vue'
import Api          from '@/helpers/communication/Connection'
import store        from '@/store'
import inputValidation from '@/helpers/frontend/input-validation'
import { i18n } from '@/helpers/i18n'

const { t } = useI18n()
const router = useRouter()

// ─── Form ─────────────────────────────────────────────────────
const form = reactive({
  name: '', surname: '', mail: '', phone: '',
  username: '', password: '', password_confirm: '', image: '',
})
const mailVerified = ref(false)

const inputs = ref([])
function collectRef(el) {
  if (el && !inputs.value.includes(el)) inputs.value.push(el)
}

// ─── Steps ────────────────────────────────────────────────────
const step  = ref(1)
const STEPS = 3

const stepLabels = [
  t('users.create.steps.identity'),
  t('users.create.steps.contact'),
  t('users.create.steps.credentials'),
]

function nextStep() {
  if (step.value === 2 && !mailVerified.value) {
    return
  }
  const valid = inputs.value.every(el => el.forceValidate?.() !== false)
  if (!valid) return
  inputs.value = []
  if (step.value < STEPS) step.value++
}
function prevStep() {
  inputs.value = []
  if (step.value > 1) step.value--
}

// ─── Submit ───────────────────────────────────────────────────
const isLoading    = ref(false)
const loadingText  = ref('')
const serverErrors = ref([])

function parseServerErrors(response) {
  if (response?.errors && typeof response.errors === 'object') {
    return Object.values(response.errors)
      .flat()
      .map(key => i18n.t(key))
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
      store.dispatch('setToken', result.response.token)
      setTimeout(() => router.push('/'), 2000)
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
  <!-- Loading overlay -->
  <loading v-model:active="isLoading" :can-cancel="false"
    background-color="#000000" opacity="0.8" color="#dadada">
    <div class="text-center">
      <div class="spinner-border text-primary mb-3" role="status"></div>
      <h5 class="text-white">{{ loadingText }}</h5>
    </div>
  </loading>

  <main class="container py-5">

    <!-- Header -->
    <div class="row justify-content-center mb-4">
      <div class="col-12 col-md-8 text-center">
        <h1 class="display-5 fw-light mb-1">
          {{ i18n.t('users.create.title', { name: form.name ? `, ${form.name}` : '' }) }}
        </h1>
        <p class="text-muted">{{ i18n.t('users.create.description') }}</p>
      </div>
    </div>

    <!-- Step progress -->
    <div class="row justify-content-center mb-4">
      <div class="col-12 col-md-8">
        <StepProgress :steps="STEPS" :current="step" :labels="stepLabels" />
      </div>
    </div>

    <!-- Step tip alert -->
    <div class="row justify-content-center mb-3">
      <div class="col-12 col-md-8 col-lg-7">
        <div class="alert alert-primary d-flex align-items-center gap-2 mb-0 py-2" role="alert">
          <font-awesome-icon icon="circle-info" class="flex-shrink-0" />
          <span class="small">{{ $t(`users.create.tips.step${step}`) }}</span>
        </div>
      </div>
    </div>

    <!-- Card -->
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-7">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4 p-md-5">

            <div v-if="serverErrors.length" class="alert alert-danger py-2 small mb-3">
              <ul class="mb-0 ps-3" v-if="serverErrors.length > 1">
                <li v-for="(err, i) in serverErrors" :key="i">{{ err }}</li>
              </ul>
              <span v-else>{{ serverErrors[0] }}</span>
            </div>

            <!-- ── Step 1: Identidade ── -->
            <div v-if="step === 1">
              <div class="d-flex flex-column flex-md-row align-items-start gap-4">
                <AvatarUpload
                  v-model="form.image"
                  :buttonLabel="i18n.t('users.create.form.image.upload')"
                  :dropLabel="i18n.t('users.create.form.image.drop')"
                />
                <div class="flex-grow-1 min-w-0">
                  <ehubInput v-model="form.name" id="reg-name" type="text"
                    :label="i18n.t('users.create.form.name.label')" :placeholder="''"
                    :validation="{ ...inputValidation['user-name'], i18nPath: 'users.create.form.name.validation' }"
                    :ref="collectRef" />
                  <ehubInput v-model="form.surname" id="reg-surname" type="text"
                    :label="i18n.t('users.create.form.surname.label')" :placeholder="''"
                    :validation="{ ...inputValidation['user-surname'], i18nPath: 'users.create.form.surname.validation' }"
                    :ref="collectRef" />
                </div>
              </div>
            </div>

            <!-- ── Step 2: Contato ── -->
            <div v-if="step === 2">
              <EmailVerify
                v-model="form.mail"
                :label="i18n.t('users.create.form.mail.label')"
                :placeholder="i18n.t('users.create.form.mail.label')"
                @verified="mailVerified = true"
              />
              <PhoneInput
                v-model="form.phone"
                :label="i18n.t('users.create.form.phone.label')"
                :placeholder="i18n.t('users.create.form.phone.placeholder')"
              />
              <ehubInput v-model="form.username" id="reg-username" type="text"
                :label="i18n.t('users.create.form.username.label')"
                :placeholder="i18n.t('users.create.form.username.label')"
                :validation="{ ...inputValidation['user-username'], i18nPath: 'users.create.form.username.validation' }"
                :ref="collectRef" />
            </div>

            <!-- ── Step 3: Credenciais ── -->
            <div v-if="step === 3">
              <ehubInput v-model="form.password" id="reg-password" type="password"
                :label="i18n.t('users.create.form.password.label')"
                :placeholder="i18n.t('users.create.form.password.label')"
                :validation="{ ...inputValidation['user-password'], i18nPath: 'users.create.form.password.validation' }"
                :ref="collectRef" />
              <ehubInput v-model="form.password_confirm" id="reg-password-confirm" type="password"
                :label="i18n.t('users.create.form.password-confirm.label')"
                :placeholder="i18n.t('users.create.form.password-confirm.label')"
                :validation="{ ...inputValidation['user-password-confirm'], i18nPath: 'users.create.form.password-confirm.validation' }"
                :ref="collectRef" />
            </div>

            <!-- ── Navigation ── -->
            <div class="d-flex justify-content-between mt-4 gap-2">
              <button v-if="step > 1" class="btn btn-outline-secondary px-4" @click="prevStep">
                <font-awesome-icon icon="arrow-left" class="me-2" />
                {{ $t('users.create.steps.back') }}
              </button>
              <div v-else></div>

              <button v-if="step < STEPS" class="btn btn-primary px-4 ms-auto" @click="nextStep">
                {{ $t('users.create.steps.next') }}
                <font-awesome-icon icon="arrow-right" class="ms-2" />
              </button>
              <button v-else class="btn btn-success px-4 ms-auto" @click="submit">
                <font-awesome-icon icon="check" class="me-2" />
                {{ i18n.t('users.create.form.submit') }}
              </button>
            </div>

          </div>
        </div>

        <p class="text-center text-muted small mt-3">
          {{ $t('users.create.has_account') }}
          <router-link to="/login">{{ $t('users.create.login_link') }}</router-link>
        </p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.min-w-0 { min-width: 0; }

:deep(input[placeholder=""]) {
  padding-top: 0.375rem !important;
  padding-bottom: 0.375rem !important;
}
</style>
