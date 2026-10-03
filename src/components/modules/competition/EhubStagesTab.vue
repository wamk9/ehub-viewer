<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import EhubLiveNow from './EhubLiveNow.vue'
import EhubStageCard from './EhubStageCard.vue'
import { sideName, stagePublicState } from './phases.js'

/**
 * Public "Etapas" tab: what is live now, the viewer's next match, filters
 * (all / live / upcoming / done) and one card per stage.
 */
const props = defineProps({
  event: { type: Object, required: true },
  highlight: { type: String, default: null }, // viewer's registration id
  focus: { type: String, default: null },     // stage route opened from a link
})
const { t } = useI18n()

const FILTERS = ['all', 'live', 'scheduled', 'done']
const filter = ref('all')
const stages = computed(() => props.event.stages || [])
const counts = computed(() => {
  const c = { all: stages.value.length, live: 0, scheduled: 0, done: 0 }
  stages.value.forEach((s) => { c[stagePublicState(s)]++ })
  return c
})
const shown = computed(() => stages.value
  .map((s, i) => ({ stage: s, index: i }))
  .filter(({ stage }) => filter.value === 'all' || stagePublicState(stage) === filter.value))

const myNext = computed(() => {
  if (!props.highlight) return null
  for (const st of stages.value) {
    const m = (st.matches || []).find((x) => ['pending', 'live'].includes(x.status) && x.a && x.b
      && (x.a.registration_id === props.highlight || x.b.registration_id === props.highlight))
    if (m) return { stage: st, match: m, rival: sideName(t, m.a.registration_id === props.highlight ? m.b : m.a) }
  }
  return null
})

function goStage(route) {
  filter.value = 'all'
  requestAnimationFrame(() => document.getElementById('stage-' + route)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}
</script>

<template>
  <div class="est">
    <div v-if="!stages.length" class="ev-empty">
      <font-awesome-icon :icon="['fas', 'layer-group']" />
      <p class="mb-0 mt-2">{{ $t('events.show.stages.empty') }}</p>
    </div>
    <template v-else>
      <EhubLiveNow :event="event" @go="goStage" />

      <button v-if="myNext" type="button" class="est__mine" @click="goStage(myNext.stage.route)">
        <font-awesome-icon :icon="['fas', 'bolt']" class="est__mine-ico" />
        <span>
          <span class="est__mine-lbl">{{ $t('competition.bracket.next_match') }} · {{ myNext.stage.name }}</span>
          <strong>{{ $t('competition.bracket.vs') }} {{ myNext.rival }}</strong>
          <span v-if="myNext.match.scheduled_at" class="est__mine-when">{{ new Intl.DateTimeFormat($i18n.locale, { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(myNext.match.scheduled_at)) }}</span>
        </span>
      </button>

      <div class="est__filters" role="tablist" :aria-label="$t('stages.filter_label')">
        <button v-for="f in FILTERS" :key="f" type="button" role="tab" :aria-selected="filter === f" class="est__chip" :class="{ active: filter === f }" :disabled="f !== 'all' && !counts[f]" @click="filter = f">
          {{ $t('stages.filter.' + f) }} <span class="est__chip-n">{{ counts[f] }}</span>
        </button>
      </div>

      <div class="est__list">
        <EhubStageCard v-for="s in shown" :key="s.stage.id" :stage="s.stage" :index="s.index" :event="event" :highlight="highlight" :focus="focus === s.stage.route" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.est__mine { width: 100%; text-align: left; display: flex; align-items: center; gap: 12px; padding: 12px 16px; margin-bottom: 16px; border-radius: 12px; border: 1px solid color-mix(in srgb, var(--ehub-primary) 35%, var(--ehub-line)); background: var(--ehub-primary-tint); color: var(--ehub-ink); cursor: pointer; }
.est__mine > span { display: flex; flex-direction: column; }
.est__mine-ico { color: var(--ehub-primary-text); font-size: 1.1rem; }
.est__mine-lbl { font-size: .74rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: var(--ehub-muted); }
.est__mine-when { font-size: .8rem; color: var(--ehub-muted); }
.est__filters { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 14px; }
.est__chip { background: var(--ehub-field-bg); border: 1px solid var(--ehub-line); color: var(--ehub-muted); font-size: .78rem; font-weight: 600; padding: 5px 14px; border-radius: 50rem; cursor: pointer; display: inline-flex; gap: 6px; align-items: center; }
.est__chip:hover:not(:disabled) { border-color: var(--ehub-primary); color: var(--ehub-ink); }
.est__chip.active { background: var(--ehub-primary-strong, var(--ehub-primary)); border-color: var(--ehub-primary); color: #fff; }
.est__chip:disabled { opacity: .5; cursor: default; }
.est__chip-n { font-size: .7rem; opacity: .8; }
.est__list { display: flex; flex-direction: column; gap: 12px; }
</style>
