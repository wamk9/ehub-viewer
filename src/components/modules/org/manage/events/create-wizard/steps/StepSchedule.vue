<script setup>
import { ref } from 'vue'
import { slugify } from '../wizardState.js'
import GroupsAutoFillModal from '../GroupsAutoFillModal.vue'
import EhubTimezoneSelect from '@/components/inputs/EhubTimezoneSelect.vue'

const props = defineProps({
  form: { type: Object, required: true },
})

const showGroupsModal = ref(false)

function stageTypeForFormat() {
  return props.form.format === 'bracket' ? 'bracket' : 'points'
}

function addStage() {
  const stageType = stageTypeForFormat()
  props.form.stages.push({
    id: `s-${Date.now()}`,
    name: '',
    route: '',
    stage_type: stageType,
    start_at: '',
    config: stageType === 'points'
      ? { points: props.form.default_points.map(p => ({ ...p })), extra_points: props.form.default_extra_points.map(p => ({ ...p })) }
      : { variant: 'random', reference_stage_id: null },
  })
}

function onStageNameInput(stage) {
  stage.route = slugify(stage.name)
}

function removeStage(i) {
  props.form.stages.splice(i, 1)
}

// Values for the organizer's stage info fields (step 4) live in stage.config.info.
function infoValue(stage, key) {
  return stage.config?.info?.[key] ?? ''
}
function setInfo(stage, key, value) {
  if (!stage.config) stage.config = {}
  stage.config.info = { ...(stage.config.info || {}), [key]: value }
}

// Stage dates are YYYY-MM-DD strings, so a string compare is enough.
function beforeStart(stage) {
  return !!(stage.start_at && props.form.start_at && String(stage.start_at).slice(0, 10) < String(props.form.start_at).slice(0, 10))
}
</script>

<template>
  <div>
    <h2 class="step-title">{{ $t('pages.organization.manage.eventWizard.s3.title') }}</h2>
    <p class="step-sub">{{ $t('pages.organization.manage.eventWizard.s3.sub') }}</p>

    <div class="form-section">
      <div class="form-section-label">{{ $t('pages.organization.manage.eventWizard.s3.datesLabel') }}</div>
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label">{{ $t('pages.organization.manage.eventWizard.s3.regDeadline') }}</label>
          <input type="date" class="form-control" v-model="form.registration_deadline" />
        </div>
        <div class="col-md-4">
          <label class="form-label">{{ $t('pages.organization.manage.eventWizard.s3.start') }} <span class="req-mark">*</span></label>
          <input type="date" class="form-control" v-model="form.start_at" />
        </div>
        <div class="col-md-4">
          <label class="form-label">{{ $t('pages.organization.manage.eventWizard.s3.end') }}</label>
          <input type="date" class="form-control" v-model="form.end_at" />
        </div>
      </div>
    </div>

    <!-- Manual stage list (points / bracket / time formats) -->
    <div class="form-section" v-if="form.format !== 'groups'">
      <div class="form-section-label">{{ $t('pages.organization.manage.eventWizard.s3.stagesLabel') }}</div>
      <p class="field-hint mb-3">{{ $t('pages.organization.manage.eventWizard.s3.stagesHint') }}</p>
      <div class="stages-list">
        <div v-for="(stage, i) in form.stages" :key="stage.id" class="stage-row">
          <div class="stage-num">{{ i + 1 }}</div>
          <input
            type="text" class="stage-name-inp" v-model="stage.name"
            :placeholder="$t('pages.organization.manage.eventWizard.stagePh')"
            @input="onStageNameInput(stage)"
          />
          <input type="date" class="stage-date-inp" :class="{ warn: beforeStart(stage) }" v-model="stage.start_at" />
          <button type="button" class="stage-del" @click="removeStage(i)"><font-awesome-icon :icon="['fas', 'trash']" /></button>
          <div v-if="beforeStart(stage)" class="stage-warn">
            <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="me-1" />{{ $t('pages.organization.manage.eventWizard.s3.beforeStart') }}
          </div>
          <div v-if="form.stage_fields?.length" class="stage-info">
            <label v-for="f in form.stage_fields" :key="f.key" class="stage-info-field">
              <span class="stage-info-lbl"><font-awesome-icon :icon="['fas', f.icon || 'circle-info']" />{{ f.name }}</span>
              <input type="text" class="stage-info-inp" maxlength="120" :value="infoValue(stage, f.key)" @input="setInfo(stage, f.key, $event.target.value)" />
            </label>
          </div>
        </div>
      </div>
      <button type="button" class="btn btn-sm btn-outline-secondary round px-3" @click="addStage">
        <font-awesome-icon :icon="['fas', 'plus']" class="me-2" />{{ $t('pages.organization.manage.eventWizard.s3.addStage') }}
      </button>
    </div>

    <!-- Groups schedule (groups format) -->
    <div class="form-section" v-else>
      <div class="form-section-label">{{ $t('pages.organization.manage.eventWizard.s3.groupsSchedLabel') }}</div>
      <div v-if="!form.stages.length" class="empty-state">
        <button type="button" class="btn btn-primary round px-4" @click="showGroupsModal = true">
          <font-awesome-icon :icon="['fas', 'layer-group']" class="me-2" />{{ $t('pages.organization.manage.eventWizard.s3.autoFill') }}
        </button>
      </div>
      <div v-else>
        <div class="stages-list">
          <div v-for="(stage, i) in form.stages" :key="stage.id" class="stage-row">
            <div class="stage-num" :class="{ final: stage.stage_type === 'bracket' }">
              <font-awesome-icon v-if="stage.stage_type === 'bracket'" :icon="['fas', 'sitemap']" style="font-size:.7rem" />
              <template v-else>{{ i + 1 }}</template>
            </div>
            <span class="stage-name-inp">{{ stage.name }}</span>
            <span class="stage-slots-count">{{ $t('pages.organization.manage.eventWizard.s3.slotsCount', { n: stage.config.slots?.length || 0 }) }}</span>
            <input type="date" class="stage-date-inp" v-model="stage.start_at" />
            <div v-if="form.stage_fields?.length" class="stage-info">
              <label v-for="f in form.stage_fields" :key="f.key" class="stage-info-field">
                <span class="stage-info-lbl"><font-awesome-icon :icon="['fas', f.icon || 'circle-info']" />{{ f.name }}</span>
                <input type="text" class="stage-info-inp" maxlength="120" :value="infoValue(stage, f.key)" @input="setInfo(stage, f.key, $event.target.value)" />
              </label>
            </div>
          </div>
        </div>
        <button type="button" class="btn btn-sm btn-outline-secondary round px-3" @click="showGroupsModal = true">
          <font-awesome-icon :icon="['fas', 'arrows-rotate']" class="me-2" />{{ $t('pages.organization.manage.eventWizard.s3.autoFill') }}
        </button>
      </div>
    </div>

    <div class="form-section">
      <label class="form-label">{{ $t('pages.organization.manage.eventWizard.s3.timezone') }}</label>
      <EhubTimezoneSelect v-model="form.timezone" />
    </div>

    <GroupsAutoFillModal v-if="showGroupsModal" :form="form" @close="showGroupsModal = false" />
  </div>
</template>

<style scoped>
.stage-row { flex-wrap: wrap; }
.stage-info { flex-basis: 100%; display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 8px; padding-left: 36px; }
.stage-info-field { display: flex; flex-direction: column; gap: 3px; margin: 0; }
.stage-info-lbl { display: flex; align-items: center; gap: 5px; font-size: .72rem; font-weight: 700; color: var(--ehub-muted); }
.stage-info-lbl svg { color: var(--ehub-primary-text); }
.stage-info-inp { border: 1px solid var(--ehub-line); border-radius: 7px; padding: 4px 8px; font-size: .8rem; background: var(--ehub-field-bg); color: var(--ehub-ink); }
.stage-info-inp:focus { outline: none; border-color: var(--ehub-primary); }
@media (max-width: 560px) { .stage-info { padding-left: 0; } }
.stage-date-inp.warn { border-color: color-mix(in srgb, var(--ehub-gold), #000 10%); }
.stage-warn { flex-basis: 100%; font-size: .74rem; color: color-mix(in srgb, var(--ehub-gold), #000 30%); padding-left: 38px; }
[data-bs-theme="dark"] .stage-warn { color: var(--ehub-gold); }
.step-title { font-size: 1.3rem; font-weight: 800; color: var(--ehub-ink); margin: 0 0 4px; letter-spacing: -.02em; }
.step-sub { font-size: .88rem; color: var(--ehub-muted); margin: 0 0 28px; }
.form-section { margin-bottom: 26px; }
.form-label { font-size: .85rem; font-weight: 600; color: var(--ehub-ink); }
.req-mark { color: var(--ehub-danger-text); }
.form-section-label { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--ehub-muted); margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.form-section-label::after { content: ''; flex: 1; height: 1px; background: var(--ehub-line); }
.field-hint { font-size: .78rem; color: var(--ehub-muted); }

.stages-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
.stage-row { display: flex; align-items: center; gap: 10px; background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 10px; padding: 11px 14px; }
.stage-row:focus-within { border-color: var(--ehub-primary); }
.stage-num { width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0; background: var(--ehub-primary-tint); color: var(--ehub-primary-text); font-size: .74rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.stage-num.final { background: var(--ehub-primary-strong); color: #fff; }
.stage-name-inp { flex: 1; border: 0; background: transparent; font-size: .88rem; font-weight: 600; color: var(--ehub-ink); padding: 0; }
.stage-name-inp:focus { outline: none; }
.stage-slots-count { font-size: .72rem; color: var(--ehub-muted); background: var(--ehub-field-bg); border: 1px solid var(--ehub-line); padding: 2px 8px; border-radius: 50rem; white-space: nowrap; }
.stage-date-inp { border: 1px solid var(--ehub-line); border-radius: 7px; padding: 4px 8px; font-size: .8rem; background: var(--ehub-field-bg); color: var(--ehub-ink); }
.stage-del { width: 26px; height: 26px; border-radius: 7px; border: 1px solid transparent; background: transparent; color: var(--ehub-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: .75rem; flex-shrink: 0; }
.stage-del:hover { border-color: color-mix(in srgb,#e23b3b 35%,transparent); background: color-mix(in srgb,#e23b3b 10%,transparent); color: var(--ehub-danger-text); }
.empty-state { text-align: center; padding: 24px; border: 1px dashed var(--ehub-line); border-radius: 12px; }
</style>
