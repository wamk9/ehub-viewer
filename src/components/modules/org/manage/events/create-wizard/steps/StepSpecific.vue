<script setup>
import { ref, computed, watch, onMounted, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import Api from '@/helpers/communication/Connection.js'
import ehubInput from '@/components/inputs/ehub-input.vue'

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
  advancedForm.value = { ...hydrated, data: [...(hydrated.form ?? [])] }
}

onMounted(loadForm)
watch(() => [props.form.category, props.form.subcategory, props.form.runmode], loadForm)
watch(advancedForm, () => { props.form.event_data = extractValues() }, { deep: true })

const i18nPath = computed(() => `categories.${props.form.category}.${props.form.runmode}.form`)
</script>

<template>
  <div>
    <h2 class="step-title">{{ $t('pages.organization.manage.eventWizard.s3x.title') }}</h2>
    <p class="step-sub">{{ $t('pages.organization.manage.eventWizard.s3x.sub') }}</p>

    <div v-if="schemaDate" class="last-upd-bar">
      <font-awesome-icon :icon="['far', 'clock']" />
      <span class="last-upd-label">{{ $t('pages.organization.manage.eventWizard.s3x.lastUpd') }}</span>
      <span>{{ $d(schemaDate, 'dateOnly') }}</span>
    </div>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else-if="!advancedForm.data?.[0]?.length" class="empty-hint">
      {{ $t('pages.organization.manage.eventWizard.s3x.sub') }}
    </div>

    <template v-else>
      <div v-for="(page, pi) in advancedForm.data" :key="pi" class="row text-start mb-4">
        <template v-for="(container, ci) in page" :key="ci">
          <div class="w-100 mb-3" v-if="container.independentRow"></div>
          <div :class="containerClass(container.sizes, container.offsets)">
            <template v-for="(input, ii) in container.inputs" :key="ii">
              <h2 class="display-6" v-if="input.type === 'title'">
                {{ te(`${i18nPath}.${input.name}.title`) ? $t(`${i18nPath}.${input.name}.title`) : input.name }}
              </h2>
              <p class="text-muted" v-else-if="input.type === 'description'">
                {{ te(`${i18nPath}.${input.name}.description`) ? $t(`${i18nPath}.${input.name}.description`) : '' }}
              </p>
              <hr class="mt-0 mb-3" v-else-if="input.type === 'separator'" />

              <template v-else>
                <label class="field-label">
                  {{ te(`${i18nPath}.${input.name}.label`) ? $t(`${i18nPath}.${input.name}.label`) : input.name }}
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
                  :checkedLabel="te(`${i18nPath}.${input.name}.checked`) ? $t(`${i18nPath}.${input.name}.checked`) : 'Sim'"
                  :uncheckedLabel="te(`${i18nPath}.${input.name}.unchecked`) ? $t(`${i18nPath}.${input.name}.unchecked`) : 'Não'"
                  v-model="input.eventValue" ref="advancedRef" />

                <ehubInput v-else-if="input.type === 'checkbox'" class="w-100 mb-3"
                  :name="input.name" type="checkbox"
                  :label="te(`${i18nPath}.${input.name}.label`) ? $t(`${i18nPath}.${input.name}.label`) : input.name"
                  v-model="input.eventValue" ref="advancedRef" />
              </template>
            </template>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<style scoped>
.step-title { font-size: 1.3rem; font-weight: 800; color: var(--ehub-ink); margin: 0 0 4px; letter-spacing: -.02em; }
.step-sub { font-size: .88rem; color: var(--ehub-muted); margin: 0 0 28px; }
.last-upd-bar { display: flex; align-items: center; gap: 8px; padding: 9px 14px; background: var(--ehub-field-bg); border: 1px solid var(--ehub-line); border-radius: 9px; margin-bottom: 22px; font-size: .82rem; color: var(--ehub-muted); }
.last-upd-bar svg { color: var(--ehub-primary); }
.field-label { font-size: .85rem; font-weight: 600; color: var(--ehub-ink); }
.empty-hint { color: var(--ehub-muted); font-size: .88rem; padding: 20px 0; }
</style>
