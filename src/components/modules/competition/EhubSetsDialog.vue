<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import EhubDialog from '@/components/modals/EhubDialog.vue'
import { setsWon } from './sets.js'

// Set-by-set score entry shared by group games and bracket matches.
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  match: { type: Object, default: null },
  maxSets: { type: Number, required: true },
  nameA: { type: String, default: '' },
  nameB: { type: String, default: '' },
  busy: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'save'])

const rows = ref([])
watch(() => [props.modelValue, props.match], () => {
  if (!props.modelValue) return
  const saved = props.match?.sets
  rows.value = Array.isArray(saved) && saved.length
    ? saved.map(([a, b]) => ({ a: String(a), b: String(b) }))
    : [{ a: '', b: '' }]
}, { immediate: true })

const need = computed(() => Math.ceil(props.maxSets / 2))
const filled = computed(() => rows.value.filter((r) => r.a !== '' && r.b !== '').map((r) => [Number(r.a), Number(r.b)]))
const won = computed(() => setsWon(filled.value))
const invalid = computed(() => rows.value.some((r) => (r.a !== '' && !/^\d{1,3}$/.test(r.a)) || (r.b !== '' && !/^\d{1,3}$/.test(r.b))))
const tieSet = computed(() => filled.value.some(([a, b]) => a === b))
const decided = computed(() => Math.max(won.value.a, won.value.b) >= need.value)
const canAdd = computed(() => rows.value.length < props.maxSets && !decided.value)
const error = computed(() => {
  if (tieSet.value) return 'competition.sets.tie'
  if (filled.value.length && won.value.a === won.value.b) return 'competition.sets.tied'
  return null
})
const canSave = computed(() => !props.busy && !invalid.value && !error.value && filled.value.length > 0 && filled.value.length === rows.value.length)

// A new set starts with the cursor on its first box.
const grid = ref(null)
async function addSet() {
  rows.value.push({ a: '', b: '' })
  await nextTick()
  const inputs = grid.value?.querySelectorAll('input')
  inputs?.[inputs.length - 2]?.focus()
}
function close() { emit('update:modelValue', false) }
function save() {
  if (canSave.value) emit('save', filled.value)
}
</script>

<template>
  <EhubDialog :model-value="modelValue" :title="$t('competition.sets.title')" :persistent="busy" @update:model-value="emit('update:modelValue', $event)">
    <p class="sd-hint">{{ $t('competition.sets.hint') }}</p>
    <div ref="grid" class="sd-grid">
      <span></span>
      <strong class="sd-name" :title="nameA">{{ nameA }}</strong>
      <span></span>
      <strong class="sd-name" :title="nameB">{{ nameB }}</strong>
      <template v-for="(r, i) in rows" :key="i">
        <span class="sd-lbl">{{ $t('competition.sets.set_n', { n: i + 1 }) }}</span>
        <input v-model.trim="r.a" class="form-control sd-in" inputmode="numeric" maxlength="3" :aria-label="$t('competition.sets.of', { name: nameA, n: i + 1 })" @keydown.enter.prevent="save" />
        <span class="sd-x">×</span>
        <input v-model.trim="r.b" class="form-control sd-in" inputmode="numeric" maxlength="3" :aria-label="$t('competition.sets.of', { name: nameB, n: i + 1 })" @keydown.enter.prevent="save" />
      </template>
    </div>
    <div class="sd-actions">
      <button v-if="canAdd" type="button" class="btn btn-sm btn-outline-secondary round" @click="addSet">
        <font-awesome-icon :icon="['fas', 'plus']" class="me-1" />{{ $t('competition.sets.add') }}
      </button>
      <button v-if="rows.length > 1" type="button" class="btn btn-sm btn-link" @click="rows.pop()">{{ $t('competition.sets.remove') }}</button>
    </div>
    <p v-if="error" class="sd-err" role="alert">{{ $t(error) }}</p>
    <p v-else-if="filled.length" class="sd-res">{{ $t('competition.sets.result', won) }}</p>
    <template #footer>
      <button class="btn btn-outline-secondary round px-3" :disabled="busy" @click="close">{{ $t('pages.event.manage.c.cancel') }}</button>
      <button class="btn btn-primary round px-4" :disabled="!canSave" @click="save">{{ $t('pages.event.manage.c.save') }}</button>
    </template>
  </EhubDialog>
</template>

<style scoped>
.sd-hint { font-size: .82rem; color: var(--ehub-muted); }
.sd-grid { display: grid; grid-template-columns: auto 1fr auto 1fr; gap: 8px 10px; align-items: center; }
.sd-name { font-size: .82rem; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--ehub-ink); }
.sd-lbl { font-size: .78rem; color: var(--ehub-muted); white-space: nowrap; }
.sd-in { text-align: center; font-weight: 700; }
.sd-x { color: var(--ehub-muted); }
.sd-actions { display: flex; gap: 8px; align-items: center; margin-top: 10px; }
.sd-err { margin: 10px 0 0; font-size: .82rem; color: var(--ehub-danger-text, #b42318); }
.sd-res { margin: 10px 0 0; font-size: .85rem; font-weight: 700; color: var(--ehub-ink); }
</style>
