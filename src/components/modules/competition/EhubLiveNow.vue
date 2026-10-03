<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import EhubStreamPanel from '@/components/EhubStreamPanel.vue'
import { bracketRounds, matchPhase, sideName, stagePublicState } from './phases.js'

/**
 * "Ao vivo agora": every stage, session and match happening right now, each with
 * its broadcast (its own link, or the event's for a running stage). Hidden when nothing is live.
 */
const props = defineProps({
  event: { type: Object, required: true },
})
const emit = defineEmits(['go'])
const { t } = useI18n()

const eventStream = computed(() => props.event.streaming_youtube
  || (props.event.streaming_twitch ? 'https://www.twitch.tv/' + String(props.event.streaming_twitch).replace(/^.*twitch\.tv\//i, '') : ''))

const items = computed(() => {
  const out = []
  ;(props.event.stages || []).forEach((st, i) => {
    const stageLabel = t('stages.stage_n', { n: i + 1 }) + ' — ' + st.name
    const total = bracketRounds(st.matches)
    const liveMatches = (st.matches || []).filter((m) => m.status === 'live')
    const liveRounds = (st.rounds || []).filter((r) => r.in_progress && !r.finished)
    liveMatches.forEach((m) => out.push({
      key: 'm' + m.id, route: st.route, phase: stageLabel + ' · ' + matchPhase(t, m, total),
      a: sideName(t, m.a), b: sideName(t, m.b), score: [m.score_a, m.score_b].every((v) => v !== null && v !== undefined && String(v).trim() !== '') ? `${m.score_a} – ${m.score_b}` : null,
      url: m.stream_url || st.stream_url || '',
    }))
    liveRounds.forEach((r) => out.push({ key: 'r' + r.id, route: st.route, phase: stageLabel, title: r.name, url: r.stream_url || st.stream_url || eventStream.value }))
    if (!liveMatches.length && !liveRounds.length && stagePublicState(st) === 'live') {
      out.push({ key: 's' + st.id, route: st.route, phase: stageLabel, title: st.name, url: st.stream_url || eventStream.value })
    }
  })
  return out
})
</script>

<template>
  <section v-if="items.length" class="eln" :aria-label="$t('stages.live_now')">
    <header class="eln__hd">
      <span class="eln__ring" aria-hidden="true"></span>
      <h3 class="eln__title">{{ $t('stages.live_now') }}</h3>
      <span class="eln__count">{{ $t('stages.live_count', { n: items.length }, items.length) }}</span>
    </header>
    <div class="eln__grid">
      <article v-for="it in items" :key="it.key" class="eln__card">
        <div class="eln__top">
          <span class="eln__phase">{{ it.phase }}</span>
          <button type="button" class="eln__go" @click="emit('go', it.route)">{{ $t('stages.see_stage') }}</button>
        </div>
        <div class="eln__body">
          <template v-if="it.a">
            <span class="eln__name">{{ it.a }}</span>
            <span class="eln__score">{{ it.score || $t('stages.vs') }}</span>
            <span class="eln__name r">{{ it.b }}</span>
          </template>
          <span v-else class="eln__name c">{{ it.title }}</span>
        </div>
        <EhubStreamPanel v-if="it.url" :url="it.url" live compact class="eln__stream" />
      </article>
    </div>
  </section>
</template>

<style scoped>
.eln { margin-bottom: 18px; }
.eln__hd { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.eln__ring { width: 10px; height: 10px; border-radius: 50%; background: #e74c3c; box-shadow: 0 0 0 0 rgba(231, 76, 60, .5); animation: eln-ring 1.5s ease-out infinite; }
@keyframes eln-ring { 0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, .5); } 100% { box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); } }
@media (prefers-reduced-motion: reduce) { .eln__ring { animation: none; } }
.eln__title { font-size: .98rem; font-weight: 800; color: var(--ehub-ink); margin: 0; }
.eln__count { font-size: .72rem; font-weight: 700; color: #d63a2c; background: color-mix(in srgb, #e74c3c 13%, transparent); border: 1px solid color-mix(in srgb, #e74c3c 30%, var(--ehub-line)); padding: 1px 9px; border-radius: 50rem; }
.eln__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }
.eln__card { background: var(--ehub-card); border: 1px solid color-mix(in srgb, #e74c3c 22%, var(--ehub-line)); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
.eln__top { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 13px; border-bottom: 1px solid var(--ehub-line); background: color-mix(in srgb, #e74c3c 5%, var(--ehub-card)); }
.eln__phase { font-size: .7rem; font-weight: 700; color: var(--ehub-muted); text-transform: uppercase; letter-spacing: .04em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.eln__go { background: none; border: 0; color: var(--ehub-primary-text); font-size: .74rem; font-weight: 700; cursor: pointer; white-space: nowrap; padding: 0; }
.eln__go:hover { text-decoration: underline; }
.eln__body { display: flex; align-items: center; gap: 8px; padding: 11px 13px; }
.eln__name { flex: 1; min-width: 0; font-weight: 700; color: var(--ehub-ink); font-size: .88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.eln__name.r { text-align: right; }
.eln__name.c { text-align: center; }
.eln__score { font-family: 'DM Mono', ui-monospace, monospace; font-weight: 800; color: #d63a2c; background: color-mix(in srgb, #e74c3c 12%, var(--ehub-field-bg)); border-radius: 7px; padding: 2px 9px; font-size: .86rem; }
.eln__stream { padding: 0 13px 12px; }
</style>
