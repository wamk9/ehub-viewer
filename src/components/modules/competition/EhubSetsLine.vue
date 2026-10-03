<script setup>
// Set-by-set score of a match, e.g. 25-21 · 19-25 · 15-12 (winner of each set in bold).
defineProps({
  sets: { type: Array, default: () => [] },
  center: { type: Boolean, default: false },
})
</script>

<template>
  <div v-if="sets && sets.length" class="sl" :class="{ center }" :aria-label="$t('competition.sets.title')">
    <span v-for="(s, i) in sets" :key="i" class="sl-set" :title="$t('competition.sets.set_n', { n: i + 1 })">
      <b v-if="s[0] > s[1]">{{ s[0] }}</b><template v-else>{{ s[0] }}</template>–<b v-if="s[1] > s[0]">{{ s[1] }}</b><template v-else>{{ s[1] }}</template>
    </span>
  </div>
</template>

<style scoped>
.sl { display: flex; flex-wrap: wrap; gap: 4px; font-size: .72rem; color: var(--ehub-muted); font-variant-numeric: tabular-nums; }
.sl.center { justify-content: center; }
.sl-set { padding: 1px 6px; border: 1px solid var(--ehub-line); border-radius: 999px; background: var(--ehub-card); }
.sl-set b { color: var(--ehub-ink); }
</style>
