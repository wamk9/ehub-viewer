<script>
import EhubStatCard from '@/components/EhubStatCard.vue';
import EhubActivityLog from '@/components/EhubActivityLog.vue';
import { stageState, roundState, userName, apiError } from './store.js';
import OrganizationEventStage from '@/helpers/communication/OrganizationEventStage.js';
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import { toast } from '@/helpers/toast.js';

// Wizard step that holds the rules (Regulamento).
const RULES_STEP = 7;

export default {
  name: 'EmOverview',
  components: { EhubStatCard, EhubActivityLog },
  inject: ['em'],
  data() {
    return { stepBusy: false };
  },
  computed: {
    /**
     * The single thing to do now, in plain words: start a stage, enter its
     * results, close it, or close the championship after the last one.
     */
    nextStep() {
      const ev = this.ev;
      if (!this.full || ev.finished || ev.publication === 'draft') return null;
      const live = this.stages.find((s) => stageState(s) === 'live');
      if (live && !live.results_published) return { key: 'results', stage: live, icon: 'ranking-star', action: () => this.goResults(live) };
      if (live) return { key: 'finish', stage: live, icon: 'flag', action: () => this.controlStage(live, 'finish') };
      const pending = this.stages.find((s) => stageState(s) === 'pending');
      if (pending) return { key: ev.initialized ? 'start' : 'start_first', stage: pending, icon: 'play', action: () => this.controlStage(pending, 'start') };
      if (this.stages.length && ev.initialized) return { key: 'close_event', stage: null, icon: 'trophy', action: () => this.finishEvent() };
      return null;
    },
    ev() { return this.em.event; },
    full() { return this.em.can('event.manage'); },
    seesRegs() { return this.em.can('regs.view'); },
    confirmedRegs() { return this.em.regs.filter((r) => r.payment_status !== 'pending'); },
    /** Without registrations access (marketing) fall back to the public count. */
    regsCount() { return this.seesRegs ? this.confirmedRegs.length : (this.ev.registrations_count || 0); },
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
        items.push({ ok, text: this.$t('pages.event.manage.ov.chk.' + (ok ? 'gw' : 'gw_missing')), href: `/org/${this.em.orgRoute}/manage/finances` });
      }
      const hasRules = !!(ev.rules && ev.rules.replace(/<[^>]*>/g, '').trim());
      items.push({ ok: hasRules, text: this.$t('pages.event.manage.ov.chk.' + (hasRules ? 'rules' : 'rules_missing')), step: RULES_STEP });
      items.push({ ok: this.stages.length > 0, text: this.$t('pages.event.manage.ov.chk.' + (this.stages.length ? 'stages' : 'stages_missing')), go: 'stages' });
      if (this.pending) items.push({ ok: false, text: this.$t('pages.event.manage.ov.chk.pending', { n: this.pending }), go: 'regs' });
      this.stages
        .filter((s) => s.initialized && !s.results_published)
        .forEach((s) => items.push({ ok: false, text: this.$t('pages.event.manage.ov.chk.results', { s: s.name }), go: 'results' }));
      // Optional suggestion, not a problem: listed after the real pendencies.
      if (!ev.streaming_twitch && !ev.streaming_youtube) items.push({ ok: false, tip: true, text: this.$t('pages.event.manage.ov.chk.stream'), go: 'live' });
      const rank = (c) => (c.ok ? 2 : c.tip ? 1 : 0);
      return items.sort((a, b) => rank(a) - rank(b));
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
      return items.filter((x) => x.at)
        .sort((a, b) => new Date(b.at) - new Date(a.at))
        .slice(0, 8)
        .map((x, i) => ({ id: i, icon: x.icon, text: x.text, created_at: x.at }));
    },
  },
  methods: {
    money(v) {
      return new Intl.NumberFormat(this.$i18n.locale, { style: 'currency', currency: (this.ev.currency || 'brl').toUpperCase() }).format(v || 0);
    },
    goResults(stage) {
      this.$router.push({ name: 'manage-event', params: { orgRoute: this.em.orgRoute, eventRoute: this.em.eventRoute, panel: 'results', sub: stage.route } });
    },
    async controlStage(stage, action) {
      const first = action === 'start' && !this.ev.initialized;
      const msg = first
        ? this.$t('pages.event.manage.stg.start_first_q')
        : this.$t(`pages.event.manage.stg.${action}_q`, { s: stage.name });
      const ok = await this.em.ask(msg, this.$t('pages.event.manage.stg.' + action));
      if (!ok) return;
      this.stepBusy = true;
      const res = await OrganizationEventStage.control(this.em.orgRoute, this.em.eventRoute, stage.route, action);
      this.stepBusy = false;
      if (res.code === 200) {
        this.em.putStage(res.data);
        if (action === 'start') this.ev.initialized = true;
        toast.success(this.$t('pages.event.manage.toast.' + (action === 'start' ? 'started' : 'finished')));
      } else toast.error(apiError(this, res.data));
    },
    async finishEvent() {
      const ok = await this.em.ask(this.$t('pages.event.manage.adv.finish_q'), this.$t('pages.event.manage.adv.finish_btn'), true);
      if (!ok) return;
      this.stepBusy = true;
      const res = await OrganizationEvent.control(this.em.orgRoute, this.em.eventRoute, 'finish');
      this.stepBusy = false;
      if (res.code === 200) {
        this.ev.finished = true;
        toast.success(this.$t('pages.event.manage.ov.next.closed'));
      } else toast.error(apiError(this, res.data));
    },
    go(panel) {
      if (!this.em.canPanel(panel)) return;
      this.$router.push({ name: 'manage-event', params: { orgRoute: this.em.orgRoute, eventRoute: this.em.eventRoute, panel } });
    },
    openItem(c) {
      if (c.go) this.go(c.go);
      else if (c.href) this.$router.push(c.href);
      else if (c.step) this.$router.push({ name: 'manage-organization-events-create', params: { orgRoute: this.em.orgRoute, eventRoute: this.em.eventRoute }, state: { step: c.step, returnTo: 'manage' } });
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
    </div>

    <div v-if="nextStep" class="next-card">
      <div class="next-card__ico"><font-awesome-icon :icon="['fas', nextStep.icon]" /></div>
      <div class="next-card__txt">
        <span class="next-card__k">{{ $t('pages.event.manage.ov.next.label') }}</span>
        <strong>{{ $t('pages.event.manage.ov.next.' + nextStep.key + '_title', { s: nextStep.stage?.name }) }}</strong>
        <span>{{ $t('pages.event.manage.ov.next.' + nextStep.key + '_text', { s: nextStep.stage?.name }) }}</span>
      </div>
      <button class="btn btn-primary round px-4" :disabled="stepBusy" @click="nextStep.action()">
        <span v-if="stepBusy" class="spinner-border spinner-border-sm me-2"></span>
        <font-awesome-icon v-else :icon="['fas', nextStep.icon]" class="me-2" />{{ $t('pages.event.manage.ov.next.' + nextStep.key + '_cta') }}
      </button>
    </div>

    <div class="stat-grid">
      <EhubStatCard :icon="['fas', 'id-card']" icon-class="primary"
        :value="ev.max_registrations ? `${regsCount}/${ev.max_registrations}` : regsCount"
        :label="$t('pages.event.manage.ov.k_regs')" @click="go('regs')" />
      <EhubStatCard v-if="seesRegs" :icon="['fas', 'clock']" icon-class="gold" :value="pending"
        :label="$t('pages.event.manage.ov.k_pending')" @click="go('regs')" />
      <EhubStatCard v-if="seesRegs" :icon="['fas', 'wallet']" icon-class="green" :value="revenue"
        :label="$t('pages.event.manage.ov.k_revenue')" @click="go('finance')" />
      <EhubStatCard :icon="['fas', 'stopwatch']" icon-bg="color-mix(in srgb,#e23b3b 14%,transparent)" icon-color="#e23b3b"
        :value="next ? (next.round ? next.round.name : next.stage.name) : '—'"
        :value-style="{ fontSize: '1.05rem', lineHeight: 1.3 }"
        :delta="next && next.live ? $t('pages.event.manage.ov.live_now') : undefined" delta-class="live"
        :label="next && next.round ? `${$t('pages.event.manage.ov.k_next')} · ${next.stage.name}` : $t('pages.event.manage.ov.k_next')"
        @click="go('stages')" />
    </div>

    <div v-if="full" class="dash-grid">
      <div class="cc">
        <div class="cc-hd">
          <h3><font-awesome-icon :icon="['fas', 'list-check']" style="color:var(--ehub-primary-text)" />{{ $t('pages.event.manage.ov.todo') }}</h3>
        </div>
        <div v-for="(c, i) in checklist" :key="i" class="chk" @click="openItem(c)">
          <span class="chk-ico" :class="c.ok ? 'ok' : (c.tip ? 'tip' : 'warn')">
            <font-awesome-icon :icon="['fas', c.ok ? 'check' : (c.tip ? 'lightbulb' : 'exclamation')]" />
          </span>
          <span class="chk-txt">{{ c.text }}</span>
          <font-awesome-icon v-if="c.go || c.href || c.step" :icon="['fas', 'chevron-right']" class="chk-go" />
        </div>
      </div>

      <EhubActivityLog
        :title="$t('pages.event.manage.ov.activity')"
        :activities="feed"
        :empty-label="$t('pages.event.manage.ov.activity_empty')"
      >
        <template #text="{ activity }">{{ activity.text }}</template>
      </EhubActivityLog>
    </div>
  </section>
</template>

<style scoped>
.next-card { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; background: var(--ehub-card); border: 1px solid var(--ehub-line); border-left: 4px solid var(--ehub-primary); border-radius: 14px; padding: 16px 18px; margin-bottom: 16px; box-shadow: 0 6px 20px rgba(0,0,0,.05); }
.next-card__ico { width: 44px; height: 44px; border-radius: 12px; background: var(--ehub-primary-tint); color: var(--ehub-primary-text); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
.next-card__txt { flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: 2px; font-size: .85rem; color: var(--ehub-muted); }
.next-card__txt strong { font-size: 1rem; color: var(--ehub-ink); }
.next-card__k { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--ehub-primary-text); }

.chk { display: flex; align-items: center; gap: 11px; padding: 11px 17px; border-bottom: 1px solid var(--ehub-line); cursor: pointer; transition: background .12s; }
.chk:last-child { border-bottom: 0; }
.chk:hover { background: color-mix(in srgb, var(--ehub-field-bg) 55%, transparent); }
.chk-ico { width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: .62rem; flex-shrink: 0; }
.chk-ico.ok { background: color-mix(in srgb, #1f8a5b 15%, transparent); color: var(--ehub-success-text); }
.chk-ico.tip { background: var(--ehub-primary-tint); color: var(--ehub-primary-text); }
.chk-ico.warn { background: color-mix(in srgb, var(--ehub-gold) 22%, transparent); color: color-mix(in srgb, var(--ehub-gold), #000 38%); }
.chk-txt { flex: 1; font-size: .84rem; color: var(--ehub-ink); }
.chk-go { font-size: .72rem; color: var(--ehub-muted); }
:deep(.sc-delta.live) { color: var(--ehub-danger-text); }
</style>
