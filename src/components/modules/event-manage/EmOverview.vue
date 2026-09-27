<script>
import EhubStatCard from '@/components/EhubStatCard.vue';
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import { toast } from '@/helpers/toast.js';
import { stageState, roundState, userName, apiError } from './store.js';

// Wizard step that holds the rules (Regulamento).
const RULES_STEP = 7;

export default {
  name: 'EmOverview',
  components: { EhubStatCard },
  inject: ['em'],
  data() {
    return { busy: false };
  },
  computed: {
    ev() { return this.em.event; },
    confirmedRegs() { return this.em.regs.filter((r) => r.payment_status !== 'pending'); },
    pending() { return this.em.regs.filter((r) => r.payment_status === 'pending').length; },
    stages() { return this.ev.stages || []; },
    revenue() {
      const paid = this.em.regs.filter((r) => r.payment_status === 'confirmed').length;
      return this.money(paid * (this.ev.fee || 0));
    },
    /** First unfinished session (or stage, when it has no sessions). */
    next() {
      for (const s of this.stages) {
        if (stageState(s) === 'done') continue;
        const r = (s.rounds || []).find((x) => roundState(x) !== 'done');
        return { stage: s, round: r || null, live: r ? roundState(r) === 'live' : stageState(s) === 'live' };
      }
      return null;
    },
    checklist() {
      const ev = this.ev;
      const items = [];
      if (ev.min_registrations) {
        const missing = ev.min_registrations - this.confirmedRegs.length;
        items.push(missing <= 0
          ? { ok: true, text: this.$t('pages.event.manage.ov.chk.min', { n: ev.min_registrations }), go: 'regs' }
          : { ok: false, text: this.$t('pages.event.manage.ov.chk.min_missing', { n: missing }), go: 'regs' });
      }
      if ((ev.fee || 0) > 0 && this.em.gateways !== null) {
        const ok = this.em.gateways.some((g) => g.active);
        items.push({ ok, text: this.$t('pages.event.manage.ov.chk.' + (ok ? 'gw' : 'gw_missing')), href: `/org/${this.em.orgRoute}/manage` });
      }
      const hasRules = !!(ev.rules && ev.rules.replace(/<[^>]*>/g, '').trim());
      items.push({ ok: hasRules, text: this.$t('pages.event.manage.ov.chk.' + (hasRules ? 'rules' : 'rules_missing')), step: RULES_STEP });
      items.push({ ok: this.stages.length > 0, text: this.$t('pages.event.manage.ov.chk.' + (this.stages.length ? 'stages' : 'stages_missing')), go: 'stages' });
      if (this.pending) items.push({ ok: false, text: this.$t('pages.event.manage.ov.chk.pending', { n: this.pending }), go: 'regs' });
      this.stages
        .filter((s) => s.initialized && !s.results_published)
        .forEach((s) => items.push({ ok: false, text: this.$t('pages.event.manage.ov.chk.results', { s: s.name }), go: 'results' }));
      if (!ev.streaming_twitch && !ev.streaming_youtube) items.push({ ok: false, text: this.$t('pages.event.manage.ov.chk.stream'), go: 'live' });
      return items.sort((a, b) => Number(a.ok) - Number(b.ok));
    },
    feed() {
      const items = [];
      this.em.regs.forEach((r) => {
        items.push({ at: r.registered_at, icon: 'user-plus', color: 'var(--ehub-primary)', text: this.$t('pages.event.manage.ov.feed.reg', { a: userName(r) }) });
        if (r.payment_status === 'confirmed' && r.confirmed_at) {
          items.push({ at: r.confirmed_at, icon: 'circle-check', color: '#1f8a5b', text: this.$t('pages.event.manage.ov.feed.pay', { a: userName(r) }) });
        }
      });
      this.em.articles.filter((a) => a.published_at).forEach((a) => {
        items.push({ at: a.published_at, icon: 'newspaper', color: '#7C3AED', text: this.$t('pages.event.manage.ov.feed.article', { t: a.title }) });
      });
      this.em.notices.forEach((n) => {
        items.push({ at: n.created_at, icon: 'bullhorn', color: 'color-mix(in srgb,var(--ehub-gold),#000 30%)', text: this.$t('pages.event.manage.ov.feed.notice', { t: n.subject, n: n.recipients_count }) });
      });
      return items.filter((x) => x.at).sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 8);
    },
  },
  methods: {
    money(v) {
      return new Intl.NumberFormat(this.$i18n.locale, { style: 'currency', currency: (this.ev.currency || 'brl').toUpperCase() }).format(v || 0);
    },
    ago(date) {
      const diff = (Date.now() - new Date(date)) / 1000;
      const rtf = new Intl.RelativeTimeFormat(this.$i18n.locale, { numeric: 'auto' });
      if (diff < 3600) return rtf.format(-Math.max(1, Math.round(diff / 60)), 'minute');
      if (diff < 86400) return rtf.format(-Math.round(diff / 3600), 'hour');
      return rtf.format(-Math.round(diff / 86400), 'day');
    },
    go(panel) {
      this.$router.push({ name: 'manage-event', params: { orgRoute: this.em.orgRoute, eventRoute: this.em.eventRoute, panel } });
    },
    openItem(c) {
      if (c.go) this.go(c.go);
      else if (c.href) this.$router.push(c.href);
      else if (c.step) this.$router.push({ name: 'manage-organization-events-create', params: { orgRoute: this.em.orgRoute, eventRoute: this.em.eventRoute }, query: { step: c.step, return: 'manage' } });
    },
    async togglePublication() {
      if (this.busy) return;
      const next = this.ev.publication === 'draft' ? 'published' : 'draft';
      this.busy = true;
      const res = await OrganizationEvent.update(this.em.orgRoute, this.em.eventRoute, { publication: next });
      this.busy = false;
      if (res.code === 200) {
        this.ev.publication = next;
        toast.success(this.$t('pages.event.manage.toast.' + (next === 'published' ? 'pub' : 'unpub')));
      } else toast.error(apiError(this, res.data));
    },
  },
};
</script>

<template>
  <section>
    <div class="pnl-hd">
      <div>
        <h1>{{ $t('pages.event.manage.ov.title') }}</h1>
        <p>{{ $t('pages.event.manage.ov.sub') }}</p>
      </div>
      <div class="spacer"></div>
      <label v-if="!ev.finished" class="pub-sw">
        <div class="form-check form-switch m-0">
          <input class="form-check-input" type="checkbox" :checked="ev.publication !== 'draft'" :disabled="busy || ev.initialized" @change="togglePublication" />
        </div>
        <div>
          <b>{{ $t('pages.event.manage.ov.' + (ev.publication === 'draft' ? 'draft' : 'published')) }}</b>
          <span>{{ $t('pages.event.manage.ov.' + (ev.publication === 'draft' ? 'draft_hint' : 'pub_hint')) }}</span>
        </div>
      </label>
    </div>

    <div class="stat-grid">
      <EhubStatCard :icon="['fas', 'id-card']" icon-class="primary"
        :value="ev.max_registrations ? `${confirmedRegs.length}/${ev.max_registrations}` : confirmedRegs.length"
        :label="$t('pages.event.manage.ov.k_regs')" @click="go('regs')" />
      <EhubStatCard :icon="['fas', 'clock']" icon-class="gold" :value="pending"
        :label="$t('pages.event.manage.ov.k_pending')" @click="go('regs')" />
      <EhubStatCard :icon="['fas', 'wallet']" icon-class="green" :value="revenue"
        :label="$t('pages.event.manage.ov.k_revenue')" @click="go('finance')" />
      <EhubStatCard :icon="['fas', 'stopwatch']" icon-bg="color-mix(in srgb,#e23b3b 14%,transparent)" icon-color="#e23b3b"
        :value="next ? (next.round ? next.round.name : next.stage.name) : '—'"
        :value-style="{ fontSize: '1.05rem', lineHeight: 1.3 }"
        :delta="next && next.live ? $t('pages.event.manage.ov.live_now') : undefined" delta-class="live"
        :label="next && next.round ? `${$t('pages.event.manage.ov.k_next')} · ${next.stage.name}` : $t('pages.event.manage.ov.k_next')"
        @click="go('stages')" />
    </div>

    <div class="dash-grid">
      <div class="cc">
        <div class="cc-hd">
          <h3><font-awesome-icon :icon="['fas', 'list-check']" style="color:var(--ehub-primary)" />{{ $t('pages.event.manage.ov.todo') }}</h3>
        </div>
        <div v-for="(c, i) in checklist" :key="i" class="chk" @click="openItem(c)">
          <span class="chk-ico" :class="c.ok ? 'ok' : 'warn'">
            <font-awesome-icon :icon="['fas', c.ok ? 'check' : 'exclamation']" />
          </span>
          <span class="chk-txt">{{ c.text }}</span>
          <font-awesome-icon v-if="c.go || c.href || c.step" :icon="['fas', 'chevron-right']" class="chk-go" />
        </div>
      </div>

      <div class="cc">
        <div class="cc-hd">
          <h3><font-awesome-icon :icon="['fas', 'bolt']" style="color:var(--ehub-gold)" />{{ $t('pages.event.manage.ov.activity') }}</h3>
        </div>
        <div v-if="!feed.length" class="cc-empty">{{ $t('pages.event.manage.ov.activity_empty') }}</div>
        <div v-for="(a, i) in feed" :key="i" class="act-item">
          <div class="act-dot" :style="{ background: `color-mix(in srgb, ${a.color} 14%, transparent)`, color: a.color }">
            <font-awesome-icon :icon="['fas', a.icon]" />
          </div>
          <div>
            <p class="act-text">{{ a.text }}</p>
            <div class="act-when">{{ ago(a.at) }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pub-sw { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border: 1px solid var(--ehub-line); border-radius: 10px; background: var(--ehub-field-bg); cursor: pointer; margin: 0; }
.pub-sw b { font-size: .82rem; color: var(--ehub-ink); display: block; line-height: 1.2; }
.pub-sw span { font-size: .7rem; color: var(--ehub-muted); }
.chk { display: flex; align-items: center; gap: 11px; padding: 11px 17px; border-bottom: 1px solid var(--ehub-line); cursor: pointer; transition: background .12s; }
.chk:last-child { border-bottom: 0; }
.chk:hover { background: color-mix(in srgb, var(--ehub-field-bg) 55%, transparent); }
.chk-ico { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .62rem; flex-shrink: 0; }
.chk-ico.ok { background: color-mix(in srgb, #1f8a5b 15%, transparent); color: #1f8a5b; }
.chk-ico.warn { background: color-mix(in srgb, var(--ehub-gold) 22%, transparent); color: color-mix(in srgb, var(--ehub-gold), #000 38%); }
.chk-txt { flex: 1; font-size: .84rem; color: var(--ehub-ink); }
.chk-go { font-size: .66rem; color: var(--ehub-muted); }
:deep(.sc-delta.live) { color: #e23b3b; }
</style>
