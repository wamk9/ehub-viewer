<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { slugify } from '../wizardState.js'
import IconPickerModal from '../IconPickerModal.vue'
import EhubRegistrationModal from '@/components/modules/event-registration/EhubRegistrationModal.vue'
import { initialValues, validateAnswers } from '@/components/modules/event-registration/regForm.js'

const props = defineProps({
  form: { type: Object, required: true },
})

const { t } = useI18n()
const K = 'pages.organization.manage.eventWizard.s4x.'

const REG_TYPES = ['text', 'number', 'select', 'checkbox', 'date', 'url', 'color']
const REG_TYPE_ICON = { text: 'font', number: 'hashtag', select: 'list-ul', color: 'palette', date: 'calendar-days', checkbox: 'toggle-on', switch: 'toggle-on', url: 'link' }
const typeLabel = (type) => t(K + 'type' + (type === 'switch' ? 'Checkbox' : type.charAt(0).toUpperCase() + type.slice(1)))

// ── ready-made suggestions ──────────────────────────────────────────────
const EVT_SUGGESTIONS = [
  { key: 'discord', icon: 'headset' },
  { key: 'server', icon: 'server' },
  { key: 'broadcast', icon: 'tv' },
  { key: 'contact', icon: 'envelope' },
  { key: 'extra-prize', icon: 'trophy' },
]
const STG_SUGGESTIONS = [
  { key: 'track', icon: 'road' },
  { key: 'map', icon: 'map' },
  { key: 'time', icon: 'clock' },
  { key: 'duration', icon: 'hourglass-half' },
  { key: 'weather', icon: 'cloud-sun' },
]
const REG_BASE = [
  { key: 'nickname', type: 'text', icon: 'user', required: true },
  { key: 'discord', type: 'text', icon: 'headset' },
  { key: 'team', type: 'text', icon: 'users' },
  { key: 'city', type: 'text', icon: 'location-dot' },
  { key: 'birthdate', type: 'date', icon: 'cake-candles' },
  { key: 'accept-rules', type: 'checkbox', icon: 'file-signature', required: true },
]
const REG_BY_CATEGORY = {
  simracing: [
    { key: 'steam-id', type: 'text', icon: 'id-card' },
    { key: 'car-number', type: 'number', icon: 'car', min: 1, max: 999 },
    { key: 'sim-rating', type: 'number', icon: 'signal' },
  ],
  esports: [
    { key: 'game-id', type: 'text', icon: 'gamepad', required: true },
    { key: 'rank', type: 'text', icon: 'medal' },
  ],
  chess: [
    { key: 'chess-username', type: 'text', icon: 'chess-knight', required: true },
    { key: 'rating', type: 'number', icon: 'star' },
  ],
}
// Hide a suggestion once a field with the same key or label exists ("SteamID" ≈ "steam-id").
const norm = (v) => String(v || '').toLowerCase().replace(/[^a-z0-9]/g, '')
const taken = (list, s, keyProp, labelProp) => list.some((f) =>
  norm(f[keyProp]) === norm(s.key) || norm(f[labelProp]) === norm(t(K + 'sug.' + s.key)))
const regSuggestions = computed(() => {
  const cat = String(props.form.category || '')
  const extra = cat.startsWith('esports') ? REG_BY_CATEGORY.esports : (REG_BY_CATEGORY[cat] || [])
  return [...extra, ...REG_BASE].filter((s) => !taken(props.form.registration_form_template, s, 'name', 'label'))
})
const evtSuggestions = computed(() => EVT_SUGGESTIONS.filter((s) => !taken(props.form.event_fields, s, 'key', 'name')))
const stgSuggestions = computed(() => STG_SUGGESTIONS.filter((s) => !taken(props.form.stage_fields, s, 'key', 'name')))

// ── helpers ─────────────────────────────────────────────────────────────
function uniqueKey(base, list, prop, self = null) {
  const root = base || 'campo'
  let key = root
  let n = 2
  while (list.some((f) => f !== self && f[prop] === key)) key = `${root}-${n++}`
  return key
}
function move(list, i, dir) {
  const j = i + dir
  if (j < 0 || j >= list.length) return
  const [item] = list.splice(i, 1)
  list.splice(j, 0, item)
}

// Keys of fields created in this session follow the label while typing;
// saved keys never change (answers and stage values reference them).
const freshFields = new Set()
function onLabel(field, list, prop, text) {
  if (prop === 'name') field.label = text
  else field.name = text
  if (freshFields.has(field)) field[prop] = uniqueKey(slugify(text), list, prop, field)
}

// ── event info / stage info ─────────────────────────────────────────────
function addInfo(list, suggestion = null) {
  const label = suggestion ? t(K + 'sug.' + suggestion.key) : ''
  list.push({ key: suggestion ? suggestion.key : uniqueKey('campo', list, 'key'), name: label, icon: suggestion?.icon || 'circle-info', value: '' })
  const f = list[list.length - 1]
  if (!suggestion) freshFields.add(f)
}

// ── registration fields ─────────────────────────────────────────────────
const openIndex = ref(null)
function addReg(suggestion = null) {
  const list = props.form.registration_form_template
  const field = suggestion
    ? { type: suggestion.type, name: suggestion.key, label: t(K + 'sug.' + suggestion.key), icon: suggestion.icon, required: !!suggestion.required, values: [] }
    : { type: 'text', name: uniqueKey('campo', list, 'name'), label: '', icon: 'font', required: false, values: [] }
  if (suggestion?.min != null) { field.min = suggestion.min; field.max = suggestion.max ?? null }
  list.push(field)
  if (!suggestion) freshFields.add(list[list.length - 1])
  openIndex.value = list.length - 1
}
function removeReg(i) {
  props.form.registration_form_template.splice(i, 1)
  openIndex.value = null
}
function moveReg(i, dir) {
  move(props.form.registration_form_template, i, dir)
  if (openIndex.value === i) openIndex.value = i + dir
}
function setType(field, type) {
  field.type = type
  if (!['select', 'color'].includes(type)) field.values = []
  if (type !== 'number') { delete field.min; delete field.max }
  if (!field.icon || Object.values(REG_TYPE_ICON).includes(field.icon)) field.icon = REG_TYPE_ICON[type]
}
function setRange(field, key, value) {
  field[key] = value === '' ? null : +value
}

// options as chips
const optDraft = ref('')
function addOption(field) {
  const parts = optDraft.value.split(',').map((v) => v.trim()).filter(Boolean)
  if (!Array.isArray(field.values)) field.values = []
  parts.forEach((p) => { if (!field.values.includes(p)) field.values.push(p) })
  optDraft.value = ''
}
function onOptKey(e, field) {
  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addOption(field) }
  else if (e.key === 'Backspace' && !optDraft.value && field.values?.length) field.values.pop()
}
function toggle(i) {
  optDraft.value = ''
  openIndex.value = openIndex.value === i ? null : i
}

// Preview modal: the exact public registration dialog; answers are never sent.
const showPreview = ref(false)
const previewData = ref({})
const previewErrors = ref({})
const previewOk = ref(false)
const previewFields = computed(() => props.form.registration_form_template.filter((f) => f.label?.trim()))
function openPreview() {
  previewData.value = initialValues(previewFields.value)
  previewErrors.value = {}
  previewOk.value = false
  showPreview.value = true
}
watch(previewData, () => { previewOk.value = false })
function confirmPreview() {
  previewErrors.value = validateAnswers(previewFields.value, previewData.value)
  previewOk.value = !Object.keys(previewErrors.value).length
}

// ── icon picker ─────────────────────────────────────────────────────────
const iconTarget = ref(null)
function onIconPicked(icon) { if (iconTarget.value) iconTarget.value.icon = icon }
</script>

<template>
  <div>
    <h2 class="step-title">{{ $t(K + 'title') }}</h2>
    <p class="step-sub">{{ $t(K + 'sub') }}</p>

    <!-- ═══ 1 · Event info ═══ -->
    <section class="fb-block">
      <header class="fb-head">
        <span class="fb-num">1</span>
        <div class="fb-head-txt">
          <h3 class="fb-title">{{ $t(K + 'evtLabel') }}</h3>
          <p class="fb-desc">{{ $t(K + 'evtHint') }}</p>
        </div>
        <span class="fb-where"><font-awesome-icon :icon="['fas', 'eye']" />{{ $t(K + 'evtWhere') }}</span>
      </header>

      <div class="fb-body">
        <div v-if="form.event_fields.length" class="fb-cols fb-cols-evt">
          <span>{{ $t(K + 'colName') }}</span><span>{{ $t(K + 'colValue') }}</span>
        </div>
        <div v-for="(f, i) in form.event_fields" :key="i" class="fb-row fb-row-evt">
          <button type="button" class="icon-btn" :title="$t(K + 'chooseIcon')" @click="iconTarget = f"><font-awesome-icon :icon="['fas', f.icon || 'circle-info']" /></button>
          <input type="text" class="form-control form-control-sm" :value="f.name" maxlength="120" :placeholder="$t(K + 'customEvtPh')" @input="onLabel(f, form.event_fields, 'key', $event.target.value)" />
          <textarea class="form-control form-control-sm fb-desc-inp" v-model="f.value" rows="2" maxlength="500" :placeholder="$t(K + 'valuePh')"></textarea>
          <button type="button" class="row-btn danger" :title="$t(K + 'remove')" @click="form.event_fields.splice(i, 1)"><font-awesome-icon :icon="['fas', 'xmark']" /></button>
        </div>
        <p v-if="!form.event_fields.length" class="fb-empty">{{ $t(K + 'evtEmpty') }}</p>

        <div class="fb-add">
          <button type="button" class="btn btn-sm btn-outline-secondary round px-3" @click="addInfo(form.event_fields)">
            <font-awesome-icon :icon="['fas', 'plus']" class="me-1" />{{ $t(K + 'addField') }}
          </button>
          <template v-if="evtSuggestions.length">
            <span class="fb-sug-lbl"><font-awesome-icon :icon="['fas', 'wand-magic-sparkles']" />{{ $t(K + 'suggestions') }}</span>
            <button v-for="s in evtSuggestions" :key="s.key" type="button" class="sug-chip" @click="addInfo(form.event_fields, s)">
              <font-awesome-icon :icon="['fas', s.icon]" />{{ $t(K + 'sug.' + s.key) }}
            </button>
          </template>
        </div>
      </div>
    </section>

    <!-- ═══ 2 · Stage info ═══ -->
    <section class="fb-block">
      <header class="fb-head">
        <span class="fb-num">2</span>
        <div class="fb-head-txt">
          <h3 class="fb-title">{{ $t(K + 'stgLabel') }}</h3>
          <p class="fb-desc">{{ $t(K + 'stgHint') }}</p>
        </div>
        <span class="fb-where"><font-awesome-icon :icon="['fas', 'eye']" />{{ $t(K + 'stgWhere') }}</span>
      </header>

      <div class="fb-body">
        <div v-for="(f, i) in form.stage_fields" :key="i" class="fb-row fb-row-stg">
          <button type="button" class="icon-btn" :title="$t(K + 'chooseIcon')" @click="iconTarget = f"><font-awesome-icon :icon="['fas', f.icon || 'circle-info']" /></button>
          <input type="text" class="form-control form-control-sm" :value="f.name" maxlength="120" :placeholder="$t(K + 'customStgPh')" @input="onLabel(f, form.stage_fields, 'key', $event.target.value)" />
          <button type="button" class="row-btn danger" :title="$t(K + 'remove')" @click="form.stage_fields.splice(i, 1)"><font-awesome-icon :icon="['fas', 'xmark']" /></button>
        </div>
        <p v-if="!form.stage_fields.length" class="fb-empty">{{ $t(K + 'stgEmpty') }}</p>
        <p v-else class="fb-note"><font-awesome-icon :icon="['fas', 'circle-info']" />{{ $t(K + 'stgNote') }}</p>

        <div class="fb-add">
          <button type="button" class="btn btn-sm btn-outline-secondary round px-3" @click="addInfo(form.stage_fields)">
            <font-awesome-icon :icon="['fas', 'plus']" class="me-1" />{{ $t(K + 'addField') }}
          </button>
          <template v-if="stgSuggestions.length">
            <span class="fb-sug-lbl"><font-awesome-icon :icon="['fas', 'wand-magic-sparkles']" />{{ $t(K + 'suggestions') }}</span>
            <button v-for="s in stgSuggestions" :key="s.key" type="button" class="sug-chip" @click="addInfo(form.stage_fields, s)">
              <font-awesome-icon :icon="['fas', s.icon]" />{{ $t(K + 'sug.' + s.key) }}
            </button>
          </template>
        </div>
      </div>
    </section>

    <!-- ═══ 3 · Registration form ═══ -->
    <section class="fb-block">
      <header class="fb-head">
        <span class="fb-num">3</span>
        <div class="fb-head-txt">
          <h3 class="fb-title">{{ $t(K + 'regLabel') }}</h3>
          <p class="fb-desc">{{ $t(K + 'regHint') }}</p>
        </div>
        <span class="fb-where"><font-awesome-icon :icon="['fas', 'eye']" />{{ $t(K + 'regWhere') }}</span>
      </header>

      <div class="fb-body">
        <!-- builder -->
        <div class="reg-builder">
          <div v-for="(f, i) in form.registration_form_template" :key="i" class="reg-card" :class="{ open: openIndex === i }">
            <div class="reg-card-head" @click="toggle(i)">
              <font-awesome-icon :icon="['fas', f.icon || REG_TYPE_ICON[f.type] || 'font']" class="reg-ico" />
              <span class="reg-name" :class="{ muted: !f.label }">{{ f.label || $t(K + 'untitled') }}</span>
              <span class="type-chip"><font-awesome-icon :icon="['fas', REG_TYPE_ICON[f.type] || 'font']" />{{ typeLabel(f.type) }}</span>
              <span v-if="f.required" class="req-chip">{{ $t(K + 'required') }}</span>
              <div class="reg-actions" @click.stop>
                <button type="button" class="row-btn" :disabled="i === 0" :title="$t(K + 'moveUp')" @click="moveReg(i, -1)"><font-awesome-icon :icon="['fas', 'arrow-up']" /></button>
                <button type="button" class="row-btn" :disabled="i === form.registration_form_template.length - 1" :title="$t(K + 'moveDown')" @click="moveReg(i, 1)"><font-awesome-icon :icon="['fas', 'arrow-down']" /></button>
                <button type="button" class="row-btn danger" :title="$t(K + 'remove')" @click="removeReg(i)"><font-awesome-icon :icon="['fas', 'trash']" /></button>
              </div>
              <font-awesome-icon :icon="['fas', openIndex === i ? 'chevron-up' : 'chevron-down']" class="reg-caret" />
            </div>

            <div v-if="openIndex === i" class="reg-edit">
              <div class="reg-edit-row">
                <button type="button" class="icon-btn" :title="$t(K + 'chooseIcon')" @click="iconTarget = f"><font-awesome-icon :icon="['fas', f.icon || REG_TYPE_ICON[f.type]]" /></button>
                <div class="flex-grow-1">
                  <label class="mini-lbl">{{ $t(K + 'question') }}</label>
                  <input type="text" class="form-control form-control-sm" :value="f.label" maxlength="120" :placeholder="$t(K + 'customRegPh')" @input="onLabel(f, form.registration_form_template, 'name', $event.target.value)" />
                </div>
              </div>

              <div>
                <label class="mini-lbl">{{ $t(K + 'answerType') }}</label>
                <div class="type-grid">
                  <button v-for="rt in REG_TYPES" :key="rt" type="button" class="type-btn" :class="{ sel: f.type === rt || (rt === 'checkbox' && f.type === 'switch') }" @click="setType(f, rt)">
                    <font-awesome-icon :icon="['fas', REG_TYPE_ICON[rt]]" />{{ typeLabel(rt) }}
                  </button>
                </div>
                <p class="mini-hint">{{ $t(K + 'typeHint.' + (f.type === 'switch' ? 'checkbox' : f.type)) }}</p>
              </div>

              <div v-if="f.type === 'select' || f.type === 'color'">
                <label class="mini-lbl">{{ $t(K + (f.type === 'select' ? 'optsLabel' : 'colorsLabel')) }}</label>
                <div class="chips-input">
                  <span v-for="(o, oi) in f.values" :key="o" class="opt-chip">
                    <span v-if="f.type === 'color'" class="opt-swatch" :style="{ background: o }"></span>{{ o }}
                    <button type="button" @click="f.values.splice(oi, 1)"><font-awesome-icon :icon="['fas', 'xmark']" /></button>
                  </span>
                  <input type="text" v-model="optDraft" :placeholder="$t(K + (f.type === 'select' ? 'optsPh' : 'colorsPh'))" @keydown="onOptKey($event, f)" @blur="addOption(f)" />
                </div>
                <p class="mini-hint">{{ $t(K + (f.type === 'select' ? 'optsHint' : 'colorsHint')) }}</p>
              </div>

              <div v-if="f.type === 'number'" class="reg-range">
                <div>
                  <label class="mini-lbl">{{ $t(K + 'min') }}</label>
                  <input type="number" class="form-control form-control-sm" :value="f.min ?? ''" @input="setRange(f, 'min', $event.target.value)" />
                </div>
                <div>
                  <label class="mini-lbl">{{ $t(K + 'max') }}</label>
                  <input type="number" class="form-control form-control-sm" :value="f.max ?? ''" @input="setRange(f, 'max', $event.target.value)" />
                </div>
              </div>

              <div v-if="!['checkbox', 'switch', 'select', 'color', 'date'].includes(f.type)">
                <label class="mini-lbl">{{ $t(K + 'placeholder') }} <span class="opt-tag">{{ $t(K + 'rangeOptional') }}</span></label>
                <input type="text" class="form-control form-control-sm" v-model="f.placeholder" maxlength="120" :placeholder="$t(K + 'placeholderPh')" />
              </div>
              <div>
                <label class="mini-lbl">{{ $t(K + 'help') }} <span class="opt-tag">{{ $t(K + 'rangeOptional') }}</span></label>
                <input type="text" class="form-control form-control-sm" v-model="f.help" maxlength="200" :placeholder="$t(K + 'helpPh')" />
              </div>

              <label class="req-switch">
                <input type="checkbox" class="form-check-input" v-model="f.required" />
                <span>
                  <strong>{{ $t(K + 'requiredLabel') }}</strong>
                  <small>{{ $t(K + (f.type === 'checkbox' || f.type === 'switch' ? 'requiredHintCheck' : 'requiredHint')) }}</small>
                </span>
              </label>
            </div>
          </div>

          <p v-if="!form.registration_form_template.length" class="fb-empty">{{ $t(K + 'regEmpty') }}</p>

          <div class="fb-add">
            <button type="button" class="btn btn-sm btn-outline-secondary round px-3" @click="addReg()">
              <font-awesome-icon :icon="['fas', 'plus']" class="me-1" />{{ $t(K + 'addField') }}
            </button>
            <button type="button" class="btn btn-sm btn-primary round px-3" @click="openPreview">
              <font-awesome-icon :icon="['fas', 'eye']" class="me-1" />{{ $t(K + 'previewBtnOpen') }}
            </button>
            <template v-if="regSuggestions.length">
              <span class="fb-sug-lbl"><font-awesome-icon :icon="['fas', 'wand-magic-sparkles']" />{{ $t(K + 'suggestions') }}</span>
              <button v-for="s in regSuggestions" :key="s.key" type="button" class="sug-chip" @click="addReg(s)">
                <font-awesome-icon :icon="['fas', s.icon]" />{{ $t(K + 'sug.' + s.key) }}
              </button>
            </template>
          </div>
        </div>

      </div>
    </section>

    <EhubRegistrationModal
      v-if="showPreview"
      preview
      :preview-ok="previewOk"
      :event-name="form.name || $t(K + 'previewEvent')"
      :accent="form.color || ''"
      :fee="Number(form.fee) || 0"
      :currency="form.currency || ''"
      :fields="previewFields"
      v-model="previewData"
      :errors="previewErrors"
      @close="showPreview = false"
      @confirm="confirmPreview"
    />

    <IconPickerModal v-if="iconTarget" @close="iconTarget = null" @update:model-value="onIconPicked" />
  </div>
</template>

<style scoped>
.step-title { font-size: 1.3rem; font-weight: 800; color: var(--ehub-ink); margin: 0 0 4px; letter-spacing: -.02em; }
.step-sub { font-size: .88rem; color: var(--ehub-muted); margin: 0 0 24px; }

.fb-block { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card, 14px); margin-bottom: 18px; }
.fb-head { display: flex; align-items: flex-start; gap: 12px; padding: 16px 18px 12px; flex-wrap: wrap; }
.fb-num { width: 28px; height: 28px; border-radius: 50%; background: var(--ehub-primary-tint); color: var(--ehub-primary); font-weight: 800; font-size: .8rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.fb-head-txt { flex: 1; min-width: 220px; }
.fb-title { font-size: .98rem; font-weight: 800; color: var(--ehub-ink); margin: 3px 0 2px; }
.fb-desc { font-size: .8rem; color: var(--ehub-muted); margin: 0; }
.fb-where { display: inline-flex; align-items: center; gap: 6px; font-size: .7rem; font-weight: 700; color: var(--ehub-muted); background: var(--ehub-field-bg); border: 1px solid var(--ehub-line); border-radius: 50rem; padding: 3px 10px; white-space: nowrap; margin-top: 3px; }
.fb-body { padding: 0 18px 16px; }
.fb-empty { font-size: .8rem; color: var(--ehub-muted); text-align: center; border: 1px dashed var(--ehub-line); border-radius: 10px; padding: 14px; margin: 0 0 10px; }
.fb-note { display: flex; align-items: center; gap: 6px; font-size: .76rem; color: var(--ehub-muted); margin: 2px 0 10px; }

.fb-cols { display: grid; gap: 8px; font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--ehub-muted); margin-bottom: 4px; }
.fb-cols-evt { grid-template-columns: 36px 1fr 1.4fr 28px; }
.fb-cols-evt span:first-child { grid-column: 2; }
.fb-row { display: grid; gap: 8px; align-items: center; margin-bottom: 8px; }
.fb-row-evt { align-items: start; }
.fb-desc-inp { resize: vertical; min-height: 32px; }
.fb-row-evt { grid-template-columns: 36px 1fr 1.4fr 28px; }
.fb-row-stg { grid-template-columns: 36px 1fr 28px; }
.fb-add { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 4px; }
.fb-sug-lbl { display: inline-flex; align-items: center; gap: 5px; font-size: .72rem; font-weight: 700; color: var(--ehub-muted); margin: 0 2px 0 8px; }
.sug-chip { display: inline-flex; align-items: center; gap: 5px; font-size: .74rem; font-weight: 600; padding: 4px 10px; border-radius: 50rem; border: 1px dashed var(--ehub-line); background: transparent; color: var(--ehub-ink); cursor: pointer; }
.sug-chip svg { color: var(--ehub-primary); font-size: .7rem; }
.sug-chip:hover { border-style: solid; border-color: var(--ehub-primary); background: var(--ehub-primary-tint); }

.icon-btn { width: 36px; height: 32px; border-radius: 8px; border: 1px solid var(--ehub-line); background: var(--ehub-field-bg); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: .85rem; color: var(--ehub-primary); flex-shrink: 0; padding: 0; }
.icon-btn:hover { border-color: var(--ehub-primary); background: var(--ehub-primary-tint); }
.row-btn { width: 28px; height: 28px; border-radius: 7px; border: 1px solid transparent; background: transparent; color: var(--ehub-muted); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: .72rem; padding: 0; }
.row-btn:hover:not(:disabled) { border-color: var(--ehub-line); color: var(--ehub-ink); }
.row-btn:disabled { opacity: .35; cursor: default; }
.row-btn.danger:hover { border-color: color-mix(in srgb,#e23b3b 35%,transparent); background: color-mix(in srgb,#e23b3b 10%,transparent); color: #e23b3b; }

.reg-card { border: 1px solid var(--ehub-line); border-radius: 10px; margin-bottom: 8px; background: var(--ehub-card); }
.reg-card.open { border-color: var(--ehub-primary); box-shadow: 0 0 0 3px var(--ehub-primary-tint); }
.reg-card-head { display: flex; align-items: center; gap: 8px; padding: 8px 10px; cursor: pointer; min-width: 0; }
.reg-ico { color: var(--ehub-primary); width: 18px; font-size: .82rem; flex-shrink: 0; }
.reg-name { font-size: .85rem; font-weight: 600; color: var(--ehub-ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; flex: 1; }
.reg-name.muted { color: var(--ehub-muted); font-style: italic; font-weight: 500; }
.type-chip { display: inline-flex; align-items: center; gap: 4px; font-size: .64rem; font-weight: 700; padding: 2px 8px; border-radius: 50rem; background: var(--ehub-field-bg); color: var(--ehub-muted); border: 1px solid var(--ehub-line); white-space: nowrap; }
.req-chip { font-size: .64rem; font-weight: 700; padding: 2px 8px; border-radius: 50rem; white-space: nowrap; background: color-mix(in srgb,#e23b3b 12%,transparent); color: #e23b3b; border: 1px solid color-mix(in srgb,#e23b3b 28%,transparent); }
.reg-actions { display: flex; gap: 1px; }
.reg-caret { color: var(--ehub-muted); font-size: .7rem; }
.reg-edit { border-top: 1px solid var(--ehub-line); padding: 12px; display: flex; flex-direction: column; gap: 12px; }
.reg-edit-row { display: flex; gap: 8px; align-items: flex-end; }
.mini-lbl { display: block; font-size: .72rem; font-weight: 700; color: var(--ehub-ink); margin-bottom: 4px; }
.mini-hint { font-size: .72rem; color: var(--ehub-muted); margin: 5px 0 0; }
.opt-tag { font-weight: 400; color: var(--ehub-muted); }
.type-grid { display: flex; flex-wrap: wrap; gap: 5px; }
.type-btn { display: flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 8px; border: 1.5px solid var(--ehub-line); background: var(--ehub-card); color: var(--ehub-muted); font-size: .76rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
.type-btn:hover, .type-btn.sel { border-color: var(--ehub-primary); color: var(--ehub-primary); background: var(--ehub-primary-tint); }
.chips-input { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; border: 1px solid var(--ehub-line); background: var(--ehub-field-bg); border-radius: 8px; padding: 5px 7px; }
.chips-input:focus-within { border-color: var(--ehub-primary); }
.chips-input input { flex: 1; min-width: 120px; border: 0; background: transparent; font-size: .8rem; color: var(--ehub-ink); outline: none; padding: 2px; }
.opt-chip { display: inline-flex; align-items: center; gap: 5px; font-size: .74rem; font-weight: 600; background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 50rem; padding: 1px 4px 1px 9px; color: var(--ehub-ink); }
.opt-chip button { border: 0; background: transparent; color: var(--ehub-muted); font-size: .65rem; cursor: pointer; padding: 0 4px; }
.opt-chip button:hover { color: #e23b3b; }
.opt-swatch { width: 12px; height: 12px; border-radius: 3px; border: 1px solid var(--ehub-line); }
.reg-range { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.req-switch { display: flex; gap: 10px; align-items: flex-start; background: var(--ehub-field-bg); border: 1px solid var(--ehub-line); border-radius: 9px; padding: 9px 12px; cursor: pointer; }
.req-switch .form-check-input { margin-top: 3px; flex-shrink: 0; }
.req-switch strong { display: block; font-size: .8rem; color: var(--ehub-ink); }
.req-switch small { display: block; font-size: .72rem; color: var(--ehub-muted); }


@media (max-width: 560px) {
  .fb-row-evt, .fb-cols-evt { grid-template-columns: 36px 1fr 28px; }
  .fb-row-evt textarea { grid-column: 2; grid-row: 2; }
  .fb-cols-evt { display: none; }
  .type-chip { display: none; }
}
</style>
