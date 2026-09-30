<script>
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import { toast } from '@/helpers/toast.js';
import { stageState, roundState, apiError } from './store.js';
import { parseTwitch, parseYouTube, normalizeYouTube } from '@/helpers/General/liveStream.js';
import EhubLivePlayer from '@/components/modules/event-live/EhubLivePlayer.vue';

export default {
  name: 'EmLive',
  components: { EhubLivePlayer },
  inject: ['em'],
  data() {
    const ev = this.em.event;
    return {
      form: {
        twitch: ev.streaming_twitch || '',
        youtube: ev.streaming_youtube || '',
        embed: ev.event_data?.live_embed !== false,
      },
      saving: false,
    };
  },
  computed: {
    ev() { return this.em.event; },
    liveSession() {
      for (const s of this.ev.stages || []) {
        if (stageState(s) !== 'live') continue;
        const r = (s.rounds || []).find((x) => roundState(x) === 'live');
        return { stage: s, round: r || null };
      }
      return null;
    },
    channels() {
      return [
        { key: 'twitch', icon: 'twitch', color: '#9146FF', prefix: 'twitch.tv/', ph: 'pages.event.manage.live.twitch_ph' },
        { key: 'youtube', icon: 'youtube', color: '#FF0000', prefix: '', ph: 'pages.event.manage.live.youtube_ph' },
      ];
    },
    // What the pasted text will turn into, so the organizer knows before saving.
    ytInfo() {
      const p = parseYouTube(this.form.youtube);
      if (!this.form.youtube.trim()) return null;
      if (!p) return 'invalid';
      return p.handle ? 'handle' : 'ok';
    },
    twInvalid() { return !!this.form.twitch.trim() && !parseTwitch(this.form.twitch); },
    previewTwitch() { return parseTwitch(this.form.twitch) || ''; },
    previewYoutube() { return normalizeYouTube(this.form.youtube) || ''; },
  },
  methods: {
    // A pasted address already carries the site, so the prefix would be repeated.
    isFullUrl(v) { return /twitch\.tv|:\/\//i.test(v || ''); },
    async save() {
      this.saving = true;
      const payload = {
        streaming_twitch: parseTwitch(this.form.twitch),
        streaming_youtube: normalizeYouTube(this.form.youtube),
        event_data: { live_embed: this.form.embed },
      };
      const res = await OrganizationEvent.update(this.em.orgRoute, this.em.eventRoute, payload);
      this.saving = false;
      if (res.code === 200) {
        this.ev.streaming_twitch = payload.streaming_twitch;
        this.ev.streaming_youtube = payload.streaming_youtube;
        this.ev.event_data = { ...(this.ev.event_data || {}), live_embed: this.form.embed };
        this.form.twitch = payload.streaming_twitch || '';
        this.form.youtube = payload.streaming_youtube || '';
        toast.success(this.$t('pages.event.manage.toast.saved'));
      } else toast.error(apiError(this, res.data));
    },
  },
};
</script>

<template>
  <section>
    <div class="pnl-hd">
      <div>
        <h1>{{ $t('pages.event.manage.live.title') }}</h1>
        <p>{{ $t('pages.event.manage.live.sub') }}</p>
      </div>
      <div class="spacer"></div>
      <button class="btn btn-primary round px-4" :disabled="saving" @click="save">{{ $t('pages.event.manage.c.save') }}</button>
    </div>

    <div class="cc">
      <div class="cc-hd">
        <h3><font-awesome-icon :icon="['fas', 'tower-broadcast']" style="color:var(--ehub-primary-text)" />{{ $t('pages.event.manage.live.channels') }}</h3>
      </div>
      <div v-for="c in channels" :key="c.key" class="ch-row">
        <div class="ch-logo" :style="{ background: c.color }"><font-awesome-icon :icon="['fab', c.icon]" /></div>
        <div style="min-width:110px">
          <div class="ch-name">{{ c.key }}</div>
          <span v-if="!ev['streaming_' + c.key]" class="s-badge warn">{{ $t('pages.event.manage.live.not_set') }}</span>
          <span v-else-if="liveSession" class="s-badge live"><font-awesome-icon :icon="['fas', 'circle']" />{{ $t('pages.event.manage.live.live_now') }}</span>
          <span v-else class="s-badge mute">{{ $t('pages.event.manage.live.offline') }}</span>
        </div>
        <div class="ch-input">
          <div class="input-group">
            <span v-if="c.prefix && !isFullUrl(form[c.key])" class="input-group-text" style="font-size:.8rem">{{ c.prefix }}</span>
            <input v-model="form[c.key]" class="form-control" maxlength="200" :placeholder="$t(c.ph)" :aria-label="c.key" />
          </div>
          <small v-if="c.key === 'twitch' && twInvalid" class="ch-hint bad">{{ $t('pages.event.manage.live.invalid') }}</small>
          <small v-else-if="c.key === 'youtube' && ytInfo === 'invalid'" class="ch-hint bad">{{ $t('pages.event.manage.live.invalid') }}</small>
          <small v-else-if="c.key === 'youtube' && ytInfo === 'handle'" class="ch-hint warn">{{ $t('pages.event.manage.live.handle_hint') }}</small>
          <small v-else-if="c.key === 'youtube'" class="ch-hint">{{ $t('pages.event.manage.live.youtube_hint') }}</small>
        </div>
      </div>
    </div>

    <div v-if="previewTwitch || previewYoutube" class="cc">
      <div class="cc-hd">
        <h3><font-awesome-icon :icon="['fas', 'eye']" style="color:var(--ehub-primary-text)" />{{ $t('pages.event.manage.live.preview') }}</h3>
      </div>
      <div class="cc-bd">
        <p class="set-desc">{{ $t('pages.event.manage.live.preview_hint') }}</p>
        <EhubLivePlayer :twitch="previewTwitch" :youtube="previewYoutube" />
      </div>
    </div>

    <div class="cc">
      <div class="cc-hd">
        <h3><font-awesome-icon :icon="['fas', 'star']" style="color:var(--ehub-gold)" />{{ $t('pages.event.manage.live.feature') }}</h3>
      </div>
      <div class="cc-bd">
        <p class="set-desc">{{ $t('pages.event.manage.live.feature_hint') }}</p>
        <div class="sum-lbl">{{ $t('pages.event.manage.live.session') }}</div>
        <div v-if="liveSession" class="d-flex align-items-center gap-2 flex-wrap mb-2">
          <b style="color:var(--ehub-ink)">{{ liveSession.stage.name }}<template v-if="liveSession.round"> · {{ liveSession.round.name }}</template></b>
          <span class="s-badge live"><font-awesome-icon :icon="['fas', 'circle']" />{{ $t('pages.event.manage.live.live_now') }}</span>
        </div>
        <div v-else class="td-muted mb-2">{{ $t('pages.event.manage.live.none') }}</div>
        <div class="form-check form-switch" style="margin-top:14px">
          <input id="lvEmbed" v-model="form.embed" class="form-check-input" type="checkbox" />
          <label class="form-check-label" for="lvEmbed" style="font-size:.85rem">{{ $t('pages.event.manage.live.embed') }}</label>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ch-row { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--ehub-line); flex-wrap: wrap; }
.ch-row:last-child { border-bottom: 0; }
.ch-logo { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1rem; flex-shrink: 0; }
.ch-name { font-weight: 700; font-size: .9rem; color: var(--ehub-ink); text-transform: capitalize; margin-bottom: 2px; }
.ch-input { flex: 1; min-width: 220px; max-width: 520px; display: flex; flex-direction: column; gap: 4px; }
.ch-hint { font-size: .76rem; color: var(--ehub-muted); line-height: 1.4; }
.ch-hint.bad { color: var(--ehub-danger-text); }
.ch-hint.warn { color: var(--ehub-warn-text); }
.sum-lbl { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--ehub-muted); margin-bottom: 5px; }
</style>
