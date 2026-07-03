<script setup>
import { ref, computed } from 'vue'
import { slugify, DEFAULT_POINTS } from './wizardState.js'

const props = defineProps({
  form: { type: Object, required: true },
})
const emit = defineEmits(['close'])

const GROUP_COUNTS = [2, 3, 4, 6, 8]
const PER_GROUP = [3, 4, 5, 6, 8]
const ADVANCE = [1, 2, 3, 4]
const VALID_VARIANTS = { 8: 'top-8', 16: 'top-16', 32: 'top-32', 64: 'top-64' }

const groupsCount = ref(4)
const perGroup = ref(4)
const advance = ref(2)

const total = computed(() => groupsCount.value * perGroup.value)
const finalists = computed(() => groupsCount.value * advance.value)
const finalVariant = computed(() => VALID_VARIANTS[finalists.value] ?? 'random')

const GROUP_LETTERS = 'ABCDEFGHIJKLMNOP'

function apply() {
  const stages = []
  for (let i = 0; i < groupsCount.value; i++) {
    const name = `Grupo ${GROUP_LETTERS[i]}`
    stages.push({
      id: `g-${Date.now()}-${i}`,
      name,
      route: slugify(name),
      stage_type: 'points',
      start_at: '',
      config: {
        points: DEFAULT_POINTS.slice(0, perGroup.value).map(p => ({ ...p })),
        extra_points: [],
        slots: Array.from({ length: perGroup.value }, (_, j) => `Vaga ${j + 1}`),
      },
    })
  }
  stages.push({
    id: `g-${Date.now()}-final`,
    name: 'Fase Final',
    route: 'fase-final',
    stage_type: 'bracket',
    start_at: '',
    config: {
      variant: finalVariant.value,
      reference_stage_id: null,
      slots: Array.from({ length: finalists.value }, (_, j) => `Vaga ${j + 1}`),
    },
  })

  props.form.stages = stages
  if (!props.form.max_registrations) props.form.max_registrations = total.value
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="gam-backdrop" @click.self="$emit('close')">
      <div class="gam-panel">
        <div class="gam-header">
          <span class="gam-title">{{ $t('pages.organization.manage.eventWizard.groups.title') }}</span>
          <button class="gam-close" @click="$emit('close')"><font-awesome-icon :icon="['fas', 'xmark']" /></button>
        </div>
        <p class="gam-sub">{{ $t('pages.organization.manage.eventWizard.groups.sub') }}</p>

        <div class="gam-field">
          <label>{{ $t('pages.organization.manage.eventWizard.groups.groupsCount') }}</label>
          <div class="gam-btns">
            <button v-for="n in GROUP_COUNTS" :key="n" type="button" class="gam-btn" :class="{ sel: groupsCount === n }" @click="groupsCount = n">{{ n }}</button>
          </div>
        </div>

        <div class="gam-field">
          <label>{{ $t('pages.organization.manage.eventWizard.groups.perGroup') }}</label>
          <div class="gam-btns">
            <button v-for="n in PER_GROUP" :key="n" type="button" class="gam-btn" :class="{ sel: perGroup === n }" @click="perGroup = n">{{ n }}</button>
          </div>
        </div>

        <div class="gam-field">
          <label>{{ $t('pages.organization.manage.eventWizard.groups.advance') }}</label>
          <div class="gam-btns">
            <button v-for="n in ADVANCE" :key="n" type="button" class="gam-btn" :class="{ sel: advance === n }" @click="advance = n">{{ n }}</button>
          </div>
        </div>

        <div class="gam-summary">
          <span class="gam-chip">{{ groupsCount }} × {{ perGroup }} = {{ total }} {{ $t('pages.organization.manage.eventWizard.groups.total') }}</span>
          <span class="gam-chip hi">{{ finalists }} {{ $t('pages.organization.manage.eventWizard.rev.slots') }} → {{ finalVariant }}</span>
        </div>

        <div class="gam-footer">
          <button class="btn btn-outline-secondary round px-3" @click="$emit('close')">{{ $t('pages.organization.manage.eventWizard.groups.cancel') }}</button>
          <button class="btn btn-primary round px-4" @click="apply">{{ $t('pages.organization.manage.eventWizard.groups.apply') }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.gam-backdrop { position: fixed; inset: 0; z-index: 9980; background: rgba(0,0,0,.55); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 16px; }
.gam-panel { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,.3); width: 480px; max-width: 100%; padding: 22px; }
.gam-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.gam-title { font-size: .95rem; font-weight: 700; color: var(--ehub-ink); }
.gam-close { width: 28px; height: 28px; border-radius: 8px; border: 1px solid var(--ehub-line); background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: .8rem; color: var(--ehub-muted); }
.gam-close:hover { background: var(--ehub-field-bg); }
.gam-sub { font-size: .82rem; color: var(--ehub-muted); margin: 0 0 18px; }
.gam-field { margin-bottom: 14px; }
.gam-field label { font-size: .78rem; font-weight: 600; color: var(--ehub-muted); display: block; margin-bottom: 6px; }
.gam-btns { display: flex; gap: 6px; flex-wrap: wrap; }
.gam-btn { min-width: 40px; padding: 6px 10px; border-radius: 8px; border: 1.5px solid var(--ehub-line); background: var(--ehub-card); color: var(--ehub-ink); font-weight: 700; font-size: .85rem; cursor: pointer; }
.gam-btn:hover { border-color: var(--ehub-primary); }
.gam-btn.sel { border-color: var(--ehub-primary); background: var(--ehub-primary); color: #fff; }
.gam-summary { display: flex; gap: 6px; flex-wrap: wrap; margin: 14px 0 4px; }
.gam-chip { display: inline-flex; align-items: center; font-size: .74rem; font-weight: 600; padding: 3px 10px; border-radius: 50rem; background: var(--ehub-field-bg); color: var(--ehub-muted); border: 1px solid var(--ehub-line); }
.gam-chip.hi { background: var(--ehub-primary-tint); color: var(--ehub-primary); border-color: var(--ehub-primary-border); }
.gam-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; }
</style>
