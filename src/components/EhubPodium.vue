<script setup>
/**
 * Top 3 of a stage: medal, name (link to the profile when there is one),
 * a sub-line (team) and the value (points or time).
 * rows: [{ key, position, name, username, sub, value, mine }]
 */
defineProps({
  rows: { type: Array, required: true },
})
const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' }
</script>

<template>
  <ol class="epd" :aria-label="$t('stages.podium')">
    <li v-for="r in rows.slice(0, 3)" :key="r.key" class="epd__row" :class="['p' + r.position, { mine: r.mine }]">
      <span class="epd__medal" aria-hidden="true">{{ MEDAL[r.position] || r.position }}</span>
      <span class="epd__info">
        <router-link v-if="r.username" :to="'/profile/' + r.username" class="epd__name">{{ r.name }}</router-link>
        <span v-else class="epd__name">{{ r.name }}</span>
        <span v-if="r.mine" class="epd__you">{{ $t('events.show.me.you') }}</span>
        <span v-if="r.sub" class="epd__sub">{{ r.sub }}</span>
      </span>
      <span class="epd__val">{{ r.value }}</span>
    </li>
  </ol>
</template>

<style scoped>
.epd { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 7px; }
.epd__row { display: flex; align-items: center; gap: 12px; padding: 8px 12px; border-radius: 10px; background: var(--ehub-field-bg); border: 1px solid var(--ehub-line); }
.epd__row.p1 { background: color-mix(in srgb, var(--ehub-gold, #f5c542) 12%, var(--ehub-card)); border-color: color-mix(in srgb, var(--ehub-gold, #f5c542) 35%, var(--ehub-line)); }
.epd__row.mine { outline: 2px solid color-mix(in srgb, var(--ehub-primary) 45%, transparent); }
.epd__medal { font-size: 1.15rem; width: 26px; text-align: center; flex-shrink: 0; }
.epd__info { flex: 1; min-width: 0; display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.epd__name { font-weight: 700; color: var(--ehub-ink); text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
a.epd__name:hover { text-decoration: underline; }
.epd__sub { font-size: .78rem; color: var(--ehub-muted); }
.epd__you { font-size: .66rem; font-weight: 800; text-transform: uppercase; color: var(--ehub-primary-text); background: var(--ehub-primary-tint); border-radius: 50rem; padding: 1px 7px; }
.epd__val { font-family: 'DM Mono', ui-monospace, monospace; font-weight: 800; color: var(--ehub-primary-text); white-space: nowrap; }
</style>
