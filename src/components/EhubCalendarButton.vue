<script setup>
import { computed } from 'vue'
import SystemVars from '@/helpers/General/SystemVars.js'

// "Add to calendar": downloads the .ics of the event (or of one stage) — dates,
// place, page link and broadcast. Works with Google, Apple and Outlook calendars.
const props = defineProps({
  orgRoute: { type: String, required: true },
  eventRoute: { type: String, required: true },
  stage: { type: String, default: null },
  compact: { type: Boolean, default: false },
})
const href = computed(() => SystemVars.baseUrlAPI + 'org/' + encodeURIComponent(props.orgRoute) + '/event/' + encodeURIComponent(props.eventRoute)
  + '/calendar.ics' + (props.stage ? '?stage=' + encodeURIComponent(props.stage) : ''))
</script>

<template>
  <a :href="href" class="ecal" :class="compact ? 'ecal--link' : 'btn btn-ghost round px-3'" rel="nofollow" download :title="$t(stage ? 'stages.calendar_stage' : 'stages.calendar')">
    <font-awesome-icon :icon="['fas', 'calendar-plus']" class="me-1" />{{ $t('stages.calendar') }}
  </a>
</template>

<style scoped>
.ecal--link { color: var(--ehub-ink); text-decoration: none; }
.ecal--link:hover { text-decoration: underline; }
</style>
