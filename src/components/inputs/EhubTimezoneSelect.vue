<template>
  <select class="form-select" :value="current" @change="$emit('update:modelValue', $event.target.value)">
    <optgroup v-for="g in groups" :key="g.region" :label="$t('common.timezones.regions.' + g.region)">
      <option v-for="z in g.zones" :key="z.id" :value="z.id">{{ z.label }}</option>
    </optgroup>
  </select>
</template>

<script>
import { LEGACY_TZ, normalizeTimezone } from '@/helpers/General/timezones.js';

const REGIONS = ['America', 'Europe', 'Africa', 'Asia', 'Australia', 'Pacific', 'Atlantic', 'Indian', 'Antarctica', 'Arctic'];

function offsetOf(zone) {
  try {
    const part = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' })
      .formatToParts(new Date()).find((p) => p.type === 'timeZoneName')?.value || 'GMT';
    const m = part.match(/GMT([+-])(\d{2}):?(\d{2})?/);
    if (!m) return { text: 'UTC±00:00', minutes: 0 };
    const minutes = (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] || 0));
    return { text: `UTC${m[1]}${m[2]}:${m[3] || '00'}`, minutes };
  } catch {
    return { text: 'UTC±00:00', minutes: 0 };
  }
}

/**
 * Every IANA time zone, grouped by region and sorted by UTC offset,
 * labelled "(UTC-03:00) Sao Paulo". Emits the IANA id.
 */
export default {
  name: 'EhubTimezoneSelect',
  props: {
    modelValue: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  computed: {
    current() { return normalizeTimezone(this.modelValue); },
    groups() {
      let ids = [];
      try { ids = Intl.supportedValuesOf('timeZone'); } catch { ids = Object.values(LEGACY_TZ); }
      if (!ids.includes('UTC')) ids = [...ids, 'UTC'];
      if (this.current && !ids.includes(this.current)) ids = [...ids, this.current];

      const byRegion = {};
      ids.forEach((id) => {
        const head = id.split('/')[0];
        const region = REGIONS.includes(head) ? head : 'Other';
        const off = offsetOf(id);
        const city = id.includes('/') ? id.split('/').slice(1).join(' / ').replace(/_/g, ' ') : id;
        (byRegion[region] ||= []).push({ id, minutes: off.minutes, label: `(${off.text}) ${city}` });
      });
      return [...REGIONS, 'Other']
        .filter((r) => byRegion[r])
        .map((region) => ({
          region,
          zones: byRegion[region].sort((a, b) => a.minutes - b.minutes || a.label.localeCompare(b.label)),
        }));
    },
  },
};
</script>
