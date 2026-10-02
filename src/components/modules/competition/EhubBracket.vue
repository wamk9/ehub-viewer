<script setup>
import { computed, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import InitialsAvatar from '@/components/general/InitialsAvatar.vue'

const props = defineProps({
  matches: { type: Array, required: true },   // stage.matches with kind = bracket
  editable: { type: Boolean, default: false },
  highlight: { type: String, default: null },  // registration id of the viewer
  busyId: { type: String, default: null },
})
const emit = defineEmits(['decide'])
const { t } = useI18n()

const rounds = computed(() => {
  const by = {}
  props.matches.filter((m) => m.kind === 'bracket').forEach((m) => { (by[m.round] ||= []).push(m) })
  return Object.keys(by).map(Number).sort((a, b) => a - b).map((r) => ({ round: r, matches: by[r].sort((a, b) => a.slot - b.slot) }))
})
const total = computed(() => rounds.value.length)

function roundName(r) {
  const fromEnd = total.value - r
  if (fromEnd === 0) return t('competition.bracket.final')
  if (fromEnd === 1) return t('competition.bracket.semi')
  if (fromEnd === 2) return t('competition.bracket.quarter')
  if (fromEnd === 3) return t('competition.bracket.r16')
  return t('competition.bracket.round', { n: r })
}

// Scores typed before choosing the winner.
const scores = reactive({})
watch(() => props.matches, (list) => {
  list.forEach((m) => { scores[m.id] = { a: m.score_a ?? '', b: m.score_b ?? '' } })
}, { immediate: true })

function canPick(m) {
  return props.editable && m.status !== 'bye' && m.a && m.b && props.busyId !== m.id
}
function pick(m, side) {
  if (!canPick(m)) return
  emit('decide', { match: m, winner: m.winner === side ? null : side, score_a: scores[m.id].a, score_b: scores[m.id].b })
}
function saveScore(m) {
  if (!props.editable || !m.winner) return
  emit('decide', { match: m, winner: m.winner, score_a: scores[m.id].a, score_b: scores[m.id].b })
}
function label(p, m) {
  if (p) return p.name || p.username || t('events.show.removed_participant')
  return m.status === 'bye' ? t('competition.bracket.bye') : t('competition.bracket.tbd')
}
</script>

<template>
  <div class="bk-scroll" role="region" :aria-label="$t('competition.bracket.title')">
    <div class="bk">
      <div v-for="col in rounds" :key="col.round" class="bk-col">
        <div class="bk-col__hd">{{ roundName(col.round) }}</div>
        <div class="bk-col__list">
          <template v-for="m in col.matches" :key="m.id">
          <div v-if="col.round === total && m.slot === 2" class="bk-third-lbl">{{ $t('competition.bracket.third_place') }}</div>
          <div class="bk-match" :class="{ bye: m.status === 'bye', done: m.status === 'done', busy: busyId === m.id }">
            <template v-for="side in ['a', 'b']" :key="side">
              <div class="bk-row"
                :class="{ win: m.winner === side, lose: m.winner && m.winner !== side && m.status === 'done', me: highlight && m[side]?.registration_id === highlight, empty: !m[side], click: canPick(m) }"
                :role="canPick(m) ? 'button' : null" :tabindex="canPick(m) ? 0 : null"
                :aria-label="canPick(m) ? $t('competition.bracket.pick', { name: label(m[side], m) }) : null"
                @click="pick(m, side)" @keydown.enter.prevent="pick(m, side)">
                <InitialsAvatar v-if="m[side]" :name="label(m[side], m)" :image="m[side].avatar" :size="20" />
                <span class="bk-name">{{ label(m[side], m) }}</span>
                <input v-if="editable && m.a && m.b && m.status !== 'bye'" v-model="scores[m.id][side]" class="bk-score-in" maxlength="20" inputmode="numeric"
                  :aria-label="$t('competition.bracket.score_of', { name: label(m[side], m) })" @click.stop @keydown.enter.prevent="saveScore(m)" @blur="saveScore(m)" />
                <span v-else-if="m['score_' + side] !== null && m['score_' + side] !== undefined && m['score_' + side] !== ''" class="bk-score">{{ m['score_' + side] }}</span>
                <font-awesome-icon v-if="m.winner === side && m.status !== 'bye'" :icon="['fas', 'check']" class="bk-tick" />
              </div>
            </template>
          </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bk-scroll { overflow-x: auto; padding-bottom: 6px; }
.bk { display: flex; gap: 18px; min-width: max-content; }
.bk-col { display: flex; flex-direction: column; width: 220px; }
.bk-col__hd { font-size: .7rem; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--ehub-muted); margin-bottom: 8px; text-align: center; }
.bk-col__list { flex: 1; display: flex; flex-direction: column; justify-content: space-around; gap: 12px; }
.bk-match { border: 1px solid var(--ehub-line); border-radius: 10px; background: var(--ehub-card); overflow: hidden; }
.bk-match.bye { opacity: .6; }
.bk-match.busy { opacity: .5; pointer-events: none; }
.bk-row { display: flex; align-items: center; gap: 8px; padding: 7px 10px; font-size: .82rem; min-height: 36px; }
.bk-row + .bk-row { border-top: 1px solid var(--ehub-line); }
.bk-row.click { cursor: pointer; }
.bk-row.click:hover, .bk-row.click:focus-visible { background: var(--ehub-primary-tint); outline: none; }
.bk-row.win { font-weight: 700; background: color-mix(in srgb, #1f8a5b 12%, var(--ehub-card)); }
.bk-row.lose .bk-name { color: var(--ehub-muted); text-decoration: line-through; }
.bk-row.me { box-shadow: inset 3px 0 0 var(--ehub-primary); }
.bk-row.empty .bk-name { color: var(--ehub-muted); font-style: italic; }
.bk-name { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--ehub-ink); }
.bk-score { font-weight: 700; font-variant-numeric: tabular-nums; color: var(--ehub-ink); }
.bk-score-in { width: 42px; padding: 2px 6px; font-size: .8rem; border: 1px solid var(--ehub-line); border-radius: 6px; background: var(--ehub-field-bg); color: var(--ehub-ink); text-align: center; }
.bk-third-lbl { font-size: .68rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--ehub-muted); text-align: center; margin-top: 6px; }
.bk-tick { color: var(--ehub-success-text); }
</style>
