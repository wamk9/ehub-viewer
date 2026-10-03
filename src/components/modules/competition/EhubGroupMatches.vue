<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import EhubSetsDialog from './EhubSetsDialog.vue'
import EhubSetsLine from './EhubSetsLine.vue'

const props = defineProps({
  matches: { type: Array, required: true },     // stage.matches with kind = group
  editable: { type: Boolean, default: false },
  highlight: { type: String, default: null },
  busyId: { type: String, default: null },
  maxSets: { type: Number, default: 0 },          // > 0: set sport, scores come from the sets dialog
})
const emit = defineEmits(['save'])
const { t } = useI18n()

const rounds = computed(() => {
  const by = {}
  props.matches.filter((m) => m.kind === 'group').forEach((m) => { (by[m.round] ||= []).push(m) })
  return Object.keys(by).map(Number).sort((a, b) => a - b).map((r) => ({ round: r, matches: by[r].sort((a, b) => a.slot - b.slot) }))
})

const draft = reactive({})
watch(() => props.matches, (list) => {
  list.forEach((m) => { draft[m.id] = { a: m.score_a ?? '', b: m.score_b ?? '' } })
}, { immediate: true })

const name = (p) => p?.name || p?.username || t('events.show.removed_participant')
const changed = (m) => String(draft[m.id].a) !== String(m.score_a ?? '') || String(draft[m.id].b) !== String(m.score_b ?? '')
const complete = (m) => draft[m.id].a !== '' && draft[m.id].b !== ''
function save(m) {
  if (!complete(m) || !changed(m)) return
  emit('save', { match: m, score_a: String(draft[m.id].a), score_b: String(draft[m.id].b) })
}
function clear(m) {
  emit('save', { match: m, score_a: null, score_b: null })
}

const setsOf = ref(null)
const setsOpen = ref(false)
function openSets(m) { setsOf.value = m; setsOpen.value = true }
function saveSets(sets) {
  emit('save', { match: setsOf.value, sets })
  setsOpen.value = false
}
</script>

<template>
  <div class="gm">
    <div v-for="r in rounds" :key="r.round" class="gm-round">
      <div class="gm-round__hd">{{ $t('competition.group.round', { n: r.round }) }}</div>
      <div v-for="m in r.matches" :key="m.id" class="gm-row" :class="{ done: m.status === 'done', me: highlight && (m.a?.registration_id === highlight || m.b?.registration_id === highlight), busy: busyId === m.id, sets: editable && maxSets }">
        <span class="gm-name a" :class="{ win: m.winner === 'a' }">{{ name(m.a) }}</span>
        <button v-if="editable && maxSets" class="gm-sets" :disabled="busyId === m.id" :aria-label="$t('competition.sets.enter')" @click="openSets(m)">
          {{ m.status === 'done' ? `${m.score_a} × ${m.score_b}` : $t('competition.sets.enter') }}
        </button>
        <template v-else-if="editable">
          <input v-model="draft[m.id].a" class="gm-in" inputmode="numeric" maxlength="4" :aria-label="$t('competition.bracket.score_of', { name: name(m.a) })" @keydown.enter.prevent="save(m)" />
          <span class="gm-x">×</span>
          <input v-model="draft[m.id].b" class="gm-in" inputmode="numeric" maxlength="4" :aria-label="$t('competition.bracket.score_of', { name: name(m.b) })" @keydown.enter.prevent="save(m)" />
        </template>
        <span v-else class="gm-score">{{ m.status === 'done' ? `${m.score_a} × ${m.score_b}` : '× ' }}</span>
        <span class="gm-name b" :class="{ win: m.winner === 'b' }">{{ name(m.b) }}</span>
        <template v-if="editable">
          <button v-if="!maxSets" :aria-label="$t('a11y.confirm')" :title="$t('a11y.confirm')" class="btn btn-sm round px-2" :class="complete(m) && changed(m) ? 'btn-primary' : 'btn-outline-secondary'" :disabled="!complete(m) || !changed(m) || busyId === m.id" @click="save(m)">
            <font-awesome-icon :icon="['fas', 'check']" />
          </button>
          <button v-if="m.status === 'done'" class="btn btn-sm btn-link px-1" :title="$t('competition.group.clear')" :aria-label="$t('competition.group.clear')" :disabled="busyId === m.id" @click="clear(m)">
            <font-awesome-icon :icon="['fas', 'rotate-left']" />
          </button>
        </template>
        <EhubSetsLine v-if="m.sets" :sets="m.sets" center class="gm-setline" />
      </div>
    </div>
    <EhubSetsDialog v-if="maxSets" v-model="setsOpen" :match="setsOf" :max-sets="maxSets" :name-a="name(setsOf?.a)" :name-b="name(setsOf?.b)" :busy="!!busyId" @save="saveSets" />
  </div>
</template>

<style scoped>
.gm { display: flex; flex-direction: column; gap: 14px; }
.gm-round__hd { font-size: .7rem; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--ehub-muted); margin-bottom: 6px; }
.gm-row { display: grid; grid-template-columns: minmax(0, 1fr) auto auto auto minmax(0, 1fr) auto auto; align-items: center; gap: 6px; padding: 6px 8px; border: 1px solid var(--ehub-line); border-radius: 9px; margin-bottom: 6px; background: var(--ehub-card); font-size: .83rem; }
.gm-row:not(:has(input)) { grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); }
.gm-row.sets { grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) 28px; }
.gm-setline { grid-column: 1 / -1; }
.gm-sets { min-width: 92px; padding: 3px 10px; font-size: .78rem; font-weight: 700; border: 1px dashed var(--ehub-line); border-radius: 7px; background: var(--ehub-field-bg); color: var(--ehub-ink); }
.gm-sets:hover { border-color: var(--ehub-primary); }
.gm-row.me { box-shadow: inset 3px 0 0 var(--ehub-primary); }
.gm-row.busy { opacity: .5; }
.gm-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--ehub-ink); }
.gm-name.a { text-align: right; }
.gm-name.win { font-weight: 700; }
.gm-in { width: 44px; padding: 3px 6px; text-align: center; font-weight: 700; border: 1px solid var(--ehub-line); border-radius: 7px; background: var(--ehub-field-bg); color: var(--ehub-ink); }
.gm-x { color: var(--ehub-muted); }
.gm-score { font-weight: 800; font-variant-numeric: tabular-nums; color: var(--ehub-ink); text-align: center; min-width: 54px; }
</style>
