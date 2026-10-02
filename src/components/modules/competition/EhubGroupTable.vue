<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import InitialsAvatar from '@/components/general/InitialsAvatar.vue'

const props = defineProps({
  results: { type: Array, required: true },     // stage.results of a group stage
  highlight: { type: String, default: null },
  nameOf: { type: Function, default: null },     // (registration_id) => name, when results lack users
})
const { t } = useI18n()

const rows = computed(() => [...props.results].sort((a, b) => a.position - b.position).map((r) => {
  const d = r.result_data || {}
  return {
    ...r, p: d.p ?? 0, w: d.w ?? 0, d: d.d ?? 0, l: d.l ?? 0, gf: d.gf ?? 0, ga: d.ga ?? 0,
    sg: (d.gf ?? 0) - (d.ga ?? 0),
    name: r.team?.name || r.user?.name || r.user?.username || props.nameOf?.(r.registration_id) || t('events.show.removed_participant'),
  }
}))
const num = (v) => (Number.isInteger(Number(v)) ? Number(v) : Number(v).toFixed(1))
</script>

<template>
  <div class="gt-wrap">
    <table class="gt">
      <thead>
        <tr>
          <th class="c">#</th>
          <th>{{ $t('competition.group.team') }}</th>
          <th class="c" :title="$t('competition.group.pts_full')">{{ $t('competition.group.pts') }}</th>
          <th class="c" :title="$t('competition.group.p_full')">{{ $t('competition.group.p') }}</th>
          <th class="c" :title="$t('competition.group.w_full')">{{ $t('competition.group.w') }}</th>
          <th class="c" :title="$t('competition.group.d_full')">{{ $t('competition.group.d') }}</th>
          <th class="c" :title="$t('competition.group.l_full')">{{ $t('competition.group.l') }}</th>
          <th class="c hide-sm" :title="$t('competition.group.gf_full')">{{ $t('competition.group.gf') }}</th>
          <th class="c hide-sm" :title="$t('competition.group.ga_full')">{{ $t('competition.group.ga') }}</th>
          <th class="c" :title="$t('competition.group.sg_full')">{{ $t('competition.group.sg') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.registration_id" :class="{ q: r.qualified, me: highlight && r.registration_id === highlight }">
          <td class="c pos">{{ r.position }}</td>
          <td>
            <div class="who">
              <InitialsAvatar :name="r.name" :image="r.user?.avatar" :size="22" />
              <span class="nm">{{ r.name }}</span>
              <span v-if="r.qualified" class="q-chip">{{ $t('competition.group.qualified') }}</span>
            </div>
          </td>
          <td class="c strong">{{ num(r.score ?? 0) }}</td>
          <td class="c">{{ r.p }}</td>
          <td class="c">{{ r.w }}</td>
          <td class="c">{{ r.d }}</td>
          <td class="c">{{ r.l }}</td>
          <td class="c hide-sm">{{ num(r.gf) }}</td>
          <td class="c hide-sm">{{ num(r.ga) }}</td>
          <td class="c">{{ r.sg > 0 ? '+' : '' }}{{ num(r.sg) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.gt-wrap { overflow-x: auto; }
.gt { width: 100%; border-collapse: collapse; font-size: .82rem; }
.gt th { font-size: .68rem; text-transform: uppercase; letter-spacing: .05em; color: var(--ehub-muted); font-weight: 700; padding: 8px 6px; border-bottom: 1px solid var(--ehub-line); text-align: left; }
.gt td { padding: 8px 6px; border-bottom: 1px solid var(--ehub-line); color: var(--ehub-ink); font-variant-numeric: tabular-nums; }
.gt .c { text-align: center; }
.gt .pos { font-weight: 800; color: var(--ehub-muted); width: 32px; }
.gt .strong { font-weight: 800; }
.gt tr.q td:first-child { box-shadow: inset 3px 0 0 #1f8a5b; }
.gt tr.me { background: var(--ehub-primary-tint); }
.who { display: flex; align-items: center; gap: 8px; min-width: 0; }
.nm { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 600; }
.q-chip { font-size: .66rem; font-weight: 700; padding: 1px 7px; border-radius: 999px; background: color-mix(in srgb, #1f8a5b 15%, transparent); color: var(--ehub-success-text); white-space: nowrap; }
@media (max-width: 560px) { .hide-sm { display: none; } }
</style>
