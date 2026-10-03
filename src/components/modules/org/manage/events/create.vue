<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Organization from '@/helpers/communication/Organization.js'
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js'
import OrganizationEventStage from '@/helpers/communication/OrganizationEventStage.js'
import { toast } from '@/helpers/toast.js'
import { categoryGradient } from '@/helpers/General/CategoryConfig.js'
import SystemVars from '@/helpers/General/SystemVars'
import { createWizardForm, buildEventPayload, populateFormFromEvent, diffPayload, slugify, DESCRIPTION_MAX } from './create-wizard/wizardState.js'
import { htmlToText } from '@/helpers/General/sanitizeHtml.js'
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
      // Opened at a given step (e.g. 7 = "Regulamento"): passed in history state, not the URL.
      const step = parseInt(window.history.state?.step, 10)
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

// ── Local autosave (new events only) ───────────────────────────────────
// Progress survives a refresh or a closed tab; images are left out (too big).
const DRAFT_KEY = computed(() => 'ehub_event_draft_' + route.params.orgRoute)
const DRAFT_SKIP = ['logo_image', 'cover_image']
const savedDraft = ref(null)
let saveTimer = null
let submitted = false

function readDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY.value) || 'null') } catch (e) { return null }
}
function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY.value) } catch (e) { /* storage unavailable */ }
}
function hasProgress() {
  return !isEditMode.value && !submitted && !!String(form.name || '').trim()
}
function writeDraft() {
  if (!hasProgress()) return
  const data = {}
  for (const [k, v] of Object.entries(form)) if (!DRAFT_SKIP.includes(k)) data[k] = v
  try { localStorage.setItem(DRAFT_KEY.value, JSON.stringify({ at: Date.now(), step: currentStep.value, data })) } catch (e) { /* quota */ }
}
watch([form, currentStep], () => {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(writeDraft, 600)
}, { deep: true })

function restoreDraft() {
  const d = savedDraft.value
  if (d?.data) {
    for (const [k, v] of Object.entries(d.data)) if (k in form) form[k] = v
    if (d.step >= 1 && d.step <= TOTAL_STEPS) currentStep.value = d.step
  }
  savedDraft.value = null
}
function discardDraft() {
  clearDraft()
  savedDraft.value = null
}
const savedDraftWhen = computed(() => savedDraft.value?.at
  ? new Date(savedDraft.value.at).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  : '')

function onBeforeUnload(e) {
  if (!hasProgress()) return
  writeDraft()
  e.preventDefault()
  e.returnValue = ''
}
onMounted(() => {
  window.addEventListener('beforeunload', onBeforeUnload)
  if (!isEditMode.value) {
    const d = readDraft()
    if (d?.data?.name) savedDraft.value = d
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', onBeforeUnload)
  clearTimeout(saveTimer)
  writeDraft()
})

// A new step starts at the top, whatever element is scrolling the page.
const wizRoot = ref(null)
watch(currentStep, async () => {
  await nextTick()
  let el = wizRoot.value?.parentElement
  while (el && el !== document.body) {
    const oy = getComputedStyle(el).overflowY
    if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight) el.scrollTop = 0
    el = el.parentElement
  }
  window.scrollTo({ top: 0 })
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
  if (n === 1 && htmlToText(form.description).length > DESCRIPTION_MAX) {
    toast.error(t('pages.organization.manage.eventWizard.err.descLong', { n: DESCRIPTION_MAX }))
    return false
  }
  if (n === 7 && !(form.rules || '').trim()) {
    toast.error(t('pages.organization.manage.eventWizard.err.rules'))
    return false
  }
  if (n === 2 && form.runmode === 'irl' && !String(form.location || '').trim()) {
    toast.error(t('pages.organization.manage.eventWizard.err.location'))
    return false
  }
  if (n === 6 && !form.start_at) {
    toast.error(t('pages.organization.manage.eventWizard.err.start'))
    return false
  }
  if (n === 6 && !form.start_time) {
    toast.error(t('pages.organization.manage.eventWizard.err.startTime'))
    return false
  }
  // Dates are YYYY-MM-DD strings, so plain comparison works.
  const today = new Date().toLocaleDateString('en-CA')
  if (n === 6 && !isEditMode.value && form.start_at < today) {
    toast.error(t('pages.organization.manage.eventWizard.err.startPast'))
    return false
  }
  if (n === 6 && form.registration_deadline && form.registration_deadline > form.start_at) {
    toast.error(t('pages.organization.manage.eventWizard.err.deadlineAfterStart'))
    return false
  }
  if (n === 6 && form.end_at && form.end_at < form.start_at) {
    toast.error(t('pages.organization.manage.eventWizard.err.endBeforeStart'))
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
  if (window.history.state?.returnTo === 'manage' && eventRoute) {
    router.push({ name: 'manage-event', params: { orgRoute: route.params.orgRoute, eventRoute } })
    return
  }
  router.push({ name: 'manage-organization-events', params: { orgRoute: route.params.orgRoute } })
}

async function saveCreate(payload) {
  const result = await OrganizationEvent.store(route.params.orgRoute, payload)
  if (!result.created) {
    const key = 'pages.event.manage.err.' + result.message
    toast.error(te(key) ? t(key) : (result.message ?? t('pages.organization.manage.eventWizard.err.slug')))
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
        start_at: stage.start_at ? String(stage.start_at).replace('T', ' ') + (String(stage.start_at).length === 16 ? ':00' : '') : null,
        config: stage.config,
      })
    } else {
      await OrganizationEventStage.create(route.params.orgRoute, form.route, {
        name: stage.name,
        route: stage.route,
        stage_type: stage.stage_type,
        start_at: stage.start_at ? String(stage.start_at).replace('T', ' ') + (String(stage.start_at).length === 16 ? ':00' : '') : null,
        config: stage.config,
      })
    }
  }

  publishing.value = false
  submitted = true
  clearDraft()
  toast.success(t('pages.organization.manage.eventWizard.toast.' + (isEditMode.value ? 'updated' : 'created')))
  goToEventsList(form.route)
}
</script>

<template>
  <div v-if="show && loadingEvent" class="wiz-loading">
    <div class="spinner-border text-primary" role="status"></div>
  </div>

  <div v-else-if="show" ref="wizRoot" class="wiz-wrap">

    <WizardSidebar
      :steps="steps"
      :model-value="currentStep"
      :org-name="org.name"
      :org-grad="orgGrad"
      :edit-mode="isEditMode"
      :event-name="form.name"
      :event-logo="form.logo_image || form._existing_logo_url"
      :event-color="form.color"
      @update:model-value="goToStep"
    />

    <div class="wiz-main">
      <div class="wiz-content">
        <div v-if="savedDraft" class="wiz-restore">
          <font-awesome-icon :icon="['fas', 'clock-rotate-left']" class="wiz-restore__ico" />
          <div class="wiz-restore__txt">
            <strong>{{ $t('pages.organization.manage.eventWizard.restore.title') }}</strong>
            <span>{{ $t('pages.organization.manage.eventWizard.restore.text', { name: savedDraft.data.name, when: savedDraftWhen }) }}</span>
          </div>
          <button class="btn btn-sm btn-primary round px-3" @click="restoreDraft">{{ $t('pages.organization.manage.eventWizard.restore.continue') }}</button>
          <button class="btn btn-sm btn-ghost round px-3" @click="discardDraft">{{ $t('pages.organization.manage.eventWizard.restore.discard') }}</button>
        </div>
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
/* Actions sit at the end of the content (not stuck to the viewport). */
.wiz-restore { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; background: var(--ehub-primary-tint); border: 1px solid color-mix(in srgb, var(--ehub-primary) 30%, transparent); border-radius: 12px; padding: 12px 14px; margin-bottom: 24px; }
.wiz-restore__ico { color: var(--ehub-primary-text); font-size: 1.1rem; }
.wiz-restore__txt { flex: 1; min-width: 200px; display: flex; flex-direction: column; font-size: .82rem; color: var(--ehub-muted); }
.wiz-restore__txt strong { color: var(--ehub-ink); font-size: .88rem; }
.wiz-actions { border-top: 1px solid var(--ehub-line); margin: 0 44px; padding: 18px 0 32px; display: flex; align-items: center; gap: 10px; }

@media (max-width: 860px) {
  .wiz-wrap { grid-template-columns: 1fr; }
  .wiz-content { padding: 20px 16px; }
  .wiz-actions { margin: 0 16px; padding: 14px 0 24px; flex-wrap: wrap; }
}
</style>
