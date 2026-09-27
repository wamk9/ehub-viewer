<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Organization from '@/helpers/communication/Organization.js'
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js'
import OrganizationEventStage from '@/helpers/communication/OrganizationEventStage.js'
import { toast } from '@/helpers/toast.js'
import { categoryGradient } from '@/helpers/General/CategoryConfig.js'
import SystemVars from '@/helpers/General/SystemVars'
import { createWizardForm, buildEventPayload, populateFormFromEvent, diffPayload, slugify } from './create-wizard/wizardState.js'
import WizardSidebar from './create-wizard/WizardSidebar.vue'
import StepBasic from './create-wizard/steps/StepBasic.vue'
import StepCategoryFormat from './create-wizard/steps/StepCategoryFormat.vue'
import StepSpecific from './create-wizard/steps/StepSpecific.vue'
import StepFormBuilder from './create-wizard/steps/StepFormBuilder.vue'
import StepParticipants from './create-wizard/steps/StepParticipants.vue'
import StepSchedule from './create-wizard/steps/StepSchedule.vue'
import StepRules from './create-wizard/steps/StepRules.vue'
import StepSeo from './create-wizard/steps/StepSeo.vue'
import StepReview from './create-wizard/steps/StepReview.vue'

const props = defineProps({
  forceOption: { type: Object, default: () => ({}) },
  show: { type: Boolean, default: false },
})

const route = useRoute()
const router = useRouter()
const { t, te, tm } = useI18n()

const form = createWizardForm()
const currentStep = ref(1)
const publishing = ref(false)
const loadingEvent = ref(false)
const isEditMode = computed(() => !!route.params.eventRoute)
// Snapshot of the payload right after loading, used to send only changed fields.
let initialPayload = null
// Publication state when the event was loaded; "Save" in edit mode keeps it.
const loadedPublication = ref(null)

const STEP_COMPONENTS = [
  StepBasic, StepCategoryFormat, StepSpecific, StepFormBuilder, StepParticipants,
  StepSchedule, StepRules, StepSeo, StepReview,
]
const TOTAL_STEPS = STEP_COMPONENTS.length

const steps = computed(() => tm('pages.organization.manage.eventWizard.steps') ?? [])
const activeComponent = computed(() => STEP_COMPONENTS[currentStep.value - 1])

const org = ref({ name: '', color: '' })
const orgGrad = computed(() => org.value.color
  ? `linear-gradient(135deg, ${org.value.color}, ${org.value.color})`
  : categoryGradient(form.category))

onMounted(async () => {
  const result = await Organization.show(route.params.orgRoute)
  if (result.code === 200) org.value = result.data

  if (isEditMode.value) {
    loadingEvent.value = true
    const eventResult = await OrganizationEvent.show(route.params.orgRoute, route.params.eventRoute)
    loadingEvent.value = false
    if (eventResult.code === 200) {
      populateFormFromEvent(form, eventResult.data, SystemVars.baseUrl)
      initialPayload = buildEventPayload(form)
      loadedPublication.value = form.publication
      // Deep link to a step, e.g. ?step=7 opens "Regulamento".
      const step = parseInt(route.query.step, 10)
      if (step >= 1 && step <= TOTAL_STEPS) currentStep.value = step
    } else {
      toast.error(t('pages.organization.manage.eventWizard.err.slug'))
      goToEventsList()
    }
  }
})

watch(() => form.name, (val) => {
  if (!form.route_manually_edited) form.route = slugify(val)
})

// ── Step validation (mirrors the mockup's per-step guards) ─────────────
function validateStep(n) {
  if (n === 1 && !form.name.trim()) {
    toast.error(t('pages.organization.manage.eventWizard.err.name'))
    return false
  }
  if (n === 2 && (!form.category || !form.format)) {
    toast.error(t('pages.organization.manage.eventWizard.err.' + (!form.category ? 'cat' : 'fmt')))
    return false
  }
  if (n === 7 && !(form.rules || '').trim()) {
    toast.error(t('pages.organization.manage.eventWizard.err.rules'))
    return false
  }
  if (n === 6 && !form.start_at) {
    toast.error(t('pages.organization.manage.eventWizard.err.start'))
    return false
  }
  if (n === 8 && !form.route.trim()) {
    toast.error(t('pages.organization.manage.eventWizard.err.slug'))
    return false
  }
  return true
}

function goNext() {
  if (!validateStep(currentStep.value)) return
  if (currentStep.value >= TOTAL_STEPS) return
  currentStep.value++
}
function goBack() {
  if (currentStep.value > 1) currentStep.value--
}
function goToStep(n) {
  if (n < currentStep.value) currentStep.value = n
}

function goToEventsList(eventRoute = route.params.eventRoute) {
  // Opened from the event manage screen → go back there.
  if (route.query.return === 'manage' && eventRoute) {
    router.push({ name: 'manage-event', params: { orgRoute: route.params.orgRoute, eventRoute } })
    return
  }
  router.push({ name: 'manage-organization-events', params: { orgRoute: route.params.orgRoute } })
}

async function saveCreate(payload) {
  const result = await OrganizationEvent.store(route.params.orgRoute, payload)
  if (!result.created) {
    toast.error(result.message ?? t('pages.organization.manage.eventWizard.err.slug'))
    return false
  }
  return true
}

async function saveEdit(payload) {
  const changed = initialPayload ? diffPayload(initialPayload, payload) : payload
  if (!Object.keys(changed).length) return true
  const result = await OrganizationEvent.update(route.params.orgRoute, route.params.eventRoute, changed)
  if (result.code !== 200) {
    const key = 'pages.event.manage.err.' + result.data
    toast.error(te(key) ? t(key) : (result.data?.message ?? t('pages.organization.manage.eventWizard.err.slug')))
    return false
  }
  return true
}

async function submit(publication) {
  form.publication = publication
  // Jumping between steps (deep links, sidebar) can skip checks: validate every step
  // and send the user to the first one with a problem.
  for (let n = 1; n <= TOTAL_STEPS; n++) {
    if (!validateStep(n)) { currentStep.value = n; return }
  }

  publishing.value = true
  const payload = buildEventPayload(form)

  const ok = isEditMode.value
    ? await saveEdit(payload)
    : await saveCreate(payload)

  if (!ok) { publishing.value = false; return }

  for (const stage of form.stages) {
    if (stage._persisted) {
      const i = stage._initial
      if (i && i.name === stage.name && i.start_at === (stage.start_at || '') && i.config === JSON.stringify(stage.config || {})) continue
      await OrganizationEventStage.update(route.params.orgRoute, form.route, stage.route, {
        name: stage.name,
        start_at: stage.start_at || null,
        config: stage.config,
      })
    } else {
      await OrganizationEventStage.create(route.params.orgRoute, form.route, {
        name: stage.name,
        route: stage.route,
        stage_type: stage.stage_type,
        start_at: stage.start_at || null,
        config: stage.config,
      })
    }
  }

  publishing.value = false
  toast.success(t('pages.organization.manage.eventWizard.toast.' + (isEditMode.value ? 'updated' : 'created')))
  goToEventsList(form.route)
}
</script>

<template>
  <div v-if="show && loadingEvent" class="wiz-loading">
    <div class="spinner-border text-primary" role="status"></div>
  </div>

  <div v-else-if="show" class="wiz-wrap">

    <WizardSidebar
      :steps="steps"
      :model-value="currentStep"
      :org-name="org.name"
      :org-grad="orgGrad"
      :edit-mode="isEditMode"
      @update:model-value="goToStep"
    />

    <div class="wiz-main">
      <div class="wiz-content">
        <component
          :is="activeComponent"
          :form="form"
          :org="org"
        />
      </div>

      <div class="wiz-actions">
        <button class="btn btn-ghost round px-3" @click="goToEventsList()">
          {{ $t('pages.organization.manage.eventWizard.btn.cancel') }}
        </button>
        <button v-if="currentStep > 1" class="btn btn-outline-secondary round px-4" @click="goBack">
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="me-2" />{{ $t('pages.organization.manage.eventWizard.btn.back') }}
        </button>
        <div class="flex-grow-1"></div>
        <button v-if="currentStep < 9 && isEditMode && loadedPublication === 'published'" class="btn btn-outline-secondary round px-4" @click="submit('published')" :disabled="publishing">
          {{ $t('pages.organization.manage.eventWizard.btn.save') }}
        </button>
        <button v-else-if="currentStep < 9" class="btn btn-outline-secondary round px-4" @click="submit('draft')" :disabled="publishing">
          {{ $t('pages.organization.manage.eventWizard.btn.saveDraft') }}
        </button>
        <button v-if="currentStep < 9" class="btn btn-primary round px-4" @click="goNext">
          {{ $t('pages.organization.manage.eventWizard.btn.next') }}<font-awesome-icon :icon="['fas', 'arrow-right']" class="ms-2" />
        </button>
        <button v-else class="btn btn-primary round px-4" :disabled="publishing" @click="submit(form.publication)">
          <span v-if="publishing" class="spinner-border spinner-border-sm me-2"></span>
          {{ $t('pages.organization.manage.eventWizard.btn.' + (isEditMode ? 'saveChanges' : 'create')) }}
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.wiz-loading { display: flex; align-items: center; justify-content: center; min-height: calc(100vh - 60px); }
.wiz-wrap { display: grid; grid-template-columns: 256px 1fr; min-height: calc(100vh - 60px); }
.wiz-main { display: flex; flex-direction: column; min-height: calc(100vh - 60px); }
.wiz-content { flex: 1; padding: 36px 44px; }
.wiz-actions { position: sticky; bottom: 0; background: color-mix(in srgb, var(--ehub-card) 92%, transparent); backdrop-filter: blur(14px); border-top: 1px solid var(--ehub-line); padding: 14px 44px; display: flex; align-items: center; gap: 10px; }

@media (max-width: 860px) {
  .wiz-wrap { grid-template-columns: 1fr; }
  .wiz-content { padding: 20px 16px; }
  .wiz-actions { padding: 12px 16px; flex-wrap: wrap; }
}
</style>
