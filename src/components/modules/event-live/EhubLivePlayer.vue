<script>
import { embedUrl, watchUrl } from '@/helpers/General/liveStream.js';

/**
 * Live player for an event: embeds the Twitch channel and/or the YouTube live,
 * with a switch when both exist and a link to open the stream on the platform.
 */
export default {
  name: 'EhubLivePlayer',
  props: {
    twitch: { type: String, default: '' },
    youtube: { type: String, default: '' },
    compact: { type: Boolean, default: false },
  },
  data() {
    return { active: null };
  },
  computed: {
    sources() {
      return [
        { key: 'twitch', icon: 'twitch', label: 'Twitch', value: this.twitch },
        { key: 'youtube', icon: 'youtube', label: 'YouTube', value: this.youtube },
      ]
        .filter((s) => s.value)
        .map((s) => ({ ...s, embed: embedUrl(s.key, s.value), link: watchUrl(s.key, s.value) }))
        .filter((s) => s.link);
    },
    playable() { return this.sources.filter((s) => s.embed); },
    current() {
      return this.playable.find((s) => s.key === this.active) || this.playable[0] || null;
    },
  },
};
</script>

<template>
  <div v-if="sources.length" class="lp" :class="{ compact }">
    <div v-if="current" class="lp-frame">
      <iframe
        :key="current.embed"
        :src="current.embed"
        :title="$t('common.live.player_title', { platform: current.label })"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
      ></iframe>
    </div>
    <p v-else class="lp-noembed">
      <font-awesome-icon :icon="['fas', 'circle-info']" />{{ $t('common.live.no_embed') }}
    </p>
    <div class="lp-bar">
      <div v-if="playable.length > 1" class="lp-switch" role="tablist">
        <button
          v-for="s in playable" :key="s.key" type="button" role="tab"
          :aria-selected="current?.key === s.key" :class="{ on: current?.key === s.key }"
          @click="active = s.key"
        >
          <font-awesome-icon :icon="['fab', s.icon]" />{{ s.label }}
        </button>
      </div>
      <div class="lp-links">
        <a v-for="s in sources" :key="s.key" :href="s.link" target="_blank" rel="noopener noreferrer" class="lp-link" :class="s.key">
          <font-awesome-icon :icon="['fab', s.icon]" />{{ $t('common.live.open_on', { platform: s.label }) }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lp { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 14px; overflow: hidden; }
.lp-frame { position: relative; aspect-ratio: 16 / 9; background: #000; }
.lp-frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.lp-noembed { display: flex; gap: 8px; align-items: flex-start; margin: 0; padding: 14px 16px; font-size: .85rem; color: var(--ehub-muted); }
.lp-noembed svg { margin-top: 3px; color: var(--ehub-primary-text); }
.lp-bar { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding: 10px 14px; }
.lp-switch { display: inline-flex; gap: 4px; background: var(--ehub-field-bg); border: 1px solid var(--ehub-line); border-radius: 50rem; padding: 3px; }
.lp-switch button { border: 0; background: transparent; color: var(--ehub-muted); font-size: .8rem; font-weight: 600; padding: 6px 12px; border-radius: 50rem; display: inline-flex; gap: 6px; align-items: center; min-height: 32px; }
.lp-switch button.on { background: var(--ehub-card); color: var(--ehub-ink); box-shadow: 0 1px 3px rgba(0,0,0,.12); }
.lp-links { display: flex; gap: 12px; flex-wrap: wrap; margin-left: auto; }
.lp-link { display: inline-flex; align-items: center; gap: 6px; font-size: .8rem; font-weight: 600; color: var(--ehub-ink); text-decoration: none; padding: 6px 2px; }
.lp-link:hover { text-decoration: underline; }
.lp-link.twitch svg { color: #9146ff; }
.lp-link.youtube svg { color: #ff0000; }
</style>
