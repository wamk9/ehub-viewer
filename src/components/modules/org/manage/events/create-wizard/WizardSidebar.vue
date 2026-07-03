<script setup>
const props = defineProps({
  steps: { type: Array, required: true }, // [{ name, hint }]
  modelValue: { type: Number, required: true }, // 1-indexed current step
  orgName: { type: String, default: '' },
  orgGrad: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

function initials(name) {
  return (name || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function stepState(n) {
  if (n < props.modelValue) return 'done'
  if (n === props.modelValue) return 'active'
  return ''
}

function goTo(n) {
  if (n < props.modelValue) emit('update:modelValue', n)
}
</script>

<template>
  <div class="wiz-sidebar">
    <div v-if="orgName" class="sb-org-row">
      <div class="sb-org-logo" :style="{ background: orgGrad }">{{ initials(orgName) }}</div>
      <div>
        <div class="sb-org-name">{{ orgName }}</div>
        <div class="sb-org-tag">{{ $t('pages.organization.manage.eventWizard.newEvent') }}</div>
      </div>
    </div>

    <div class="v-steps">
      <div
        v-for="(s, i) in steps" :key="i"
        class="v-step" :class="stepState(i + 1)"
        @click="goTo(i + 1)"
      >
        <div class="v-dot">
          <font-awesome-icon v-if="stepState(i + 1) === 'done'" :icon="['fas', 'check']" style="font-size:.7rem" />
          <template v-else>{{ i + 1 }}</template>
        </div>
        <div class="v-label">
          <div class="v-step-name">{{ s.name }}</div>
          <div class="v-step-hint">{{ s.hint }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wiz-sidebar { background: var(--ehub-card); border-right: 1px solid var(--ehub-line); padding: 28px 20px; position: sticky; top: 60px; height: calc(100vh - 60px); overflow-y: auto; display: flex; flex-direction: column; }
.sb-org-row { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid var(--ehub-line); }
.sb-org-logo { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: .82rem; font-weight: 800; color: #fff; flex-shrink: 0; }
.sb-org-name { font-size: .82rem; font-weight: 700; color: var(--ehub-ink); line-height: 1.2; }
.sb-org-tag { font-size: .7rem; color: var(--ehub-muted); }

.v-steps { display: flex; flex-direction: column; gap: 0; flex: 1; }
.v-step { display: flex; gap: 13px; position: relative; cursor: default; }
.v-step:not(:last-child) { padding-bottom: 6px; }
.v-step:not(:last-child)::after { content: ''; position: absolute; left: 13px; top: 30px; width: 2px; bottom: 0; background: var(--ehub-line); z-index: 0; }
.v-step.done:not(:last-child)::after { background: var(--ehub-primary); }
.v-step.done { cursor: pointer; }
.v-dot { width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0; position: relative; z-index: 1; border: 2px solid var(--ehub-line); background: var(--ehub-card); display: flex; align-items: center; justify-content: center; font-size: .74rem; font-weight: 700; color: var(--ehub-muted); transition: all .2s; margin-top: 2px; }
.v-step.active .v-dot { border-color: var(--ehub-primary); color: var(--ehub-primary); background: var(--ehub-primary-tint); }
.v-step.done .v-dot { border-color: var(--ehub-primary); background: var(--ehub-primary); color: #fff; }
.v-label { padding-bottom: 22px; }
.v-step-name { font-size: .85rem; font-weight: 700; color: var(--ehub-muted); line-height: 1.2; transition: color .15s; }
.v-step-hint { font-size: .73rem; color: var(--ehub-muted); opacity: .65; margin-top: 2px; }
.v-step.active .v-step-name { color: var(--ehub-primary); }
.v-step.done .v-step-name { color: var(--ehub-ink); }

@media (max-width: 860px) {
  .wiz-sidebar { position: static; height: auto; border-right: 0; border-bottom: 1px solid var(--ehub-line); padding: 14px 16px 0; }
  .v-steps { flex-direction: row; gap: 0; overflow-x: auto; padding: 10px 0 14px; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
  .v-steps::-webkit-scrollbar { display: none; }
  .v-step { flex-direction: column; align-items: center; flex: 1 0 62px; gap: 5px; padding-bottom: 0; position: relative; }
  .v-step::after { display: none; }
  .v-step:not(:last-child)::before { content: ''; position: absolute; top: 15px; left: calc(50% + 15px); right: calc(-50% + 15px); height: 2px; background: var(--ehub-line); z-index: 0; }
  .v-step.done:not(:last-child)::before { background: var(--ehub-primary); }
  .v-dot { position: relative; z-index: 1; }
  .v-label { padding-bottom: 0; text-align: center; }
  .v-step-name { font-size: .67rem; font-weight: 600; line-height: 1.3; }
  .v-step-hint { display: none; }
  .sb-org-row { display: none; }
}
</style>
