<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  form: { type: Object, required: true },
})
const { t } = useI18n()

// Starting point for organizers who have never written a regulation.
function useTemplate() {
  const k = 'pages.organization.manage.eventWizard.s5.'
  const tpl = t(k + 'template', { reg: t(k + (props.form.entry_type === 'team' ? 'templateRegTeam' : 'templateRegIndividual')) })
  props.form.rules = props.form.rules.trim() ? props.form.rules.trim() + '\n\n' + tpl : tpl
}

function addExtra(form) {
  form.default_extra_points.push({ name: '', value: 0 })
}
function removeExtra(form, i) {
  form.default_extra_points.splice(i, 1)
}

// Group games score win / draw / loss (default 3 / 1 / 0) on every group stage.
const GP_DEFAULT = { win: 3, draw: 1, loss: 0 }
// Set sports (volleyball, tennis…) never end level: no draw points to set.
const pointKeys = computed(() => (props.form.event_data?.['sets-to-win'] ? ['win', 'loss'] : ['win', 'draw', 'loss']))
function groupPoint(k) {
  const g = (props.form.stages || []).find((st) => st.stage_type === 'group')
  return g?.config?.['points_' + k] ?? GP_DEFAULT[k]
}
function setGroupPoint(k, v) {
  const n = v === '' ? GP_DEFAULT[k] : Number(v)
  ;(props.form.stages || []).filter((st) => st.stage_type === 'group').forEach((st) => {
    st.config = { ...(st.config || {}), ['points_' + k]: n }
  })
}
</script>

<template>
  <div>
    <h2 class="step-title">{{ $t('pages.organization.manage.eventWizard.s5.title') }}</h2>
    <p class="step-sub">{{ $t('pages.organization.manage.eventWizard.s5.sub') }}</p>

    <div class="form-section">
      <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
        <label class="form-label mb-0">{{ $t('pages.organization.manage.eventWizard.s5.generalRules') }} <span class="req-mark">*</span></label>
        <button type="button" class="btn btn-sm btn-outline-primary round px-3 ms-auto" @click="useTemplate">
          <font-awesome-icon :icon="['fas', 'wand-magic-sparkles']" class="me-1" />{{ $t('pages.organization.manage.eventWizard.s5.useTemplate') }}
        </button>
      </div>
      <p class="field-hint mb-2">{{ $t('pages.organization.manage.eventWizard.s5.templateHint') }}</p>
      <textarea class="form-control" rows="7" maxlength="3000" style="resize:vertical" v-model="form.rules" :placeholder="$t('pages.organization.manage.eventWizard.s5.rulesPh')"></textarea>
      <div class="char-count">{{ form.rules.length }}/3000</div>
    </div>

    <div class="form-section" v-if="form.format === 'groups'">
      <div class="form-section-label">{{ $t('pages.organization.manage.eventWizard.s5.groupPtsLabel') }}</div>
      <p class="field-hint mb-3">{{ $t('pages.organization.manage.eventWizard.s5.groupPtsTip') }}</p>
      <div class="d-flex gap-3 flex-wrap">
        <label v-for="k in pointKeys" :key="k" class="gp-field">
          <span>{{ $t('pages.organization.manage.eventWizard.s5.gp_' + k) }}</span>
          <input type="number" min="0" class="pts-input" :value="groupPoint(k)" @input="setGroupPoint(k, $event.target.value)" />
        </label>
      </div>
    </div>

    <div class="form-section" v-if="form.format === 'time'">
      <div class="form-section-label">{{ $t('competition.time.rules_label') }}</div>
      <p class="field-hint mb-0">{{ $t('competition.time.rules_tip') }}</p>
    </div>

    <div class="form-section" v-if="form.format === 'points'">
      <div class="form-section-label">{{ $t('pages.organization.manage.eventWizard.s5.ptsLabel') }}</div>
      <p class="field-hint mb-3">{{ $t('pages.organization.manage.eventWizard.s5.ptsTip') }}</p>
      <div class="pts-table-wrap">
        <table class="pts-table">
          <thead>
            <tr>
              <th>{{ $t('pages.organization.manage.eventWizard.pts.pos') }}</th>
              <th>{{ $t('pages.organization.manage.eventWizard.pts.pts') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in form.default_points" :key="p.position">
              <td class="pos-lbl">{{ p.position }}º</td>
              <td><input type="number" class="pts-input" v-model.number="p.value" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="extra-pts-list">
        <div v-for="(ep, i) in form.default_extra_points" :key="i" class="extra-pts-row">
          <input type="text" class="form-control form-control-sm" v-model="ep.name" :placeholder="$t('pages.organization.manage.eventWizard.s5.bonusPh')" />
          <input type="number" class="pts-input" v-model.number="ep.value" />
          <button :aria-label="$t('a11y.remove')" :title="$t('a11y.remove')" type="button" class="stage-del" @click="removeExtra(form, i)"><font-awesome-icon :icon="['fas', 'xmark']" /></button>
        </div>
        <button type="button" class="btn btn-sm btn-outline-secondary round px-3 mt-2" @click="addExtra(form)">
          <font-awesome-icon :icon="['fas', 'plus']" class="me-2" />{{ $t('pages.organization.manage.eventWizard.s5.bonusAdd') }}
        </button>
      </div>
    </div>

    <div class="form-section">
      <label class="form-label" for="wz-rules-1">{{ $t('pages.organization.manage.eventWizard.s5.techReqs') }}</label>
      <textarea id="wz-rules-1" class="form-control" rows="4" style="resize:vertical" v-model="form.tech_requirements" :placeholder="$t('pages.organization.manage.eventWizard.s5.techReqsPh')"></textarea>
    </div>

    <div class="form-section">
      <label class="form-label" for="wz-rules-2">{{ $t('pages.organization.manage.eventWizard.s5.streaming') }} <span class="field-hint">({{ $t('pages.organization.manage.eventWizard.optional') }})</span></label>
      <div class="row g-2">
        <div class="col">
          <div class="input-group">
            <span class="input-group-text"><font-awesome-icon :icon="['fab', 'twitch']" /></span>
            <input id="wz-rules-2" type="text" class="form-control" v-model="form.streaming_twitch" placeholder="twitch.tv/canal" />
          </div>
        </div>
        <div class="col">
          <div class="input-group">
            <span class="input-group-text"><font-awesome-icon :icon="['fab', 'youtube']" /></span>
            <input type="text" class="form-control" v-model="form.streaming_youtube" placeholder="youtube.com/canal" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-title { font-size: 1.3rem; font-weight: 800; color: var(--ehub-ink); margin: 0 0 4px; letter-spacing: -.02em; }
.step-sub { font-size: .88rem; color: var(--ehub-muted); margin: 0 0 28px; }
.form-section { margin-bottom: 26px; }
.form-label { font-size: .85rem; font-weight: 600; color: var(--ehub-ink); }
.req-mark { color: var(--ehub-danger-text); }
.char-count { font-size: .73rem; color: var(--ehub-muted); text-align: right; margin-top: 3px; }
.form-section-label { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--ehub-muted); margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.form-section-label::after { content: ''; flex: 1; height: 1px; background: var(--ehub-line); }
.field-hint { font-size: .78rem; color: var(--ehub-muted); }

.pts-table-wrap { max-height: 320px; overflow-y: auto; border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); }
.pts-table { width: 100%; border-collapse: collapse; }
.pts-table th { position: sticky; top: 0; background: var(--ehub-field-bg); font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--ehub-muted); padding: 8px 12px; border-bottom: 1px solid var(--ehub-line); text-align: left; }
.pts-table td { padding: 6px 12px; border-bottom: 1px solid var(--ehub-line); }
.pts-table tbody tr:last-child td { border-bottom: 0; }
.pos-lbl { font-size: .88rem; font-weight: 600; color: var(--ehub-ink); }
.pts-input { width: 80px; border: 1px solid var(--ehub-line); border-radius: 7px; padding: 5px 10px; font-size: .88rem; font-weight: 600; color: var(--ehub-ink); background: var(--ehub-field-bg); text-align: center; }
.pts-input:focus { outline: none; border-color: var(--ehub-primary); }
.extra-pts-list { margin-top: 12px; }
.extra-pts-row { display: flex; gap: 8px; align-items: center; margin-bottom: 6px; }
.extra-pts-row input.form-control-sm { flex: 1; }
.stage-del { width: 26px; height: 26px; border-radius: 7px; border: 1px solid transparent; background: transparent; color: var(--ehub-muted); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: .75rem; flex-shrink: 0; }
.stage-del:hover { border-color: color-mix(in srgb,#e23b3b 35%,transparent); background: color-mix(in srgb,#e23b3b 10%,transparent); color: var(--ehub-danger-text); }
.gp-field { display: flex; flex-direction: column; gap: 4px; font-size: .8rem; font-weight: 600; color: var(--ehub-ink); }
</style>
