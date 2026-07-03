<script setup>
import { ref } from 'vue'
import { slugify } from '../wizardState.js'
import IconPickerModal from '../IconPickerModal.vue'

const props = defineProps({
  form: { type: Object, required: true },
})

const REG_TYPES = ['text', 'number', 'select', 'color', 'date', 'checkbox', 'url']
const REG_TYPE_ICON = { text: 'font', number: 'hashtag', select: 'list-ul', color: 'palette', date: 'calendar-days', checkbox: 'toggle-on', url: 'link' }

// ── generic key/icon field lists (event_fields / stage_fields) ─────────
const evtName = ref('')
const evtIcon = ref('list')
const stgName = ref('')
const stgIcon = ref('road')
const iconPickerFor = ref(null) // 'evt' | 'stg' | 'reg' | null

function addSimpleField(list, name, icon) {
  if (!name.trim()) return
  list.push({ key: slugify(name), name: name.trim(), icon })
}
function addEvtField() { addSimpleField(props.form.event_fields, evtName.value, evtIcon.value); evtName.value = ''; evtIcon.value = 'list' }
function addStgField() { addSimpleField(props.form.stage_fields, stgName.value, stgIcon.value); stgName.value = ''; stgIcon.value = 'road' }
function removeField(list, i) { list.splice(i, 1) }

// ── registration field builder ──────────────────────────────────────────
const regName = ref('')
const regIcon = ref('user')
const regType = ref('text')
const regOptions = ref('')
const regMin = ref('')
const regMax = ref('')
const regColors = ref('')

function addRegField() {
  if (!regName.value.trim()) return
  const field = {
    type: regType.value,
    name: slugify(regName.value),
    label: regName.value.trim(),
    icon: regIcon.value,
    required: false,
    values: regType.value === 'select'
      ? regOptions.value.split(',').map(v => v.trim()).filter(Boolean)
      : regType.value === 'color'
        ? regColors.value.split(',').map(v => v.trim()).filter(Boolean)
        : [],
  }
  if (regType.value === 'number' && (regMin.value || regMax.value)) {
    field.min = regMin.value ? +regMin.value : null
    field.max = regMax.value ? +regMax.value : null
  }
  props.form.registration_form_template.push(field)
  regName.value = ''; regIcon.value = 'user'; regType.value = 'text'
  regOptions.value = ''; regMin.value = ''; regMax.value = ''; regColors.value = ''
}
function toggleRequired(field) { field.required = !field.required }

function openIconPicker(scope) { iconPickerFor.value = scope }
function onIconPicked(icon) {
  if (iconPickerFor.value === 'evt') evtIcon.value = icon
  if (iconPickerFor.value === 'stg') stgIcon.value = icon
  if (iconPickerFor.value === 'reg') regIcon.value = icon
}
</script>

<template>
  <div>
    <h2 class="step-title">{{ $t('pages.organization.manage.eventWizard.s4x.title') }}</h2>
    <p class="step-sub">{{ $t('pages.organization.manage.eventWizard.s4x.sub') }}</p>

    <!-- Event fields -->
    <div class="form-section">
      <div class="form-section-label">{{ $t('pages.organization.manage.eventWizard.s4x.evtLabel') }}</div>
      <p class="field-hint mb-3">{{ $t('pages.organization.manage.eventWizard.s4x.evtHint') }}</p>
      <div class="field-list">
        <div v-for="(f, i) in form.event_fields" :key="i" class="evt-input-row">
          <div class="evt-input-label">
            <font-awesome-icon :icon="['fas', f.icon]" class="evt-inp-ico" />
            <span class="evt-inp-name">{{ f.name }}</span>
            <button class="evt-del-btn" @click="removeField(form.event_fields, i)"><font-awesome-icon :icon="['fas', 'xmark']" /></button>
          </div>
        </div>
        <div class="custom-field-row">
          <button type="button" class="icon-btn" @click="openIconPicker('evt')"><font-awesome-icon :icon="['fas', evtIcon]" /></button>
          <input type="text" class="form-control" v-model="evtName" :placeholder="$t('pages.organization.manage.eventWizard.s4x.customEvtPh')" @keydown.enter="addEvtField" />
          <button class="btn btn-outline-secondary round px-3" @click="addEvtField"><font-awesome-icon :icon="['fas', 'plus']" class="me-1" />{{ $t('pages.organization.manage.eventWizard.s4x.addField') }}</button>
        </div>
      </div>
    </div>

    <!-- Stage fields -->
    <div class="form-section">
      <div class="form-section-label">{{ $t('pages.organization.manage.eventWizard.s4x.stgLabel') }}</div>
      <p class="field-hint mb-3">{{ $t('pages.organization.manage.eventWizard.s4x.stgHint') }}</p>
      <div class="field-list">
        <div v-for="(f, i) in form.stage_fields" :key="i" class="evt-input-row">
          <div class="evt-input-label">
            <font-awesome-icon :icon="['fas', f.icon]" class="evt-inp-ico" />
            <span class="evt-inp-name">{{ f.name }}</span>
            <button class="evt-del-btn" @click="removeField(form.stage_fields, i)"><font-awesome-icon :icon="['fas', 'xmark']" /></button>
          </div>
        </div>
        <div class="custom-field-row">
          <button type="button" class="icon-btn" @click="openIconPicker('stg')"><font-awesome-icon :icon="['fas', stgIcon]" /></button>
          <input type="text" class="form-control" v-model="stgName" :placeholder="$t('pages.organization.manage.eventWizard.s4x.customStgPh')" @keydown.enter="addStgField" />
          <button class="btn btn-outline-secondary round px-3" @click="addStgField"><font-awesome-icon :icon="['fas', 'plus']" class="me-1" />{{ $t('pages.organization.manage.eventWizard.s4x.addField') }}</button>
        </div>
      </div>
    </div>

    <!-- Registration fields -->
    <div class="form-section">
      <div class="form-section-label">{{ $t('pages.organization.manage.eventWizard.s4x.regLabel') }}</div>
      <p class="field-hint mb-3">{{ $t('pages.organization.manage.eventWizard.s4x.regHint') }}</p>
      <div class="field-list">
        <div v-for="(f, i) in form.registration_form_template" :key="i" class="evt-input-row">
          <div class="evt-input-label">
            <font-awesome-icon :icon="['fas', f.icon || REG_TYPE_ICON[f.type]]" class="evt-inp-ico" />
            <span class="evt-inp-name">{{ f.label }}</span>
            <span class="field-type-chip"><font-awesome-icon :icon="['fas', REG_TYPE_ICON[f.type]]" />{{ f.type }}</span>
            <button
              type="button" class="req-chip" :class="f.required ? 'req' : 'opt'"
              @click="toggleRequired(f)"
            >{{ f.required ? $t('pages.organization.manage.eventWizard.s4x.required') : $t('pages.organization.manage.eventWizard.s4x.optional') }}</button>
            <button class="evt-del-btn" @click="removeField(form.registration_form_template, i)"><font-awesome-icon :icon="['fas', 'xmark']" /></button>
          </div>
        </div>

        <div class="creg-builder">
          <div class="creg-builder-title">{{ $t('pages.organization.manage.eventWizard.s4x.newCustomField') }}</div>
          <div class="creg-name-row">
            <button type="button" class="icon-btn" @click="openIconPicker('reg')"><font-awesome-icon :icon="['fas', regIcon]" /></button>
            <input type="text" class="form-control" v-model="regName" :placeholder="$t('pages.organization.manage.eventWizard.s4x.customRegPh')" @keydown.enter="addRegField" />
          </div>
          <div>
            <div class="creg-extra-label"><font-awesome-icon :icon="['fas', 'sliders']" />{{ $t('pages.organization.manage.eventWizard.s4x.answerType') }}</div>
            <div class="creg-type-grid">
              <button
                v-for="rt in REG_TYPES" :key="rt" type="button" class="creg-type-btn" :class="{ sel: regType === rt }"
                @click="regType = rt"
              ><font-awesome-icon :icon="['fas', REG_TYPE_ICON[rt]]" />{{ $t(`pages.organization.manage.eventWizard.s4x.type${rt.charAt(0).toUpperCase()}${rt.slice(1)}`) }}</button>
            </div>
          </div>
          <div v-if="regType === 'select'" class="creg-extra">
            <div class="creg-extra-label"><font-awesome-icon :icon="['fas', 'list-ul']" />{{ $t('pages.organization.manage.eventWizard.s4x.optsLabel') }}</div>
            <input type="text" class="form-control form-control-sm" v-model="regOptions" :placeholder="$t('pages.organization.manage.eventWizard.s4x.optsPh')" />
            <p class="field-hint" style="margin:2px 0 0">{{ $t('pages.organization.manage.eventWizard.s4x.optsHint') }}</p>
          </div>
          <div v-if="regType === 'number'" class="creg-extra">
            <div class="creg-extra-label"><font-awesome-icon :icon="['fas', 'sliders']" />{{ $t('pages.organization.manage.eventWizard.s4x.rangeLabel') }} <span style="font-weight:400;opacity:.7">{{ $t('pages.organization.manage.eventWizard.s4x.rangeOptional') }}</span></div>
            <div class="creg-num-row">
              <input type="number" class="form-control form-control-sm" v-model="regMin" :placeholder="$t('pages.organization.manage.eventWizard.s4x.min')" style="width:110px" />
              <span style="color:var(--ehub-muted);font-size:.82rem">{{ $t('pages.organization.manage.eventWizard.s4x.upTo') }}</span>
              <input type="number" class="form-control form-control-sm" v-model="regMax" :placeholder="$t('pages.organization.manage.eventWizard.s4x.max')" style="width:110px" />
            </div>
          </div>
          <div v-if="regType === 'color'" class="creg-extra">
            <div class="creg-extra-label"><font-awesome-icon :icon="['fas', 'palette']" />{{ $t('pages.organization.manage.eventWizard.s4x.colorsLabel') }} <span style="font-weight:400;opacity:.7">{{ $t('pages.organization.manage.eventWizard.s4x.rangeOptional') }}</span></div>
            <input type="text" class="form-control form-control-sm" v-model="regColors" :placeholder="$t('pages.organization.manage.eventWizard.s4x.colorsPh')" />
            <p class="field-hint" style="margin:2px 0 0">{{ $t('pages.organization.manage.eventWizard.s4x.colorsHint') }}</p>
          </div>
          <div style="display:flex;justify-content:flex-end;padding-top:2px">
            <button class="btn btn-outline-secondary round px-3" type="button" @click="addRegField">
              <font-awesome-icon :icon="['fas', 'plus']" class="me-1" />{{ $t('pages.organization.manage.eventWizard.s4x.addField') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <IconPickerModal v-if="iconPickerFor" @close="iconPickerFor = null" @update:model-value="onIconPicked" />
  </div>
</template>

<style scoped>
.step-title { font-size: 1.3rem; font-weight: 800; color: var(--ehub-ink); margin: 0 0 4px; letter-spacing: -.02em; }
.step-sub { font-size: .88rem; color: var(--ehub-muted); margin: 0 0 28px; }
.form-section { margin-bottom: 26px; }
.form-section-label { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--ehub-muted); margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.form-section-label::after { content: ''; flex: 1; height: 1px; background: var(--ehub-line); }
.field-hint { font-size: .78rem; color: var(--ehub-muted); }

.field-list { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); overflow: visible; }
.evt-input-row { padding: 10px 14px; border-bottom: 1px solid var(--ehub-line); }
.evt-input-label { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.evt-inp-ico { color: var(--ehub-primary); font-size: .85rem; width: 20px; text-align: center; flex-shrink: 0; }
.evt-inp-name { font-size: .85rem; font-weight: 600; color: var(--ehub-ink); }
.evt-del-btn { margin-left: auto; background: transparent; border: 1px solid transparent; border-radius: 6px; color: var(--ehub-muted); cursor: pointer; padding: 2px 6px; font-size: .72rem; }
.evt-del-btn:hover { border-color: color-mix(in srgb,#e23b3b 35%,transparent); background: color-mix(in srgb,#e23b3b 10%,transparent); color: #e23b3b; }

.field-type-chip { display: inline-flex; align-items: center; gap: 4px; font-size: .65rem; font-weight: 700; padding: 2px 8px; border-radius: 50rem; background: var(--ehub-field-bg); color: var(--ehub-muted); border: 1px solid var(--ehub-line); white-space: nowrap; }
.req-chip { font-size: .68rem; font-weight: 700; padding: 2px 9px; border-radius: 50rem; cursor: pointer; border: 1px solid transparent; white-space: nowrap; }
.req-chip.req { background: color-mix(in srgb,#e23b3b 12%,transparent); color: #e23b3b; border-color: color-mix(in srgb,#e23b3b 28%,transparent); }
.req-chip.opt { background: var(--ehub-field-bg); color: var(--ehub-muted); border-color: var(--ehub-line); }

.custom-field-row { display: flex; gap: 8px; padding: 12px 14px; border-top: 1px dashed var(--ehub-line); align-items: center; }
.icon-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--ehub-line); background: var(--ehub-field-bg); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: .9rem; color: var(--ehub-primary); flex-shrink: 0; padding: 0; }
.icon-btn:hover { border-color: var(--ehub-primary); background: var(--ehub-primary-tint); }

.creg-builder { padding: 12px 14px; border-top: 1px dashed var(--ehub-line); display: flex; flex-direction: column; gap: 8px; }
.creg-builder-title { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--ehub-muted); }
.creg-name-row { display: flex; gap: 8px; align-items: center; }
.creg-name-row input { flex: 1; }
.creg-extra-label { font-size: .72rem; font-weight: 700; color: var(--ehub-muted); display: flex; align-items: center; gap: 5px; margin-bottom: 7px; }
.creg-extra { background: var(--ehub-field-bg); border: 1px solid var(--ehub-line); border-radius: 9px; padding: 10px 12px; display: flex; flex-direction: column; gap: 7px; }
.creg-num-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.creg-type-grid { display: flex; flex-wrap: wrap; gap: 5px; }
.creg-type-btn { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 8px; border: 1.5px solid var(--ehub-line); background: var(--ehub-card); color: var(--ehub-muted); font-size: .78rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
.creg-type-btn:hover { border-color: var(--ehub-primary); color: var(--ehub-primary); background: var(--ehub-primary-tint); }
.creg-type-btn.sel { border-color: var(--ehub-primary); color: var(--ehub-primary); background: var(--ehub-primary-tint); }
</style>
