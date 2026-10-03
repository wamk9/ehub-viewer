<script setup>
/**
 * Full result of one stage (position, participant, points or time, qualified).
 * Shared by the public stage card; the viewer's row is highlighted.
 */
const props = defineProps({
  stage: { type: Object, required: true },
  highlight: { type: String, default: null },
})
const name = (r) => r.team?.name || r.user?.name
const hasQualified = () => (props.stage.results || []).some((x) => x.qualified)
</script>

<template>
  <div class="table-wrap esr">
    <table class="ev-table">
      <thead>
        <tr>
          <th class="l" style="width:64px">{{ $t('events.show.standings.pos') }}</th>
          <th class="l">{{ $t('events.show.stages.results.participant') }}</th>
          <th class="c">{{ $t(stage.stage_type === 'time' ? 'competition.time.time' : 'events.show.stages.results.score') }}</th>
          <th v-if="hasQualified()" class="c">{{ $t('events.show.stages.results.qualified_full') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="result in stage.results" :key="result.registration_id || result.position" :class="{ mine: result.registration_id === highlight }">
          <td class="l">
            <span class="pos-badge" :class="{ 1: 'p1', 2: 'p2', 3: 'p3' }[result.position] || ''">{{ result.position ?? '—' }}</span>
          </td>
          <td class="l driver-cell">
            <component :is="result.user?.username && !result.team ? 'router-link' : 'span'" :to="result.user?.username && !result.team ? `/profile/${result.user.username}` : undefined" class="esr__link">
              <span class="nm">{{ name(result) || $t('events.show.removed_participant') }}<span v-if="result.registration_id === highlight" class="you-chip">{{ $t('events.show.me.you') }}</span></span>
            </component>
          </td>
          <td v-if="stage.stage_type === 'time'" class="c pts-cell">{{ result.result_data?.time || (result.result_data?.status || '—').toUpperCase() }}</td>
          <td v-else class="c pts-cell">{{ result.score ?? '—' }}</td>
          <td v-if="hasQualified()" class="c">
            <font-awesome-icon v-if="result.qualified" :icon="['fas', 'circle-check']" class="qualified-ico" :aria-label="$t('events.show.stages.results.qualified_full')" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.esr__link { text-decoration: none; color: inherit; }
a.esr__link:hover .nm { text-decoration: underline; }
</style>
