<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import InitialsAvatar from '@/components/general/InitialsAvatar.vue'
import EhubStatusBadge from '@/components/EhubStatusBadge.vue'
import EhubStreamPanel from '@/components/EhubStreamPanel.vue'
import { matchPublicState, sideName } from './phases.js'
import EhubSetsLine from './EhubSetsLine.vue'

/**
 * One match as a schedule card (public stage page): both sides, phase, date/time,
 * status, score and — when the organizer added one — its own broadcast.
 */
const props = defineProps({
  match: { type: Object, required: true },
  phase: { type: String, default: '' },
  highlight: { type: String, default: null }, // viewer's registration id
})
const { t, locale } = useI18n()

const state = computed(() => matchPublicState(props.match))
const filled = (v) => v !== null && v !== undefined && String(v).trim() !== ''
const played = computed(() => state.value === 'done' && filled(props.match.score_a) && filled(props.match.score_b))
const when = computed(() => {
  const d = props.match.scheduled_at
  if (!d) return ''
  return new Intl.DateTimeFormat(locale.value, { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(d))
})
const mine = computed(() => props.highlight && [props.match.a?.registration_id, props.match.b?.registration_id].includes(props.highlight))
const side = (k) => ({
  name: sideName(t, props.match[k]),
  username: props.match[k]?.team ? null : props.match[k]?.username,
  avatar: props.match[k]?.avatar || '',
  win: state.value === 'done' && props.match.winner === k,
  empty: !props.match[k],
})
</script>

<template>
  <article class="emc" :class="{ live: state === 'live', mine }">
    <div class="emc__body">
      <div class="emc__side">
        <InitialsAvatar :name="side('a').name" :image="side('a').avatar" :size="36" />
        <component :is="side('a').username ? 'router-link' : 'span'" :to="side('a').username ? '/profile/' + side('a').username : undefined" class="emc__name" :class="{ win: side('a').win, tbd: side('a').empty }">{{ side('a').name }}</component>
      </div>
      <div class="emc__center">
        <span v-if="phase" class="emc__phase">{{ phase }}</span>
        <span v-if="when" class="emc__when"><font-awesome-icon :icon="['fas', 'calendar-days']" /> {{ when }}</span>
        <EhubStatusBadge v-if="state !== 'bye'" :state="state" />
        <span v-if="played" class="emc__score">{{ match.score_a }}<span class="sep">–</span>{{ match.score_b }}</span>
        <span v-else-if="state === 'done' || state === 'bye'" class="emc__score vs">{{ state === 'bye' ? $t('competition.bracket.bye') : $t('stages.decided') }}</span>
        <span v-else class="emc__score vs">{{ $t('stages.vs') }}</span>
        <EhubSetsLine v-if="played && match.sets" :sets="match.sets" center />
      </div>
      <div class="emc__side right">
        <InitialsAvatar :name="side('b').name" :image="side('b').avatar" :size="36" />
        <component :is="side('b').username ? 'router-link' : 'span'" :to="side('b').username ? '/profile/' + side('b').username : undefined" class="emc__name" :class="{ win: side('b').win, tbd: side('b').empty }">{{ side('b').name }}</component>
      </div>
    </div>
    <EhubStreamPanel v-if="match.stream_url" :url="match.stream_url" :live="state === 'live'" class="emc__stream" />
  </article>
</template>

<style scoped>
.emc { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 12px; padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; transition: border-color .15s; }
.emc:hover { border-color: color-mix(in srgb, var(--ehub-primary) 35%, var(--ehub-line)); }
.emc.live { border-color: color-mix(in srgb, #e74c3c 30%, var(--ehub-line)); }
.emc.mine { box-shadow: inset 3px 0 0 var(--ehub-primary); }
.emc__body { display: flex; align-items: center; gap: 10px; }
.emc__side { flex: 1; display: flex; align-items: center; gap: 10px; min-width: 0; }
.emc__side.right { flex-direction: row-reverse; text-align: right; }
.emc__name { font-size: .92rem; font-weight: 600; color: var(--ehub-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-decoration: none; }
a.emc__name:hover { text-decoration: underline; }
.emc__name.win { color: var(--ehub-ink); font-weight: 800; }
.emc__name.tbd { font-style: italic; opacity: .7; }
.emc__center { flex: 0 0 auto; display: flex; flex-direction: column; align-items: center; gap: 5px; min-width: 130px; padding: 0 8px; text-align: center; }
.emc__phase { font-size: .66rem; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; color: var(--ehub-primary-text); background: var(--ehub-primary-tint); padding: 2px 9px; border-radius: 50rem; }
.emc__when { font-size: .76rem; color: var(--ehub-muted); display: inline-flex; align-items: center; gap: 5px; }
.emc__score { font-family: 'DM Mono', ui-monospace, monospace; font-weight: 800; font-size: 1.2rem; color: var(--ehub-ink); background: var(--ehub-field-bg); border-radius: 9px; padding: 2px 12px; }
.emc__score .sep { opacity: .4; margin: 0 6px; }
.emc__score.vs { font-size: .78rem; font-weight: 700; color: var(--ehub-muted); }
@media (max-width: 560px) {
  .emc__body { flex-wrap: wrap; justify-content: center; }
  .emc__side, .emc__side.right { flex: 1 1 40%; }
  .emc__center { order: -1; flex-basis: 100%; flex-direction: row; flex-wrap: wrap; justify-content: center; }
}
</style>
