<script setup>
import { computed, ref } from 'vue'
import { embedUrl, watchUrl } from '@/helpers/General/liveStream.js'

/**
 * Broadcast of a stage, session or match: a "Watch" button that opens the player
 * inline (16:9), or a link to the platform when the link can't be embedded.
 * Twitch and YouTube links only (the API validates them).
 *
 * Usage: <EhubStreamPanel :url="match.stream_url" :live="isLive" />
 * The button and the player are separate slots-free parts: place the panel where
 * the player should open; the button renders at the top of it.
 */
const props = defineProps({
  url: { type: String, default: '' },
  live: { type: Boolean, default: false },    // live → red "Assistir ao vivo"; otherwise "Ver transmissão"
  compact: { type: Boolean, default: false }, // short label ("Assistir")
})

const kind = computed(() => (/twitch\.tv/i.test(props.url) ? 'twitch' : 'youtube'))
const embed = computed(() => (props.url ? embedUrl(kind.value, props.url) : null))
const link = computed(() => (props.url ? watchUrl(kind.value, props.url) : null))
const open = ref(false)
</script>

<template>
  <div v-if="link" class="esp">
    <div class="esp__bar">
      <button
        v-if="embed"
        type="button"
        class="esp__btn"
        :class="{ live, open }"
        :aria-expanded="open"
        @click="open = !open"
      >
        <font-awesome-icon :icon="['fas', open ? 'xmark' : 'play']" />
        {{ open ? $t('stages.stream.close') : (live ? $t(compact ? 'stages.stream.watch_short' : 'stages.stream.watch_live') : $t('stages.stream.watch')) }}
      </button>
      <a :href="link" target="_blank" rel="noopener noreferrer" class="esp__ext" :title="$t('stages.stream.open_platform', { p: kind === 'twitch' ? 'Twitch' : 'YouTube' })">
        <font-awesome-icon :icon="['fab', kind]" />
        <span>{{ $t('stages.stream.open_platform', { p: kind === 'twitch' ? 'Twitch' : 'YouTube' }) }}</span>
      </a>
    </div>
    <div v-if="open && embed" class="esp__frame">
      <iframe :src="embed" :title="$t('stages.stream.player')" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>
    </div>
  </div>
</template>

<style scoped>
.esp__bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.esp__btn { display: inline-flex; align-items: center; gap: 7px; font-size: .78rem; font-weight: 700; padding: 6px 14px; border-radius: 50rem; border: 1px solid var(--ehub-line); background: var(--ehub-field-bg); color: var(--ehub-ink); cursor: pointer; transition: background .15s; }
.esp__btn:hover { border-color: var(--ehub-primary); }
.esp__btn.live { background: #e74c3c; border-color: #e74c3c; color: #fff; }
.esp__btn.live:hover { background: #c0392b; }
.esp__btn.open { background: var(--ehub-field-bg); color: var(--ehub-ink); border-color: var(--ehub-line); }
.esp__ext { display: inline-flex; align-items: center; gap: 6px; font-size: .76rem; font-weight: 600; color: var(--ehub-muted); text-decoration: none; }
.esp__ext:hover { color: var(--ehub-ink); text-decoration: underline; }
.esp__frame { margin-top: 10px; aspect-ratio: 16 / 9; background: #000; border-radius: 10px; overflow: hidden; }
.esp__frame iframe { width: 100%; height: 100%; border: 0; display: block; }
</style>
