<script setup>
import { ref, computed, watch, onMounted, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import Api from '@/helpers/communication/Connection.js'
import ehubInput from '@/components/inputs/ehub-input.vue'
import EhubDialog from '@/components/modals/EhubDialog.vue'
import { toast } from '@/helpers/toast.js'

const props = defineProps({
  form: { type: Object, required: true },
})

const { t, te } = useI18n()

const loading = ref(false)
const loadError = ref('')
const schemaDate = ref(null)
const advancedForm = ref({ form: [[]], data: [[]] })
const advancedRefs = useTemplateRef('advancedRef')

function hydrateRegex(obj) {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(hydrateRegex)
  const r = {}
  for (const k in obj) {
    if (k === 'regex' && typeof obj[k] === 'string') {
      try { r[k] = new RegExp(obj[k]) } catch { r[k] = /[\s\S]*/ }
    } else {
      r[k] = hydrateRegex(obj[k])
    }
  }
  return r
}

function containerClass(sizes, offsets) {
  const c = []
  if (sizes) Object.entries(sizes).forEach(([k, v]) => c.push(k === 'xs' ? `col-${v}` : `col-${k}-${v}`))
  if (offsets) Object.entries(offsets).forEach(([k, v]) => c.push(k === 'xs' ? `offset-${v}` : `offset-${k}-${v}`))
  return c.join(' ')
}

function extractValues() {
  const values = {}
  ;(advancedForm.value.data ?? []).forEach(page => {
    (page ?? []).forEach(container => {
      (container.inputs ?? []).forEach(input => {
        if (input.name && input.eventValue !== undefined) values[input.name] = input.eventValue
      })
    })
  })
  return values
}

async function loadForm() {
  if (!props.form.category || !props.form.runmode) return
  loading.value = true
  loadError.value = ''
  const sub = props.form.subcategory ? `?subcategory=${props.form.subcategory}` : ''
  const result = await Api.getAsync(`/category/${props.form.category}/event-form/${props.form.runmode}${sub}`)
  loading.value = false
  if (result.code !== 200) {
    loadError.value = t('pages.organization.manage.eventWizard.s3x.title')
    return
  }
  const { advanced, schema_id, schema_updated_at } = result.response.message
  props.form.form_schema_id = schema_id ?? null
  schemaDate.value = schema_updated_at ?? null
  const hydrated = hydrateRegex(advanced)
  const data = [...(hydrated.form ?? [])]

  const saved = props.form.event_data || {}
  data.forEach(page => (page ?? []).forEach(container => (container.inputs ?? []).forEach(input => {
    if (input.name && saved[input.name] !== undefined) input.eventValue = saved[input.name]
  })))

  advancedForm.value = { ...hydrated, data }
}

onMounted(loadForm)
watch(() => [props.form.category, props.form.subcategory, props.form.runmode], loadForm)
watch(advancedForm, () => { props.form.event_data = extractValues() }, { deep: true })

// Fallback when a category form has no translation: "consume-percent" → "Consume percent".
function humanize(name) {
  const s = String(name || '').replace(/[-_]+/g, ' ').trim()
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ── Suggestions for missing fields (sent to the eHub team) ──
const suggestOpen = ref(false)
const suggestText = ref('')
const suggestSending = ref(false)
async function sendSuggestion() {
  const message = suggestText.value.trim()
  if (message.length < 5 || suggestSending.value) return
  suggestSending.value = true
  const res = await Api.postAsync('/suggestions', {
    type: 'event_form',
    message,
    context: { category: props.form.category, runmode: props.form.runmode, subcategory: props.form.subcategory || null },
  })
  suggestSending.value = false
  if (res.code === 201) {
    toast.success(t('pages.organization.manage.eventWizard.s3x.suggest.sent'))
    suggestText.value = ''
    suggestOpen.value = false
  } else {
    toast.error(t('pages.organization.manage.eventWizard.s3x.suggest.error'))
  }
}

// Sections made only of inputs render as a 2-column grid (titles stay full width).
const isFieldGroup = (container) => (container.inputs ?? []).every((i) => !['title', 'description', 'separator'].includes(i.type)) && (container.inputs ?? []).length > 1

const i18nPath = computed(() => `categories.${props.form.category}.${props.form.runmode}.form`)
</script>

<template>
  <div>
    <h2 class="step-title">{{ $t('pages.organization.manage.eventWizard.s3x.title') }}</h2>
    <p class="step-sub">{{ $t('pages.organization.manage.eventWizard.s3x.sub') }}</p>

    <div class="spec-notice">
      <font-awesome-icon :icon="['fas', 'circle-info']" class="spec-notice-ico" />
      <div class="spec-notice-body">
        <b>{{ $t('pages.organization.manage.eventWizard.s3x.notice.title') }}</b>
        <span>{{ $t('pages.organization.manage.eventWizard.s3x.notice.text') }}</span>
      </div>
      <button type="button" class="btn btn-sm btn-outline-secondary round px-3" @click="suggestOpen = true">
        <font-awesome-icon :icon="['fas', 'lightbulb']" class="me-2" />{{ $t('pages.organization.manage.eventWizard.s3x.suggest.btn') }}
      </button>
    </div>

    <EhubDialog v-model="suggestOpen" :title="$t('pages.organization.manage.eventWizard.s3x.suggest.title')" icon="lightbulb" tone="primary" centered size="sm">
      <p class="spec-sug-text">{{ $t('pages.organization.manage.eventWizard.s3x.suggest.text') }}</p>
      <textarea v-model="suggestText" class="form-control" rows="4" maxlength="2000" style="resize:vertical;text-align:left"
        :placeholder="$t('pages.organization.manage.eventWizard.s3x.suggest.ph')"></textarea>
      <template #footer>
        <button class="btn btn-outline-secondary round" @click="suggestOpen = false">{{ $t('pages.organization.manage.eventWizard.btn.cancel') }}</button>
        <button class="btn btn-primary round" :disabled="suggestText.trim().length < 5 || suggestSending" @click="sendSuggestion">
          <span v-if="suggestSending" class="spinner-border spinner-border-sm me-2"></span>{{ $t('pages.organization.manage.eventWizard.s3x.suggest.send') }}
        </button>
      </template>
    </EhubDialog>

    <div v-if="schemaDate" class="last-upd-bar">
      <font-awesome-icon :icon="['far', 'clock']" />
      <span class="last-upd-label">{{ $t('pages.organization.manage.eventWizard.s3x.lastUpd') }}</span>
      <span>{{ $d(schemaDate, 'dateOnly') }}</span>
    </div>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else-if="!advancedForm.data?.[0]?.length" class="empty-friendly">
      <font-awesome-icon :icon="['fas', 'circle-check']" />
      <div>
        <strong>{{ $t('pages.organization.manage.eventWizard.s3x.noneTitle') }}</strong>
        <p>{{ $t('pages.organization.manage.eventWizard.s3x.noneText') }}</p>
      </div>
    </div>

    <template v-else>
      <div v-for="(page, pi) in advancedForm.data" :key="pi" class="row text-start mb-4">
        <template v-for="(container, ci) in page" :key="ci">
          <div class="w-100 mb-3" v-if="container.independentRow"></div>
          <div :class="[containerClass(container.sizes, container.offsets), { 'spec-grid': isFieldGroup(container) }]">
            <template v-for="(input, ii) in container.inputs" :key="ii">
              <h3 class="spec-title" v-if="input.type === 'title'">
                {{ te(`${i18nPath}.${input.name}.title`) ? $t(`${i18nPath}.${input.name}.title`) : humanize(input.name) }}
              </h3>
              <p class="spec-desc" v-else-if="input.type === 'description'">
                {{ te(`${i18nPath}.${input.name}.description`) ? $t(`${i18nPath}.${input.name}.description`) : '' }}
              </p>
              <hr class="mt-0 mb-3" v-else-if="input.type === 'separator'" />

              <div v-else class="spec-field">
                <label class="field-label">
                  {{ te(`${i18nPath}.${input.name}.label`) ? $t(`${i18nPath}.${input.name}.label`) : humanize(input.name) }}
                </label>

                <ehubInput v-if="input.type === 'list'" class="w-100 mb-3"
                  :name="input.name"
                  :option="{ ...input.inputValue, i18nPath: `${i18nPath}.${input.name}.values` }"
                  type="select" v-model="input.eventValue"
                  :validation="{ ...input.validate, i18nPath: `${i18nPath}.${input.name}.validation` }"
                  ref="advancedRef" />

                <ehubInput v-else-if="['text','number','textarea'].includes(input.type)" class="w-100 mb-3"
                  :name="input.name" :type="input.type" v-model="input.eventValue"
                  :validation="{ ...input.validate, i18nPath: `${i18nPath}.${input.name}.validation` }"
                  ref="advancedRef" />

                <ehubInput v-else-if="input.type === 'switch'" class="w-100 mb-3"
                  :name="input.name" type="switch"
                  :checkedLabel="te(`${i18nPath}.${input.name}.checked`) ? $t(`${i18nPath}.${input.name}.checked`) : $t('pages.organization.manage.eventWizard.s3x.yes')"
                  :uncheckedLabel="te(`${i18nPath}.${input.name}.unchecked`) ? $t(`${i18nPath}.${input.name}.unchecked`) : $t('pages.organization.manage.eventWizard.s3x.no')"
                  v-model="input.eventValue" ref="advancedRef" />

                <ehubInput v-else-if="input.type === 'checkbox'" class="w-100 mb-3"
                  :name="input.name" type="checkbox"
                  :label="te(`${i18nPath}.${input.name}.label`) ? $t(`${i18nPath}.${input.name}.label`) : input.name"
                  v-model="input.eventValue" ref="advancedRef" />
              </div>
            </template>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<style scoped>
.spec-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 20px; flex: 0 0 100%; max-width: 100%; }
@media (max-width: 700px) { .spec-grid { grid-template-columns: minmax(0, 1fr); } }
.spec-notice { display: flex; align-items: center; gap: 12px; padding: 12px 16px; margin-bottom: 18px; border: 1px solid var(--ehub-primary-border, var(--ehub-line)); border-radius: 12px; background: var(--ehub-primary-tint); flex-wrap: wrap; }
.spec-notice-ico { color: var(--ehub-primary); flex-shrink: 0; }
.spec-notice-body { flex: 1; min-width: 220px; font-size: .82rem; color: var(--ehub-ink); line-height: 1.45; }
.spec-notice-body b { display: block; }
.spec-notice-body span { color: var(--ehub-muted); }
.spec-sug-text { font-size: .86rem; color: var(--ehub-muted); margin: 0 auto 14px; max-width: 340px; }
.spec-title { font-size: .95rem; font-weight: 700; color: var(--ehub-ink); margin: 8px 0 2px; }
.spec-desc { font-size: .8rem; color: var(--ehub-muted); margin: 0 0 8px; }
.step-title { font-size: 1.3rem; font-weight: 800; color: var(--ehub-ink); margin: 0 0 4px; letter-spacing: -.02em; }
.step-sub { font-size: .88rem; color: var(--ehub-muted); margin: 0 0 28px; }
.last-upd-bar { display: flex; align-items: center; gap: 8px; padding: 9px 14px; background: var(--ehub-field-bg); border: 1px solid var(--ehub-line); border-radius: 9px; margin-bottom: 22px; font-size: .82rem; color: var(--ehub-muted); }
.last-upd-bar svg { color: var(--ehub-primary); }
.field-label { font-size: .85rem; font-weight: 600; color: var(--ehub-ink); }
.empty-friendly { display: flex; gap: 12px; align-items: flex-start; background: color-mix(in srgb, #1f8a5b 10%, transparent); border: 1px solid color-mix(in srgb, #1f8a5b 30%, transparent); border-radius: 12px; padding: 14px 16px; }
.empty-friendly > svg { color: #1f8a5b; font-size: 1.1rem; margin-top: 2px; }
.empty-friendly strong { display: block; font-size: .9rem; color: var(--ehub-ink); }
.empty-friendly p { margin: 2px 0 0; font-size: .82rem; color: var(--ehub-muted); }
.empty-hint { color: var(--ehub-muted); font-size: .88rem; padding: 20px 0; }
</style>
