import { reactive } from 'vue';
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import OrganizationEventRegistration from '@/helpers/communication/OrganizationEventRegistration.js';
import OrganizationEventArticle from '@/helpers/communication/OrganizationEventArticle.js';
import OrganizationEventNotice from '@/helpers/communication/OrganizationEventNotice.js';
import OrganizationBilling from '@/helpers/communication/OrganizationBilling.js';

export const POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
export const EHUB_FEE = { percent: 2, min: 1 };

/** pending | live | done, from the stage flags. */
export function stageState(stage) {
  if (stage.finished) return 'done';
  if (stage.in_progress || stage.initialized) return 'live';
  return 'pending';
}

export function roundState(round) {
  if (round.finished) return 'done';
  if (round.in_progress) return 'live';
  return 'pending';
}

/** draft | open | full | in_progress | finished — same vocabulary as the public pages. */
export function eventStatus(event, confirmedCount) {
  if (!event) return 'open';
  if (event.publication === 'draft') return 'draft';
  if (event.finished) return 'finished';
  if (event.initialized) return 'in_progress';
  if (event.max_registrations && confirmedCount >= event.max_registrations) return 'full';
  return 'open';
}

export function lifecycleIndex(status) {
  return { draft: 0, open: 1, full: 1, in_progress: 2, finished: 3 }[status] ?? 1;
}

export function userName(reg) {
  // Team events: the team is the participant.
  if (reg?.team?.name) return reg.team.name;
  return reg?.user?.name || reg?.user?.username || '—';
}

/**
 * Translate an API error message key (e.g. "stage_already_started") using the
 * pages.event.manage.err namespace, falling back to the generic error.
 */
export function apiError(vm, data) {
  const key = typeof data === 'string' ? data : data?.message;
  const path = 'pages.event.manage.err.' + key;
  return key && vm.$te(path) ? vm.$t(path) : vm.$t('pages.event.manage.c.error');
}

/**
 * Per-screen state shared by every panel through provide/inject.
 */
export function createEventManageStore(orgRoute, eventRoute) {
  const s = reactive({
    orgRoute,
    eventRoute,
    event: null,
    regs: [],
    articles: [],
    notices: [],
    gateways: null, // null = unknown (no permission / not loaded)
    loading: true,
    notFound: false,
    // From the API (EventPermissions): which panels to show and what the user can do.
    perms: { role: null, panels: [], abilities: [] },
    // Single confirm dialog rendered by the view; panels call s.ask().
    confirm: { open: false, message: '', label: '', danger: false, resolve: null },
  });

  /** Promise-based confirm: resolves true when the user accepts. */
  s.ask = (message, label, danger = false) => new Promise((resolve) => {
    Object.assign(s.confirm, { open: true, message, label, danger, resolve });
  });

  s.answer = (ok) => {
    const done = s.confirm.resolve;
    Object.assign(s.confirm, { open: false, resolve: null });
    if (done) done(ok);
  };

  s.loadEvent = async () => {
    const res = await OrganizationEvent.show(s.orgRoute, s.eventRoute);
    if (res.code !== 200 || !res.data?.can_manage) {
      s.notFound = true;
      return;
    }
    s.event = res.data;
    s.perms = res.data.permissions || { role: null, panels: [], abilities: [] };
  };

  s.canPanel = (panel) => s.perms.panels.includes(panel);
  s.can = (ability) => s.perms.abilities.includes(ability);

  s.loadRegs = async () => {
    const res = await OrganizationEventRegistration.manage(s.orgRoute, s.eventRoute);
    if (res.code === 200) s.regs = res.data || [];
  };

  s.loadArticles = async () => {
    const res = await OrganizationEventArticle.getAll(s.orgRoute, s.eventRoute);
    if (res.code === 200) s.articles = res.data || [];
  };

  s.loadNotices = async () => {
    const res = await OrganizationEventNotice.index(s.orgRoute, s.eventRoute);
    if (res.code === 200) s.notices = res.data || [];
  };

  s.loadGateways = async () => {
    const res = await OrganizationBilling.getGateways(s.orgRoute);
    s.gateways = res.code === 200 ? (res.data || []) : null;
  };

  s.loadAll = async () => {
    s.loading = true;
    await s.loadEvent();
    if (!s.notFound) {
      await Promise.all([
        s.can('regs.view') ? s.loadRegs() : null,
        s.canPanel('news') || s.can('event.manage') ? s.loadArticles() : null,
        s.can('news.write') ? s.loadNotices() : null,
        s.can('gateways.view') ? s.loadGateways() : null,
      ]);
    }
    s.loading = false;
  };

  /** Replace one stage in place with the fresh copy returned by the API. */
  s.putStage = (stage) => {
    if (!s.event || !stage?.id) return;
    const i = s.event.stages.findIndex((x) => x.id === stage.id);
    if (i >= 0) s.event.stages.splice(i, 1, stage);
    else s.event.stages.push(stage);
  };

  s.putReg = (reg) => {
    const i = s.regs.findIndex((x) => x.id === reg.id);
    if (i >= 0) s.regs.splice(i, 1, reg);
  };

  s.regById = (id) => s.regs.find((r) => r.id === id);

  return s;
}
