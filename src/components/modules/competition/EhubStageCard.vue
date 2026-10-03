<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import EhubStatusBadge from '@/components/EhubStatusBadge.vue'
import EhubStreamPanel from '@/components/EhubStreamPanel.vue'
import EhubPodium from '@/components/EhubPodium.vue'
import EhubCalendarButton from '@/components/EhubCalendarButton.vue'
import EhubBracket from './EhubBracket.vue'
import EhubGroupTable from './EhubGroupTable.vue'
import EhubMatchCard from './EhubMatchCard.vue'
import EhubStageResultsTable from './EhubStageResultsTable.vue'
import { bracketRounds, matchPhase, roundPublicState, stagePublicState } from './phases.js'

/**
 * Public card of one stage (Claude Design "Event" style): number, name, status,
 * date/time, place, the organizer's extra info, its sessions, the podium (or what
 * happens next), its own broadcast and — expanded — full result, bracket/groups
 * and every match with its schedule and broadcast.
 */
const props = defineProps({
  stage: { type: Object, required: true },
  index: { type: Number, required: true },
  event: { type: Object, required: true },
  highlight: { type: String, default: null },
  focus: { type: Boolean, default: false },
})
const { t, locale } = useI18n()

const ICON = { points: 'list-ol', bracket: 'sitemap', group: 'table-cells', time: 'stopwatch' }
const state = computed(() => stagePublicState(props.stage))
const results = computed(() => props.stage.results || [])
const hasDates = computed(() => !!props.stage.start_at || (props.stage.matches || []).some((m) => m.scheduled_at))
const matches = computed(() => props.stage.matches || [])
const hasMatches = computed(() => matches.value.some((m) => m.kind === 'bracket' || m.kind === 'group'))
const totalRounds = computed(() => bracketRounds(matches.value))

const dt = (d, withTime = true) => (d ? new Intl.DateTimeFormat(locale.value, withTime && /T(?!00:00)/.test(d)
  ? { weekday: 'short', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' }
  : { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(d)) : '')

const info = computed(() => {
  const values = props.stage?.config?.info || {}
  return (Array.isArray(props.event?.stage_fields) ? props.event.stage_fields : [])
    .filter((f) => f?.key && String(values[f.key] ?? '').trim())
    .map((f) => ({ ...f, value: values[f.key] }))
})
const mapsUrl = computed(() => (props.stage.location ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(props.stage.location) : ''))

// Own broadcast, or the event's while the stage is running.
const streamUrl = computed(() => props.stage.stream_url
  || (state.value === 'live' ? (props.event.streaming_youtube || (props.event.streaming_twitch ? 'https://www.twitch.tv/' + String(props.event.streaming_twitch).replace(/^.*twitch\.tv\//i, '') : '')) : ''))

const podium = computed(() => {
  // Brackets only have a podium once the final is played (losers are ranked as they go out).
  if (props.stage.stage_type === 'group' || !props.stage.results_published) return []
  if (props.stage.stage_type === 'bracket' && !props.stage.finished) return []
  return results.value.filter((r) => r.position && r.position <= 3).sort((a, b) => a.position - b.position).map((r) => ({
    key: r.registration_id || r.position,
    position: r.position,
    name: r.team?.name || r.user?.name || t('events.show.removed_participant'),
    username: r.team ? null : r.user?.username,
    sub: '',
    value: props.stage.stage_type === 'time' ? (r.result_data?.time || '—') : (r.score !== null && r.score !== undefined ? t('stages.pts', { n: r.score }) : ''),
    mine: r.registration_id === props.highlight,
  }))
})

const open = ref(props.focus || state.value === 'live')
watch(() => props.focus, (f) => { if (f) open.value = true })
const canOpen = computed(() => (results.value.length > 0 && props.stage.results_published) || hasMatches.value)

// Matches grouped by phase, in play order.
const matchGroups = computed(() => {
  const list = matches.value.filter((m) => (m.kind === 'bracket' || m.kind === 'group') && m.status !== 'bye')
    .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'group' ? -1 : 1) || a.round - b.round || String(a.group_key || '').localeCompare(String(b.group_key || '')) || a.slot - b.slot)
  const groups = []
  for (const m of list) {
    const label = matchPhase(t, m, totalRounds.value)
    const g = groups.find((x) => x.label === label)
    if (g) g.matches.push(m)
    else groups.push({ label, matches: [m] })
  }
  return groups
})
const liveMatches = computed(() => matches.value.filter((m) => m.status === 'live').length)
// Everyone in the stage: from the matches (bracket / groups) or from the result.
const participants = computed(() => {
  const ids = new Set(results.value.map((r) => r.registration_id).filter(Boolean))
  matches.value.forEach((m) => { if (m.a?.registration_id) ids.add(m.a.registration_id); if (m.b?.registration_id) ids.add(m.b.registration_id) })
  return ids.size
})
</script>

<template>
  <article :id="'stage-' + stage.route" class="esc" :class="{ live: state === 'live', focus }">
    <header class="esc__head">
      <div class="esc__ico" aria-hidden="true"><font-awesome-icon :icon="['fas', ICON[stage.stage_type] || 'layer-group']" /></div>
      <div class="esc__info">
        <h3 class="esc__title">
          <span class="esc__n">{{ $t('stages.stage_n', { n: index + 1 }) }}</span>
          <span>{{ stage.name }}</span>
          <EhubStatusBadge :state="state" />
          <span v-if="liveMatches" class="esc__livecount">{{ $t('stages.live_matches', { n: liveMatches }, liveMatches) }}</span>
        </h3>
        <div class="esc__meta">
          <span v-if="stage.start_at"><font-awesome-icon :icon="['fas', 'calendar-days']" /> {{ dt(stage.start_at) }}</span>
          <a v-if="stage.location" :href="mapsUrl" target="_blank" rel="noopener noreferrer"><font-awesome-icon :icon="['fas', 'location-dot']" /> {{ stage.location }}</a>
          <span v-else-if="event.runmode === 'online'"><font-awesome-icon :icon="['fas', 'desktop']" /> {{ $t('stages.online') }}</span>
          <span v-if="participants"><font-awesome-icon :icon="['fas', 'users']" /> {{ $t('stages.participants', { n: participants }, participants) }}</span>
          <EhubCalendarButton v-if="hasDates && state !== 'done' && event.organization?.route" :org-route="event.organization.route" :event-route="event.route" :stage="stage.route" compact />
        </div>
        <div v-if="info.length" class="esc__chips">
          <span v-for="f in info" :key="f.key" class="esc__chip"><font-awesome-icon :icon="['fas', f.icon || 'circle-info']" /> <span class="lbl">{{ f.name }}:</span> {{ f.value }}</span>
        </div>
      </div>
    </header>

    <p v-if="stage.description" class="esc__desc">{{ stage.description }}</p>

    <!-- Sessions (rounds) of the stage, each with its time, status and broadcast -->
    <ul v-if="stage.rounds?.length" class="esc__sessions" :aria-label="$t('stages.sessions')">
      <li v-for="r in stage.rounds" :key="r.id" class="esc__session" :class="{ live: roundPublicState(r) === 'live' }">
        <div class="esc__session-row">
          <span class="esc__session-name">{{ r.name }}</span>
          <span v-if="r.start_at" class="esc__session-when">{{ dt(r.start_at) }}</span>
          <EhubStatusBadge :state="roundPublicState(r)" />
        </div>
        <EhubStreamPanel v-if="r.stream_url" :url="r.stream_url" :live="roundPublicState(r) === 'live'" compact />
      </li>
    </ul>

    <!-- Podium / what's next -->
    <div class="esc__body">
      <EhubPodium v-if="podium.length" :rows="podium" />
      <div v-else-if="!hasMatches" class="esc__pending">
        <font-awesome-icon :icon="['fas', state === 'scheduled' ? 'clock' : 'hourglass-half']" />
        {{ $t(state === 'scheduled' ? 'stages.awaiting' : 'stages.result_after') }}
      </div>
    </div>

    <footer class="esc__foot">
      <EhubStreamPanel v-if="streamUrl" :url="streamUrl" :live="state === 'live'" class="esc__stream" />
      <button v-if="canOpen" type="button" class="esc__toggle" :aria-expanded="open" @click="open = !open">
        <font-awesome-icon :icon="['fas', open ? 'chevron-up' : 'chevron-down']" />
        {{ open ? $t('stages.hide_details') : $t(hasMatches ? 'stages.show_matches' : 'stages.show_results') }}
      </button>
    </footer>

    <!-- Details: full result, bracket / groups and every match -->
    <div v-if="open && canOpen" class="esc__details">
      <EhubStageResultsTable v-if="stage.stage_type !== 'group' && results.length && (stage.results_published || stage.finished) && (stage.stage_type !== 'bracket' || stage.finished)" :stage="stage" :highlight="highlight" />
      <div v-if="stage.stage_type === 'bracket' && matches.some((m) => m.kind === 'bracket')" class="esc__block">
        <h4 class="esc__block-title">{{ $t('competition.bracket.title') }}</h4>
        <EhubBracket :matches="matches" :highlight="highlight" />
      </div>
      <div v-if="stage.stage_type === 'group' && matches.some((m) => m.kind === 'group')" class="esc__block">
        <h4 class="esc__block-title">{{ $t('stages.table') }}</h4>
        <EhubGroupTable :results="results" :highlight="highlight" />
      </div>
      <div v-if="matchGroups.length" class="esc__block">
        <h4 class="esc__block-title">{{ $t('stages.matches') }}</h4>
        <section v-for="g in matchGroups" :key="g.label" class="esc__phase">
          <p class="esc__phase-title">{{ g.label }}</p>
          <div class="esc__matches">
            <EhubMatchCard v-for="m in g.matches" :key="m.id" :match="m" :highlight="highlight" />
          </div>
        </section>
      </div>
    </div>
  </article>
</template>

<style scoped>
.esc { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 14px; padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; scroll-margin-top: 80px; }
.esc.live { border-color: color-mix(in srgb, #e74c3c 30%, var(--ehub-line)); }
.esc.focus { box-shadow: 0 0 0 3px color-mix(in srgb, var(--ehub-primary) 30%, transparent); }
.esc__head { display: flex; gap: 14px; align-items: flex-start; }
.esc__ico { width: 44px; height: 44px; border-radius: 11px; background: var(--ehub-field-bg); color: var(--org-accent-text, var(--ehub-primary)); display: flex; align-items: center; justify-content: center; font-size: 1.05rem; flex-shrink: 0; }
.esc__info { flex: 1; min-width: 0; }
.esc__title { font-size: 1rem; font-weight: 800; color: var(--ehub-ink); margin: 0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.esc__n { color: var(--ehub-muted); font-weight: 700; }
.esc__livecount { font-size: .72rem; font-weight: 700; color: #d63a2c; }
.esc__meta { display: flex; flex-wrap: wrap; gap: 6px 16px; margin-top: 4px; font-size: .82rem; color: var(--ehub-muted); }
.esc__meta svg { color: var(--org-accent-text, var(--ehub-primary)); margin-right: 3px; }
.esc__meta a { color: var(--ehub-ink); text-decoration: none; }
.esc__meta a:hover { text-decoration: underline; }
.esc__chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.esc__chip { font-size: .74rem; font-weight: 600; background: var(--ehub-field-bg); color: var(--ehub-ink); border: 1px solid var(--ehub-line); padding: 2px 10px; border-radius: 50rem; display: inline-flex; align-items: center; gap: 5px; }
.esc__chip .lbl { color: var(--ehub-muted); }
.esc__desc { margin: 0; font-size: .86rem; color: var(--ehub-muted); white-space: pre-line; }
.esc__sessions { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.esc__session { border: 1px solid var(--ehub-line); border-radius: 10px; padding: 8px 12px; display: flex; flex-direction: column; gap: 8px; }
.esc__session.live { border-color: color-mix(in srgb, #e74c3c 30%, var(--ehub-line)); }
.esc__session-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.esc__session-name { font-weight: 700; color: var(--ehub-ink); font-size: .88rem; }
.esc__session-when { font-size: .78rem; color: var(--ehub-muted); flex: 1; }
.esc__pending { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; color: var(--ehub-muted); font-size: .86rem; border: 1px dashed var(--ehub-line); border-radius: 10px; }
.esc__foot { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.esc__stream { flex: 1; min-width: 240px; }
.esc__toggle { margin-left: auto; display: inline-flex; align-items: center; gap: 7px; background: transparent; border: 1px solid var(--ehub-line); color: var(--ehub-ink); font-size: .78rem; font-weight: 700; padding: 6px 14px; border-radius: 50rem; cursor: pointer; }
.esc__toggle:hover { border-color: var(--ehub-primary); }
.esc__details { border-top: 1px solid var(--ehub-line); padding-top: 14px; display: flex; flex-direction: column; gap: 18px; }
.esc__block-title { font-size: .78rem; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: var(--ehub-muted); margin: 0 0 10px; display: flex; align-items: center; gap: 10px; }
.esc__block-title::after { content: ''; flex: 1; height: 1px; background: var(--ehub-line); }
.esc__phase + .esc__phase { margin-top: 14px; }
.esc__phase-title { font-size: .76rem; font-weight: 700; color: var(--ehub-muted); text-transform: uppercase; letter-spacing: .04em; margin: 0 0 8px; }
.esc__matches { display: flex; flex-direction: column; gap: 8px; }
</style>
