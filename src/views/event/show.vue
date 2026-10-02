<script>
import { sanitizeHtml } from '@/helpers/General/sanitizeHtml.js';
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import OrganizationEventRegistration from '@/helpers/communication/OrganizationEventRegistration.js';
import Teams from '@/helpers/communication/Teams.js';
import OrganizationEventArticle from '@/helpers/communication/OrganizationEventArticle.js';
import SystemVars from '@/helpers/General/SystemVars';
import { toast } from '@/helpers/toast.js';
import EhubRegistrationModal from '@/components/modules/event-registration/EhubRegistrationModal.vue';
import EhubPrizeList from '@/components/modules/event-prizes/EhubPrizeList.vue';
import { normalizePrizes } from '@/components/modules/event-prizes/prizes.js';
import EhubLivePlayer from '@/components/modules/event-live/EhubLivePlayer.vue';
import EhubBracket from '@/components/modules/competition/EhubBracket.vue';
import { formatMs } from '@/components/modules/competition/time.js';
import EhubGroupTable from '@/components/modules/competition/EhubGroupTable.vue';
import EhubGroupMatches from '@/components/modules/competition/EhubGroupMatches.vue';
import { watchUrl } from '@/helpers/General/liveStream.js';
import { initialValues, validateAnswers } from '@/components/modules/event-registration/regForm.js';

const CAT_GRAD = {
  simracing:          ['#0098D8', '#00d4ff'],
  racingcars:         ['#0098D8', '#00d4ff'],
  rally:              ['#f08c00', '#ffc93c'],
  'esports-fps':      ['#e23b3b', '#ff8a3b'],
  'esports-moba':     ['#7C3AED', '#b06bff'],
  'esports-fighting': ['#d6336c', '#ff6b9d'],
  'esports-strategy': ['#1a6e4f', '#51cf66'],
  'esports-sports':   ['#2563eb', '#60a5fa'],
  motorsport:         ['#f08c00', '#ffc93c'],
  motorbike:          ['#dc4f00', '#ff8a3b'],
  cycling:            ['#1971c2', '#4dabf7'],
  running:            ['#1f8a5b', '#51cf66'],
  swimming:           ['#0284c7', '#38bdf8'],
  triathlon:          ['#7C3AED', '#c084fc'],
  hiking:             ['#4d7c0f', '#a3e635'],
  crossfit:           ['#9a3412', '#fb923c'],
  rowing:             ['#1d4ed8', '#93c5fd'],
  archery:            ['#92400e', '#fbbf24'],
  chess:              ['#495057', '#868e96'],
  'drone-racing':     ['#0e7490', '#22d3ee'],
}

const CAT_ICON = {
  simracing: 'car-side', racingcars: 'car-side', rally: 'car-side',
  'esports-fps': 'crosshairs', 'esports-moba': 'dragon',
  'esports-fighting': 'hand-fist', 'esports-strategy': 'chess-pawn',
  'esports-sports': 'futbol', motorsport: 'car-side', motorbike: 'motorcycle',
  cycling: 'bicycle', running: 'person-running', swimming: 'person-swimming',
  triathlon: 'person-running', hiking: 'mountain-sun', crossfit: 'dumbbell',
  rowing: 'water', archery: 'bullseye', chess: 'chess-knight',
  'drone-racing': 'helicopter',
}

export default {
  components: { EhubRegistrationModal, EhubPrizeList, EhubLivePlayer, EhubBracket, EhubGroupTable, EhubGroupMatches },
  data() {
    return {
      event: null,
      loading: true,
      activeTab: 'info',
      participants: [],
      participantsLoading: false,
      participantsLoaded: false,
      registering: false,
      showRegisterModal: false,
      myTeams: [],
      regTeamId: '',
      formData: {},
      formErrors: {},
      checkingPayment: false,
      retryingPayment: false,
      paymentCheckMessage: null,
      availableGateways: [],
      showGatewayModal: false,
      registerError: null,
      cancelOpen: false,
      focusStage: null,
      cancelling: false,
      articles: [],
      articlesLoading: false,
      articlesLoaded: false,
      baseUrl: SystemVars.baseUrl,
    };
  },

  computed: {
    orgColor() { return this.event?.organization?.color || null; },
    orgAccentStyle() {
      return { '--org-accent': this.orgColor || 'var(--ehub-primary)' };
    },
    orgTextColor() {
      const hex = this.orgColor;
      if (!hex || hex.length < 7) return '#fff';
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? '#111' : '#fff';
    },
    effectiveStartAt() {
      const stageStart = this.event?.stages?.find(s => s.start_at)?.start_at;
      return stageStart || this.event?.start_at || null;
    },
    startAtIsPreview() {
      return !this.event?.stages?.find(s => s.start_at);
    },
    // Organizer-defined extra info (wizard step 4); blank values stay hidden.
    extraInfo() {
      return (Array.isArray(this.event?.event_fields) ? this.event.event_fields : [])
        .filter(f => f?.name && String(f.value ?? '').trim());
    },
    prizeTotal() { return Number(this.event?.prize_pool_amount) || 0; },
    prizes() {
      return normalizePrizes(this.event?.event_data).filter(p => p.product || (this.prizeTotal && p.percent));
    },
    regTemplate() {
      return Array.isArray(this.event?.registration_form_template)
        ? this.event.registration_form_template : [];
    },
    catGrad() {
      const cat = this.event?.category;
      const g = cat ? CAT_GRAD[cat] : null;
      return g ? `linear-gradient(135deg, ${g[0]}, ${g[1]})` : 'linear-gradient(135deg, #0098D8, #00d4ff)';
    },
    catIcon() {
      const cat = this.event?.category;
      return CAT_ICON[cat] || 'trophy';
    },
    baseCatColor() {
      const cat = this.event?.category;
      const g = cat ? CAT_GRAD[cat] : null;
      return g ? g[0] : '#0098D8';
    },
    eventColor() {
      return this.event?.color || this.orgColor || this.baseCatColor;
    },
    eventFormat() {
      // The organizer's choice wins; the category guess is only for old events without it.
      const fmt = this.event?.format;
      if (fmt === 'groups') return 'bracket';
      if (['points', 'bracket', 'time'].includes(fmt)) return fmt;
      const cat = this.event?.category;
      const timeCategories = ['running', 'triathlon', 'swimming', 'cycling', 'hiking', 'rowing'];
      const bracketCategories = ['esports-fps', 'esports-moba', 'esports-fighting', 'esports-strategy', 'esports-sports', 'chess', 'archery', 'drone-racing'];
      if (timeCategories.includes(cat)) return 'time';
      if (bracketCategories.includes(cat)) return 'bracket';
      return 'points';
    },
    finishedStages() {
      return (this.event?.stages || []).filter(s => s.finished && s.results?.length);
    },
    standings() {
      if (!this.finishedStages.length) return [];
      // Knockout formats: the final bracket decides the places, not a sum of points.
      const lastBracket = [...this.finishedStages].reverse().find((st) => st.stage_type === 'bracket');
      // Timed events: total time over the finished stages (lowest first); missing a stage = DNF.
      if (this.event?.format === 'time') {
        const map = {};
        this.finishedStages.forEach((stage, si) => {
          stage.results.forEach((r) => {
            const e = map[r.registration_id] ||= { registration_id: r.registration_id, user: r.user, team: r.team, stageScores: {}, stagePos: {}, ms: 0, done: 0, wins: 0 };
            const ms = r.result_data?.time_ms;
            e.stageScores[si] = ms != null ? formatMs(ms) : (r.result_data?.status || 'dnf').toUpperCase();
            if (ms != null) { e.ms += ms; e.done += 1; }
            if (r.position === 1) e.wins += 1;
          });
        });
        const n = this.finishedStages.length;
        const list = Object.values(map).sort((a, b) => (b.done === n) - (a.done === n) || a.ms - b.ms);
        return list.map((e, i) => ({ ...e, position: i + 1, total: e.done === n ? formatMs(e.ms) : 'DNF' }));
      }
      // Before the knockout ends there is no overall leader (group points don't add up across groups).
      if (!lastBracket && ['bracket', 'groups'].includes(this.event?.format)) return [];
      if (lastBracket && ['bracket', 'groups'].includes(this.event?.format)) {
        return [...lastBracket.results].sort((a, b) => a.position - b.position).map((r) => ({
          registration_id: r.registration_id, user: r.user, team: r.team, position: r.position,
          total: r.score ?? 0, wins: r.position === 1 ? 1 : 0,
          stageScores: Object.fromEntries(this.finishedStages.map((st, si) => [si, st.id === lastBracket.id ? (r.score ?? 0) : null])),
          stagePos: {},
        }));
      }
      const map = {};
      this.finishedStages.forEach((stage, si) => {
        stage.results.forEach(result => {
          const key = result.registration_id;
          if (!map[key]) map[key] = { registration_id: key, user: result.user, team: result.team, stageScores: {}, stagePos: {}, total: 0, wins: 0 };
          const score = result.score ?? 0;
          map[key].stageScores[si] = score;
          map[key].stagePos[si] = result.position ?? null;
          map[key].total += score;
          if (result.position === 1) map[key].wins += 1;
        });
      });
      // Points first, then stage wins; entries still level share the position.
      const sorted = Object.values(map).sort((a, b) => b.total - a.total || b.wins - a.wins);
      let prev = null;
      return sorted.map((e, i) => {
        const tied = prev && prev.total === e.total && prev.wins === e.wins;
        const position = tied ? prev.position : i + 1;
        prev = { ...e, position };
        return prev;
      });
    },
    hasTies() {
      const seen = new Set();
      return this.standings.some((e) => (seen.has(e.position) ? true : (seen.add(e.position), false)));
    },
    leaders() { return this.standings.filter((e) => e.position === 1); },
    leaderEntry() { return this.leaders[0] || null; },
    myRegId() { return this.event?.user_registration?.id || null; },
    // The signed-in participant's own numbers, so they do not have to hunt for their name.
    myStanding() { return this.myRegId ? this.standings.find((e) => e.registration_id === this.myRegId) || null : null; },
    myStageResults() {
      if (!this.myRegId) return [];
      return (this.event?.stages || [])
        .map((st) => ({ stage: st, r: (st.results || []).find((x) => x.registration_id === this.myRegId) }))
        .filter((x) => x.r);
    },
    // Participant's pending head-to-head with both players known.
    myNextMatch() {
      if (!this.myRegId) return null;
      for (const st of this.event?.stages || []) {
        const m = (st.matches || []).find((x) => x.status === 'pending' && x.a && x.b
          && (x.a.registration_id === this.myRegId || x.b.registration_id === this.myRegId));
        if (m) {
          const rival = m.a.registration_id === this.myRegId ? m.b : m.a;
          return { stage: st, match: m, rival };
        }
      }
      return null;
    },
    nextStage() { return (this.event?.stages || []).find(s => !s.finished) || null; },
    regulationCards() { return this.$tm(`events.show.regulation.${this.eventFormat}`) || []; },
    eventGrad() {
      const hex = this.event?.color || this.orgColor;
      if (hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const light = `rgb(${Math.min(255,r+50)},${Math.min(255,g+50)},${Math.min(255,b+50)})`;
        return `linear-gradient(135deg, ${hex}, ${light})`;
      }
      return this.catGrad;
    },
    orgRoute() { return this.$route.params.orgRoute; },
    eventRoute() { return this.$route.params.eventRoute; },
    logoUrl() {
      return this.baseUrl + 'storage/org/' + this.orgRoute + '/events/' + this.eventRoute + '/logo.webp';
    },
    coverUrl() {
      return this.baseUrl + 'storage/org/' + this.orgRoute + '/events/' + this.eventRoute + '/cover.webp';
    },
    // Registration window: deadline is a calendar day, open until its end.
    deadlinePassed() {
      const d = this.event?.registration_deadline;
      if (!d) return false;
      const end = new Date(String(d).slice(0, 10) + 'T23:59:59');
      return Date.now() > end.getTime();
    },
    deadlineDaysLeft() {
      const d = this.event?.registration_deadline;
      if (!d || this.deadlinePassed) return null;
      const end = new Date(String(d).slice(0, 10) + 'T23:59:59');
      return Math.max(0, Math.floor((end.getTime() - Date.now()) / 86400000));
    },
    isFull() {
      const max = this.event?.max_registrations;
      return !!max && (this.event.registrations_count || 0) >= max;
    },
    spotsLeft() {
      const max = this.event?.max_registrations;
      return max ? Math.max(0, max - (this.event.registrations_count || 0)) : null;
    },
    regOpen() {
      return !!this.event && !this.event.initialized && !this.event.finished && !this.deadlinePassed && !this.isFull;
    },
    // What a visitor needs to know first: can I still join?
    statusKey() {
      if (this.event?.finished) return 'finished';
      if (this.event?.initialized) return 'in_progress';
      if (this.regOpen) return 'reg_open';
      return this.isFull ? 'full' : 'reg_closed';
    },
    runmodeLabel() {
      const m = this.event?.runmode;
      if (!m) return '';
      const key = 'pages.organization.manage.eventWizard.mode.' + m;
      return this.$te(key) ? this.$t(key) : m;
    },
    mapsUrl() {
      const loc = String(this.event?.location || '').trim();
      return loc ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(loc) : '';
    },
    // Paid and confirmed: refunded automatically when the organizer allows it and
    // the payment went through eHub (manual payments are settled with the organizer).
    paidConfirmed() {
      const r = this.event?.user_registration;
      return !!r && r.payment_status === 'confirmed' && Number(this.event.fee) > 0;
    },
    canCancel() {
      const r = this.event?.user_registration;
      if (!r || this.event.initialized || this.event.finished) return false;
      if (!this.paidConfirmed) return true;
      return this.event.self_refund !== false && !!r.refundable;
    },
    refundPolicyKey() {
      if (!(Number(this.event?.fee) > 0)) return '';
      return this.event.self_refund === false ? 'policy_none' : 'policy_full';
    },
    streams() {
      const out = [];
      const tw = watchUrl('twitch', this.event?.streaming_twitch);
      const yt = watchUrl('youtube', this.event?.streaming_youtube);
      if (tw) out.push({ key: 'twitch', icon: 'twitch', url: tw });
      if (yt) out.push({ key: 'youtube', icon: 'youtube', url: yt });
      return out;
    },
    liveStage() {
      return (this.event?.stages || []).find((s) => !s.finished && (s.in_progress || s.initialized)) || null;
    },
    // Player on the page while a stage is running (organizer can turn it off).
    showPlayer() {
      return !!this.streams.length && !!this.liveStage && !this.event?.finished
        && this.event?.event_data?.live_embed !== false;
    },
    slotsPct() {
      if (!this.event?.max_registrations) return 0;
      return Math.min(100, Math.round((this.event.registrations_count || 0) / this.event.max_registrations * 100));
    },
  },

  watch: {
    '$route.params.tab'() { this.applyRoute(); },
    '$route.params.sub'() { this.applyRoute(); },
  },

  async created() {
    const result = await OrganizationEvent.show(this.orgRoute, this.eventRoute);
    this.loading = false;
    if (result.code === 200 && result.data) {
      this.event = result.data;
    }
    this.checkPaymentReturn();
    // Back from sign-in/sign-up started by "register": continue right where the visitor left.
    if (this.$route.params.tab === 'join') {
      this.goTab('info');
      if (this.$store.getters.getToken && this.regOpen && !this.event?.user_registration) this.handleRegister();
      return;
    }
    this.applyRoute();
  },

  methods: {
    sanitizeHtml,
    formatDate(dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    },
    // Date plus time when the organizer set one (naive local strings, no midnight noise).
    formatDateTime(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const date = d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
      if (!d.getHours() && !d.getMinutes()) return date;
      return date + ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    },
    eventPath(tab, sub) {
      return { name: 'show-event-info', params: { orgRoute: this.orgRoute, eventRoute: this.eventRoute, tab: tab && tab !== 'info' ? tab : undefined, sub: sub || undefined } };
    },
    // Tabs live in the path (/stages, /standings...), never in ?query.
    goTab(tab, sub) {
      this.$router.replace(this.eventPath(tab, sub));
    },
    // Reflect the path on screen: tab, and the stage to highlight.
    applyRoute() {
      // Old links (?tab=stages&stage=...) move to the path form.
      const q = this.$route.query;
      if (q.tab || q.stage) {
        this.goTab(q.stage ? 'stages' : String(q.tab), q.stage ? String(q.stage) : undefined);
        return;
      }
      const tab = this.$route.params.tab || 'info';
      if (tab === 'join' || tab === 'payment') return;
      if (tab === 'participants') this.loadParticipants();
      else if (tab === 'news') this.loadArticles();
      else this.activeTab = tab;
      this.focusStage = tab === 'stages' ? (this.$route.params.sub || null) : null;
      if (this.focusStage) {
        this.$nextTick(() => document.getElementById('stage-' + this.focusStage)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      }
    },
    // Open the Stages tab on one stage (from a notification or "my results").
    openStage(route) {
      this.goTab('stages', route);
    },
    async shareEvent() {
      const url = window.location.origin + this.$route.path;
      try {
        if (navigator.share) { await navigator.share({ title: this.event?.name, url }); return; }
        await navigator.clipboard.writeText(url);
        toast.success(this.$t('events.show.join.link_copied'));
      } catch (e) { /* user closed the share sheet */ }
    },
    async doCancelRegistration() {
      this.cancelling = true;
      const res = await OrganizationEventRegistration.destroy(this.orgRoute, this.eventRoute);
      this.cancelling = false;
      this.cancelOpen = false;
      if (res.code === 200) {
        const wasCounted = ['free', 'confirmed'].includes(this.event.user_registration?.payment_status);
        this.event.user_registration = null;
        if (wasCounted) this.event.registrations_count = Math.max(0, (this.event.registrations_count || 1) - 1);
        this.participantsLoaded = false;
        toast.success(this.$t(res.refunded ? 'events.show.join.refunded' : 'events.show.join.cancelled'));
      } else {
        const known = ['refund_failed', 'self_refund_disabled', 'manual_refund', 'registrations_closed'];
        toast.error(this.$t('events.show.join.' + (known.includes(res.message) ? 'err.' + res.message : 'cancel_error')));
      }
    },
    initials(name) {
      if (!name) return '?';
      return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    },
    imgUrl(path) { return path ? this.baseUrl + 'storage/' + path : ''; },
    fmtFee(event) {
      if (!event) return '';
      if (event.fee == 0) return this.$t('pages.organization.show.events.free');
      return (event.currency?.toUpperCase() || '') + ' ' + Number(event.fee).toFixed(2);
    },
    stageStatusClass(stage) {
      if (stage.finished)    return 'finished';
      if (stage.in_progress) return 'active';
      if (stage.initialized) return 'active';
      return '';
    },
    stageStatusLabel(stage) {
      if (stage.finished)    return this.$t('events.show.stages.status.finished');
      if (stage.in_progress) return this.$t('events.show.stages.status.in_progress');
      if (stage.initialized) return this.$t('events.show.stages.status.initialized');
      return this.$t('events.show.stages.status.pending');
    },
    async loadParticipants() {
      this.activeTab = 'participants';
      if (this.$route.params.tab !== 'participants') this.goTab('participants');
      if (this.participantsLoaded) return;
      this.participantsLoading = true;
      const result = await OrganizationEventRegistration.index(this.orgRoute, this.eventRoute);
      this.participantsLoading = false;
      this.participantsLoaded = true;
      if (result.code === 200 && Array.isArray(result.data)) this.participants = result.data;
    },
    isUrl(v) { return /^https?:\/\/\S+$/i.test(String(v || '').trim()); },
    stageInfo(stage) {
      const values = stage?.config?.info || {};
      return (Array.isArray(this.event?.stage_fields) ? this.event.stage_fields : [])
        .filter(f => f?.key && String(values[f.key] ?? '').trim())
        .map(f => ({ ...f, value: values[f.key] }));
    },
    async handleRegister() {
      if (!this.$store.getters.getToken) {
        const back = this.$router.resolve(this.eventPath('join')).fullPath;
        this.$router.push({ name: 'user-login', query: { redirect: back } });
        return;
      }
      this.formData = initialValues(this.regTemplate);
      this.formErrors = {};
      this.showRegisterModal = true;
      if (this.event?.entry_type === 'team') {
        const r = await Teams.myTeams();
        this.myTeams = r.code === 200 ? r.data : [];
        const first = this.myTeams.find((t) => t.can_register);
        this.regTeamId = first ? first.id : '';
      }
    },
    async confirmRegister() {
      if (this.registering) return; // double tap
      const errors = validateAnswers(this.regTemplate, this.formData);
      this.formErrors = errors;
      if (Object.keys(errors).length) return;
      this.registering = true;
      const result = await OrganizationEventRegistration.store(
        this.orgRoute, this.eventRoute,
        { form_data: this.regTemplate.length ? { ...this.formData } : null, team_id: this.event?.entry_type === 'team' ? this.regTeamId : undefined }
      );
      this.registering = false;
      this.showRegisterModal = false;
      if (!result.registered && result.message === 'no_compatible_gateway') {
        this.registerError = 'no_compatible_gateway';
        return;
      }
      if (!result.registered) {
        const known = ['event_full', 'registrations_closed', 'registration_deadline_passed', 'already_registered', 'team_required', 'team_not_captain', 'team_already_registered', 'team_too_small'];
        toast.error(this.$t('events.show.join.err.' + (known.includes(result.message) ? result.message : 'generic')));
        return;
      }
      if (result.registered) {
        this.event.user_registration = result.data;
        this.event.registrations_count = (this.event.registrations_count || 0) + 1;
        this.participantsLoaded = false;
        if (!result.data?.payment_url && !result.data?.available_gateways?.length) {
          toast.success(this.$t('events.show.join.registered_toast', { event: this.event.name }));
        }
        if (result.data?.payment_url) {
          window.location.href = result.data.payment_url;
        } else if (result.data?.available_gateways?.length) {
          this.availableGateways = result.data.available_gateways;
          this.showGatewayModal = true;
        }
      }
    },
    async doCheckPayment() {
      this.checkingPayment = true;
      this.paymentCheckMessage = null;
      const result = await OrganizationEventRegistration.checkPayment(this.orgRoute, this.eventRoute);
      this.checkingPayment = false;
      if (result.code === 200) {
        const status = result.data?.status;
        if (status === 'confirmed') {
          this.event.user_registration.payment_status = 'confirmed';
          this.paymentCheckMessage = 'confirmed';
        } else {
          this.paymentCheckMessage = 'pending';
        }
      }
    },
    async doRetryPayment(gateway = null) {
      this.retryingPayment = true;
      this.paymentCheckMessage = null;
      const result = await OrganizationEventRegistration.retryPayment(this.orgRoute, this.eventRoute, gateway);
      this.retryingPayment = false;
      if (result.code === 200 && result.data?.available_gateways?.length) {
        this.availableGateways = result.data.available_gateways;
        this.showGatewayModal = true;
        return;
      }
      this.showGatewayModal = false;
      if (result.code === 200 && result.data?.payment_url) {
        window.location.href = result.data.payment_url;
      }
    },
    async selectGateway(gateway) { await this.doRetryPayment(gateway); },
    async loadArticles() {
      this.activeTab = 'news';
      if (this.$route.params.tab !== 'news') this.goTab('news');
      if (this.articlesLoaded) return;
      this.articlesLoading = true;
      const result = await OrganizationEventArticle.getAll(this.orgRoute, this.eventRoute);
      this.articlesLoading = false;
      this.articlesLoaded = true;
      if (result.code === 200 && Array.isArray(result.data)) this.articles = result.data;
    },
    checkPaymentReturn() {
      const payment = this.$route.params.tab === 'payment' ? this.$route.params.sub : this.$route.query.payment;
      if (!payment) return;
      if (payment === 'success')                      toast.success(this.$t('events.show.registration.payment_success'));
      else if (payment === 'failure' || payment === 'cancelled') toast.error(this.$t('events.show.registration.payment_failure'));
      else if (payment === 'pending')                 toast.warning(this.$t('events.show.registration.payment_pending'));
      this.$router.replace(this.eventPath('info'));
    },
  },
};
</script>

<template>
  <div class="ev-root" :style="orgAccentStyle">

    <!-- Loading skeleton -->
    <div v-if="loading" class="ev-skel-page">
      <div class="skel" style="height:230px;border-radius:0;width:100%"></div>
      <div class="container-fluid px-4">
        <div style="margin-top:-58px;padding-bottom:8px">
          <div style="display:flex;gap:20px;align-items:flex-end;flex-wrap:wrap">
            <div class="skel" style="width:110px;height:110px;border-radius:24px;flex-shrink:0;border:4px solid var(--ehub-card)"></div>
            <div style="flex:1;min-width:220px;display:flex;flex-direction:column;gap:9px;padding-bottom:4px">
              <div class="skel" style="height:14px;width:140px;border-radius:6px"></div>
              <div class="skel" style="height:28px;width:280px;border-radius:8px"></div>
              <div style="display:flex;gap:6px">
                <div v-for="i in 3" :key="i" class="skel" :style="{ height:'22px', width:'72px', borderRadius:'50rem', animationDelay: (i*0.06)+'s' }"></div>
              </div>
            </div>
          </div>
          <div style="display:flex;gap:1.5rem;margin-top:22px">
            <div v-for="i in 3" :key="'m'+i" class="skel" :style="{ height:'20px', width:'130px', borderRadius:'6px', animationDelay: (i*0.07)+'s' }"></div>
          </div>
        </div>
        <div style="display:flex;gap:.5rem;margin-top:32px;border-bottom:1px solid var(--ehub-line);padding-bottom:4px">
          <div v-for="i in 6" :key="'tab'+i" class="skel" :style="{ height:'36px', width:'100px', borderRadius:'8px', animationDelay: (i*0.06)+'s' }"></div>
        </div>
        <div class="skel" style="height:240px;border-radius:14px;margin-top:24px"></div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="!event" class="ev-empty" style="margin:40px auto;max-width:420px">
      <font-awesome-icon :icon="['fas', 'circle-info']" />
      <p class="mb-0 mt-2">{{ $t('pages.organization.show.events.empty') }}</p>
      <router-link :to="`/org/${orgRoute}`" class="back-link mt-3">
        <font-awesome-icon :icon="['fas', 'arrow-left']" /> {{ $t('pages.organization.general.back') }}
      </router-link>
    </div>

    <!-- Event detail -->
    <template v-else>

      <!-- ═══ HERO ═══ -->
      <header class="ev-hero">
        <div class="cover" :style="{ background: eventGrad }">
          <img :src="coverUrl" class="cover-photo" alt="" @error="$event.target.style.display='none'" />
        </div>
        <div class="cover-fade"></div>
        <font-awesome-icon :icon="['fas', catIcon]" class="cover-ico" />
      </header>

      <!-- ═══ HEAD ═══ -->
      <div class="container-fluid px-4">
        <div class="ev-head">
          <div class="ev-identity">

            <!-- Logo -->
            <div class="ev-logo" :style="{ background: eventGrad }">
              <img :src="logoUrl" class="ev-logo-img" alt=""
                @error="$event.target.style.display='none'" />
              <font-awesome-icon :icon="['fas', catIcon]" class="ev-logo-fallback"
                :style="{ color: orgTextColor }" />
            </div>

            <!-- Title block -->
            <div class="ev-titleblock">
              <router-link class="org-link" :to="`/org/${orgRoute}`">
                <span class="dot" :style="{ background: orgColor || eventColor }"></span>
                <span>{{ event.organization?.name || orgRoute }}</span>
              </router-link>
              <h1>{{ event.name }}</h1>
              <div class="ev-badges">
                <span v-if="event.category" class="badge-pill cat">{{ $t(`categories.names.${event.category}`) }}</span>
                <span v-if="event.runmode" class="badge-pill sub">
                  <font-awesome-icon :icon="['fas', event.runmode === 'irl' ? 'location-dot' : 'globe']" />
                  {{ runmodeLabel }}
                </span>
                <span class="badge-pill" :class="statusKey === 'finished' ? 'finished' : (statusKey === 'reg_closed' || statusKey === 'full' ? 'closed' : 'active')">
                  <font-awesome-icon :icon="['fas', { finished: 'flag', in_progress: 'bolt', reg_open: 'door-open', reg_closed: 'lock', full: 'lock' }[statusKey]]" />
                  {{ $t('events.show.status.' + statusKey) }}
                </span>
                <span class="badge-pill" :class="event.fee == 0 ? 'free' : 'paid'">
                  <font-awesome-icon :icon="['fas', event.fee == 0 ? 'circle-check' : 'coins']" />
                  {{ fmtFee(event) }}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="ev-actions">
              <!-- Already registered -->
              <template v-if="event.user_registration">
                <div v-if="event.user_registration.payment_status === 'pending'" class="d-flex flex-column gap-2 align-items-end">
                  <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-ghost round btn-sm px-3"
                      :disabled="checkingPayment || retryingPayment" @click="doCheckPayment">
                      <span v-if="checkingPayment" class="spinner-border spinner-border-sm me-1"></span>
                      <font-awesome-icon v-else :icon="['fas', 'rotate-right']" class="me-1" />
                      {{ $t('events.show.registration.check_payment') }}
                    </button>
                    <button class="btn btn-primary round btn-sm px-3"
                      :disabled="checkingPayment || retryingPayment" @click="doRetryPayment()">
                      <span v-if="retryingPayment" class="spinner-border spinner-border-sm me-1"></span>
                      <font-awesome-icon v-else :icon="['fas', 'credit-card']" class="me-1" />
                      {{ $t('events.show.registration.retry_payment') }}
                    </button>
                  </div>
                  <span v-if="paymentCheckMessage" class="small" :class="paymentCheckMessage === 'confirmed' ? 'text-success' : 'text-muted'">
                    {{ paymentCheckMessage === 'confirmed' ? $t('events.show.registration.payment_now_confirmed') : $t('events.show.registration.payment_still_pending') }}
                  </span>
                </div>
                <div v-else class="reg-done" role="status">
                  <font-awesome-icon :icon="['fas', 'circle-check']" class="reg-done__ico" />
                  <span>
                    <strong>{{ $t('events.show.registration.you_are_in') }}</strong>
                    <small>{{ $t('events.show.registration.you_are_in_hint') }}</small>
                  </span>
                </div>
              </template>

              <!-- Can register -->
              <template v-else-if="regOpen">
                <button class="btn btn-primary round px-4" :disabled="registering" @click="handleRegister">
                  <span v-if="registering" class="spinner-border spinner-border-sm me-1"></span>
                  <font-awesome-icon v-else :icon="['fas', 'user-plus']" class="me-2" />
                  {{ $store.getters.getToken ? $t('events.show.join.cta') : $t('events.show.registration.register') }}
                </button>
                <p v-if="registerError === 'no_compatible_gateway'" class="text-warning small mb-0 mt-1" style="max-width:240px;text-align:right;font-size:.8rem">
                  <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="me-1" />
                  {{ $t('events.show.registration.no_compatible_gateway') }}
                </p>
              </template>
              <button type="button" class="btn btn-ghost round px-3" :title="$t('events.show.join.share')" @click="shareEvent">
                <font-awesome-icon :icon="['fas', 'share-nodes']" class="me-1" />{{ $t('events.show.join.share') }}
              </button>
            </div>
          </div>

          <!-- Organizer shortcut: the page looks like the participant view otherwise -->
          <div v-if="event.can_manage" class="ev-orgbar">
            <font-awesome-icon :icon="['fas', 'user-gear']" class="ev-orgbar__ico" />
            <span class="ev-orgbar__txt">{{ $t('events.show.orgbar.text') }}</span>
            <router-link :to="{ name: 'manage-event', params: { orgRoute, eventRoute } }" class="btn btn-primary btn-sm round px-3">
              <font-awesome-icon :icon="['fas', 'sliders']" class="me-2" />{{ $t('events.show.orgbar.cta') }}
            </router-link>
          </div>

          <!-- Description -->
          <p v-if="event.short_description" class="ev-desc">{{ event.short_description }}</p>

          <!-- Metabar -->
          <div class="ev-metabar">
            <span v-if="effectiveStartAt" class="m">
              <font-awesome-icon :icon="['fas', 'calendar-days']" />
              <span class="lbl">{{ $t(startAtIsPreview ? 'events.show.info.start_at_preview' : 'events.show.info.start_at') }}</span>
              {{ formatDateTime(effectiveStartAt) }}
            </span>
            <a v-if="event.location" class="m m-link" :href="mapsUrl" target="_blank" rel="noopener noreferrer">
              <font-awesome-icon :icon="['fas', 'location-dot']" />
              <span class="lbl">{{ $t('events.show.info.location') }}</span>
              {{ event.location }}
            </a>
            <span v-if="event.registration_deadline" class="m">
              <font-awesome-icon :icon="['fas', 'hourglass-half']" />
              <span class="lbl">{{ $t('events.show.info.deadline') }}</span>
              {{ formatDate(String(event.registration_deadline).slice(0, 10) + 'T12:00:00') }}
            </span>
            <span v-if="event.stages?.length" class="m">
              <font-awesome-icon :icon="['fas', 'layer-group']" />
              <span class="lbl">{{ $t('events.show.tabs.stages') }}</span>
              {{ event.stages.length }}
            </span>
            <span v-if="event.max_registrations" class="m">
              <font-awesome-icon :icon="['fas', 'users']" />
              <span class="lbl">{{ $t('events.show.tabs.participants') }}</span>
              {{ event.registrations_count || 0 }} / {{ event.max_registrations }}
            </span>
            <span v-else-if="event.registrations_count" class="m">
              <font-awesome-icon :icon="['fas', 'users']" />
              {{ event.registrations_count }}
            </span>
          </div>

          <!-- Highlight row: leader + next stage -->
          <div v-if="leaderEntry || nextStage || myStanding" class="highlight-row">
            <div v-if="myStanding" class="hl-card me">
              <div class="hl-ico"><font-awesome-icon :icon="['fas', 'user']" /></div>
              <div class="hl-me">
                <div class="k">{{ $t('events.show.me.title') }}</div>
                <div class="v">{{ $t('events.show.me.position', { p: myStanding.position, n: standings.length }) }}<template v-if="standings.filter((e) => e.position === myStanding.position).length > 1">{{ ' (' + $t('events.show.me.tie') + ')' }}</template> · {{ myStanding.total }}<template v-if="event.format !== 'time'"> {{ $t('events.show.highlights.pts') }}</template></div>
                <div class="hl-me__stages">
                  <button v-for="x in myStageResults" :key="x.stage.id" type="button" class="hl-me__chip" @click="openStage(x.stage.route)">
                    {{ x.stage.name }}: <b>{{ x.r.position }}º</b> · {{ x.r.score ?? 0 }} {{ $t('events.show.highlights.pts') }}
                  </button>
                </div>
              </div>
            </div>
            <div v-if="leaderEntry" class="hl-card leader">
              <div class="hl-ico"><font-awesome-icon :icon="['fas', 'trophy']" /></div>
              <div>
                <div class="k">{{ event.finished ? $t('events.show.highlights.champion') : $t('events.show.highlights.leader') }}</div>
                <div class="v">
                  <template v-for="(l, li) in leaders" :key="l.registration_id">
                    <span v-if="li">{{ li === leaders.length - 1 ? ' ' + $t('events.show.me.and') + ' ' : ', ' }}</span>
                    <router-link v-if="l.user?.username" :to="`/profile/${l.user.username}`" style="text-decoration:none;color:inherit;">{{ l.team?.name || l.user?.name || $t('events.show.removed_participant') }}</router-link>
                    <span v-else>{{ l.team?.name || l.user?.name || $t('events.show.removed_participant') }}</span>
                  </template>
                </div>
                <div class="s">{{ leaderEntry.total }}<template v-if="event.format !== 'time'"> {{ $t('events.show.highlights.pts') }}</template><template v-if="leaders.length > 1"> · {{ $t('events.show.me.tied') }}</template></div>
              </div>
            </div>
            <div v-if="nextStage" class="hl-card next">
              <div class="hl-ico"><font-awesome-icon :icon="['fas', 'layer-group']" /></div>
              <div>
                <div class="k">{{ $t(nextStage === liveStage ? 'events.show.highlights.live_stage' : 'events.show.highlights.next_stage') }}</div>
                <div class="v">{{ nextStage.name }}</div>
                <div v-if="nextStage.start_at" class="s">{{ formatDate(nextStage.start_at) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ TABS ═══ -->
        <div class="ehub-tabs">
          <button class="tab-btn" :class="{ active: activeTab === 'info' }" @click="goTab('info')">
            <font-awesome-icon :icon="['fas', 'circle-info']" />
            {{ $t('events.show.tabs.info') }}
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'stages' }" @click="goTab('stages')">
            <font-awesome-icon :icon="['fas', 'layer-group']" />
            {{ $t('events.show.tabs.stages') }}
            <span v-if="event.stages?.length" class="tab-badge">{{ event.stages.length }}</span>
          </button>
          <button v-if="finishedStages.length" class="tab-btn" :class="{ active: activeTab === 'standings' }" @click="goTab('standings')">
            <font-awesome-icon :icon="['fas', 'trophy']" />
            {{ $t('events.show.tabs.standings') }}
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'participants' }" @click="loadParticipants">
            <font-awesome-icon :icon="['fas', 'users']" />
            {{ $t('events.show.tabs.participants') }}
            <span v-if="event.registrations_count" class="tab-badge">{{ event.registrations_count }}</span>
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'regulation' }" @click="goTab('regulation')">
            <font-awesome-icon :icon="['fas', 'clipboard-list']" />
            {{ $t('events.show.tabs.regulation') }}
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'news' }" @click="loadArticles">
            <font-awesome-icon :icon="['fas', 'newspaper']" />
            {{ $t('events.show.tabs.news') }}
          </button>
        </div>

        <!-- ═══ TAB: INFO ═══ -->
        <section v-if="activeTab === 'info'" class="tab-pane active ev-info-grid">
          <aside class="ev-join">
            <div class="ev-join__price" :class="{ free: event.fee == 0 }">
              <span class="k">{{ $t('events.show.join.entry') }}</span>
              <span class="v">{{ fmtFee(event) }}</span>
            </div>

            <div v-if="event.max_registrations" class="ev-join__slots">
              <div class="ev-join__slots-row">
                <span>{{ $t('events.show.join.registered_n', { n: event.registrations_count || 0 }, event.registrations_count || 0) }}</span>
                <strong v-if="regOpen">{{ $t('events.show.join.spots_left', { n: spotsLeft }, spotsLeft) }}</strong>
              </div>
              <div class="ev-join__bar"><span :style="{ width: slotsPct + '%' }"></span></div>
            </div>

            <ul class="ev-join__facts">
              <li v-if="effectiveStartAt">
                <font-awesome-icon :icon="['fas', 'calendar-days']" />
                <div><span class="k">{{ $t(startAtIsPreview ? 'events.show.info.start_at_preview' : 'events.show.info.start_at') }}</span>{{ formatDateTime(effectiveStartAt) }}</div>
              </li>
              <li v-if="event.runmode">
                <font-awesome-icon :icon="['fas', event.runmode === 'irl' ? 'location-dot' : 'globe']" />
                <div>
                  <span class="k">{{ $t('events.show.info.where') }}</span>
                  <a v-if="event.location" :href="mapsUrl" target="_blank" rel="noopener noreferrer">{{ event.location }}</a>
                  <template v-else>{{ runmodeLabel }}</template>
                </div>
              </li>
              <li v-if="event.registration_deadline">
                <font-awesome-icon :icon="['fas', 'hourglass-half']" />
                <div>
                  <span class="k">{{ $t('events.show.info.deadline') }}</span>
                  {{ formatDate(String(event.registration_deadline).slice(0, 10) + 'T12:00:00') }}
                  <em v-if="regOpen && deadlineDaysLeft !== null" class="ev-join__urgent">
                    {{ deadlineDaysLeft === 0 ? $t('events.show.join.last_day') : $t('events.show.join.days_left', { n: deadlineDaysLeft }, deadlineDaysLeft) }}
                  </em>
                </div>
              </li>
              <li v-if="event.stages?.length">
                <font-awesome-icon :icon="['fas', 'layer-group']" />
                <div><span class="k">{{ $t('events.show.tabs.stages') }}</span>{{ $t('events.show.join.stages_n', { n: event.stages.length }, event.stages.length) }}</div>
              </li>
            </ul>

            <!-- Registered -->
            <template v-if="event.user_registration">
              <div class="ev-join__state ok">
                <font-awesome-icon :icon="['fas', event.user_registration.payment_status === 'pending' ? 'clock' : 'circle-check']" />
                {{ event.user_registration.payment_status === 'pending' ? $t('events.show.registration.pending') : $t('events.show.join.you_are_in') }}
              </div>
              <button v-if="canCancel" type="button" class="btn btn-link btn-sm ev-join__cancel" @click="cancelOpen = true">
                {{ $t('events.show.join.cancel') }}
              </button>
            </template>
            <!-- Open -->
            <template v-else-if="regOpen">
              <p class="ev-join__note">{{ event.fee == 0 ? $t('events.show.join.note_free') : $t('events.show.join.note_paid') }}</p>
              <p v-if="refundPolicyKey" class="ev-join__policy">
                <font-awesome-icon :icon="['fas', refundPolicyKey === 'policy_full' ? 'rotate-left' : 'circle-info']" />
                {{ $t('events.show.join.' + refundPolicyKey) }}
              </p>
            </template>
            <!-- Closed -->
            <div v-else class="ev-join__state closed">
              <font-awesome-icon :icon="['fas', 'lock']" />
              {{ $t('events.show.join.closed.' + statusKey) }}
            </div>

          </aside>

          <div class="ev-info-main">
          <div v-if="showPlayer" class="mb-4">
            <h3 class="ev-sec-title ev-live-title"><span class="ev-live-dot"></span>{{ $t('events.show.info.live_now') }}</h3>
            <EhubLivePlayer :twitch="event.streaming_twitch || ''" :youtube="event.streaming_youtube || ''" />
          </div>
          <div v-if="event.description" class="ev-reg-card mb-4">
            <div class="ev-description" v-html="sanitizeHtml(event.description)"></div>
          </div>
          <div v-if="extraInfo.length" class="ev-extra-grid mb-4">
            <div v-for="f in extraInfo" :key="f.key" class="ev-extra">
              <font-awesome-icon :icon="['fas', f.icon || 'circle-info']" class="ev-extra__ico" />
              <div class="ev-extra__txt">
                <div class="ev-extra__lbl">{{ f.name }}</div>
                <a v-if="isUrl(f.value)" :href="f.value" target="_blank" rel="noopener noreferrer" class="ev-extra__val">{{ f.value }}</a>
                <div v-else class="ev-extra__val">{{ f.value }}</div>
              </div>
            </div>
          </div>
          <div v-if="prizeTotal || prizes.length" class="mb-4">
            <h3 class="ev-sec-title">{{ $t('common.prizes.title') }}</h3>
            <EhubPrizeList :prizes="prizes" :total="prizeTotal" :currency="event.prize_pool_currency || event.currency || 'BRL'" />
          </div>
          <div v-if="streams.length && !showPlayer" class="mb-4">
            <h3 class="ev-sec-title">{{ $t('events.show.info.watch') }}</h3>
            <div class="ev-streams">
              <a v-for="s in streams" :key="s.key" :href="s.url" target="_blank" rel="noopener noreferrer" class="ev-stream" :class="s.key">
                <font-awesome-icon :icon="['fab', s.icon]" />{{ s.url.replace(/^https?:\/\//, '') }}
              </a>
            </div>
          </div>
          <div class="ev-empty" v-if="!event.description && !extraInfo.length && !prizeTotal && !prizes.length && !streams.length">
            <font-awesome-icon :icon="['fas', 'circle-info']" />
            <p class="mb-0 mt-2">{{ $t('events.show.info.no_details') }}</p>
          </div>
          </div>
        </section>

        <!-- ═══ TAB: STAGES ═══ -->
        <section v-if="activeTab === 'stages'" class="tab-pane active">
          <div v-if="!event.stages?.length" class="ev-empty">
            <font-awesome-icon :icon="['fas', 'layer-group']" />
            <p class="mb-0 mt-2">{{ $t('events.show.stages.empty') }}</p>
          </div>
          <div v-if="myNextMatch" class="my-match">
            <font-awesome-icon :icon="['fas', 'bolt']" class="my-match__ico" />
            <div>
              <div class="my-match__lbl">{{ $t('competition.bracket.next_match') }} · {{ myNextMatch.stage.name }}</div>
              <strong>{{ $t('competition.bracket.vs') }} {{ myNextMatch.rival.name || myNextMatch.rival.username || $t('events.show.removed_participant') }}</strong>
            </div>
          </div>
          <div v-if="event.stages?.length" class="stage-list">
            <div v-for="(stage, idx) in event.stages" :key="stage.id" :id="'stage-' + stage.route" class="stage-item" :class="{ focus: focusStage === stage.route }">
              <div class="stage-head" role="button">
                <div class="lhs">
                  <div class="stage-flag">
                    <font-awesome-icon :icon="['fas', 'layer-group']" />
                  </div>
                  <div>
                    <div class="stage-title">
                      {{ idx + 1 }}. {{ stage.name }}
                      <span class="badge-pill" :class="stageStatusClass(stage)" style="font-size:.72rem;padding:3px 10px">
                        {{ stageStatusLabel(stage) }}
                      </span>
                    </div>
                    <div v-if="stage.start_at" class="stage-date">
                      <font-awesome-icon :icon="['fas', 'calendar']" class="me-1" />
                      {{ formatDate(stage.start_at) }}
                    </div>
                    <div v-if="stageInfo(stage).length" class="stage-info">
                      <span v-for="f in stageInfo(stage)" :key="f.key" class="stage-info__chip">
                        <font-awesome-icon :icon="['fas', f.icon || 'circle-info']" />
                        <span class="lbl">{{ f.name }}:</span> {{ f.value }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Knockout bracket (live) -->
              <div v-if="stage.stage_type === 'bracket' && stage.matches?.some((m) => m.kind === 'bracket')" class="stage-body">
                <EhubBracket :matches="stage.matches" :highlight="myRegId" />
              </div>

              <!-- Group: live table and games -->
              <div v-if="stage.stage_type === 'group' && stage.matches?.some((m) => m.kind === 'group')" class="stage-body">
                <EhubGroupTable :results="stage.results || []" :highlight="myRegId" />
                <EhubGroupMatches :matches="stage.matches" :highlight="myRegId" class="mt-3" />
              </div>

              <!-- Stage results -->
              <div v-if="stage.finished && stage.results?.length && stage.stage_type !== 'group'" class="stage-body">
                <div class="table-wrap">
                  <table class="ev-table">
                    <thead>
                      <tr>
                        <th class="l" style="width:64px">{{ $t('events.show.standings.pos') }}</th>
                        <th class="l">{{ $t('events.show.stages.results.participant') }}</th>
                        <th class="c">{{ $t(stage.stage_type === 'time' ? 'competition.time.time' : 'events.show.stages.results.score') }}</th>
                        <th v-if="stage.results.some((x) => x.qualified)" class="c">{{ $t('events.show.stages.results.qualified_full') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="result in stage.results" :key="result.registration_id || result.position" :class="{ mine: result.registration_id === myRegId }">
                        <td class="l">
                          <span class="pos-badge" :class="{ 1: 'p1', 2: 'p2', 3: 'p3' }[result.position] || ''">{{ result.position ?? '—' }}</span>
                        </td>
                        <td class="l driver-cell">
                          <router-link v-if="result.user?.username" :to="`/profile/${result.user.username}`" style="text-decoration:none;color:inherit;">
                            <div class="nm">{{ result.team?.name || result.user?.name || $t('events.show.removed_participant') }}<span v-if="result.registration_id === myRegId" class="you-chip">{{ $t('events.show.me.you') }}</span></div>
                          </router-link>
                          <div v-else class="nm">{{ result.team?.name || result.user?.name || $t('events.show.removed_participant') }}<span v-if="result.registration_id === myRegId" class="you-chip">{{ $t('events.show.me.you') }}</span></div>
                        </td>
                        <td v-if="stage.stage_type === 'time'" class="c pts-cell">{{ result.result_data?.time || (result.result_data?.status || '—').toUpperCase() }}</td>
                        <td v-else class="c pts-cell">{{ result.score ?? '—' }}</td>
                        <td v-if="stage.results.some((x) => x.qualified)" class="c">
                          <font-awesome-icon v-if="result.qualified" :icon="['fas', 'circle-check']" class="qualified-ico" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══ TAB: PARTICIPANTS ═══ -->
        <section v-if="activeTab === 'participants'" class="tab-pane active">
          <div v-if="participantsLoading" class="text-center py-4">
            <div class="spinner-border spinner-border-sm text-primary"></div>
          </div>
          <template v-else>
            <!-- Slots bar -->
            <div v-if="event.max_registrations" class="reg-head mb-4">
              <div>
                <div class="info">
                  <b>{{ event.registrations_count || 0 }}</b> / {{ event.max_registrations }} {{ $t('events.show.participants.title', { n: '' }).replace('{n}','').trim() }}
                </div>
                <div class="slots-track mt-2"><span :style="{ width: slotsPct + '%' }"></span></div>
              </div>
            </div>
            <div v-if="!participants.length" class="ev-empty">
              <font-awesome-icon :icon="['fas', 'users']" />
              <p class="mb-0 mt-2">{{ $t('events.show.participants.empty') }}</p>
            </div>
            <div v-else class="part-grid">
              <router-link
                v-for="(p, i) in participants"
                :key="p.id"
                :to="p.user?.username ? `/profile/${p.user.username}` : '#'"
                class="part-card"
                style="text-decoration:none;color:inherit;"
              >
                <div class="part-av" :style="{ background: `hsl(${(i * 47) % 360}, 60%, 45%)` }">
                  <img v-if="p.user?.username"
                    :src="baseUrl + 'storage/users/' + p.user.username + '/profile.webp'"
                    :alt="p.user.name"
                    style="width:100%;height:100%;object-fit:cover;border-radius:50%"
                    @error="$event.target.style.display='none'" />
                  <template v-else>{{ initials(p.user?.name) }}</template>
                </div>
                <div class="part-info">
                  <div class="part-name">{{ p.team?.name || p.user?.name || $t('events.show.removed_participant') }}</div>
                  <div v-if="p.user?.username" class="part-team">@{{ p.user.username }}</div>
                </div>
                <span class="part-seed">
                  {{ p.payment_status === 'free' ? $t('pages.organization.show.events.free') : $t('events.show.registration.confirmed') }}
                </span>
              </router-link>
            </div>
          </template>
        </section>

        <!-- ═══ TAB: STANDINGS ═══ -->
        <section v-if="activeTab === 'standings'" class="tab-pane active">
          <div v-if="!standings.length" class="ev-empty">
            <font-awesome-icon :icon="['fas', 'trophy']" />
            <p class="mb-0 mt-2">{{ $t('events.show.standings.empty') }}</p>
          </div>
          <div v-else class="standings-wrap">
            <table class="ev-table">
              <thead>
                <tr>
                  <th class="l" style="width:46px">{{ $t('events.show.standings.pos') }}</th>
                  <th class="l">{{ $t('events.show.standings.participant') }}</th>
                  <th v-for="(stage, si) in finishedStages" :key="stage.id" class="c" :title="stage.name">
                    {{ $t('events.show.standings.stage_n', { n: si + 1 }) }}
                  </th>
                  <th class="c">{{ $t('events.show.standings.total') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in standings" :key="entry.registration_id" :class="{ mine: entry.registration_id === myRegId }">
                  <td class="l">
                    <span class="pos-badge" :class="entry.position === 1 ? 'p1' : entry.position === 2 ? 'p2' : entry.position === 3 ? 'p3' : ''">
                      {{ entry.position }}
                    </span>
                  </td>
                  <td class="l driver-cell">
                    <router-link
                      v-if="entry.user?.username"
                      :to="`/profile/${entry.user.username}`"
                      style="text-decoration:none;color:inherit;"
                    >
                      <div class="nm">{{ entry.team?.name || entry.user?.name || $t('events.show.removed_participant') }}<span v-if="entry.registration_id === myRegId" class="you-chip">{{ $t('events.show.me.you') }}</span></div>
                      <div class="sub">@{{ entry.user.username }}</div>
                    </router-link>
                    <div v-else class="nm">{{ entry.team?.name || entry.user?.name || $t('events.show.removed_participant') }}</div>
                  </td>
                  <td v-for="(stage, si) in finishedStages" :key="stage.id" class="c pts-cell" :class="entry.stageScores[si] != null ? 'top' : ''">
                    {{ entry.stageScores[si] ?? '—' }}
                  </td>
                  <td class="c pts-total">{{ entry.total }}</td>
                </tr>
              </tbody>
            </table>
            <p class="standings-note">
              <font-awesome-icon :icon="['fas', 'circle-info']" />{{ $t('events.show.standings.note') }}<template v-if="hasTies">{{ ' ' + $t('events.show.standings.tie_note') }}</template>
            </p>
          </div>
        </section>

        <!-- ═══ TAB: NEWS ═══ -->
        <section v-if="activeTab === 'news'" class="tab-pane active">
          <div v-if="articlesLoading" class="text-center py-4">
            <div class="spinner-border spinner-border-sm text-primary"></div>
          </div>
          <template v-else>
            <div v-if="!articles.length" class="ev-empty">
              <font-awesome-icon :icon="['fas', 'newspaper']" />
              <p class="mb-0 mt-2">{{ $t('events.show.news.empty') }}</p>
            </div>
            <div v-else class="news-list" style="display:flex;flex-direction:column;gap:12px">
              <router-link
                v-for="article in articles" :key="article.id"
                :to="`/org/${orgRoute}/event/${eventRoute}/news/${article.slug}`"
                class="news-item"
                style="text-decoration:none"
              >
                <div class="news-item-head">
                  <div class="news-item-meta">
                    <span class="news-cat comunicado">{{ $t('events.show.tabs.news') }}</span>
                    <span class="news-date">{{ formatDate(article.published_at) }}</span>
                  </div>
                </div>
                <div class="news-item-body">
                  <div class="news-item-title">{{ article.title }}</div>
                  <div v-if="article.excerpt" class="news-item-text">{{ article.excerpt }}</div>
                </div>
                <div v-if="article.author" class="news-item-foot">
                  <div class="news-author">
                    <div class="news-author-dot" :style="{ background: orgColor || eventColor }">{{ initials(article.author.name) }}</div>
                    {{ article.author.name }}
                  </div>
                  <span class="news-read-more">
                    {{ $t('pages.organization.show.events.see_more') }}
                    <font-awesome-icon :icon="['fas', 'arrow-right']" />
                  </span>
                </div>
              </router-link>
            </div>
          </template>
        </section>

        <!-- ═══ TAB: REGULATION ═══ -->
        <section v-if="activeTab === 'regulation'" class="tab-pane active">
          <div v-if="event.rules" class="ev-reg-card mb-4">
            <h3 class="ev-sec-title">{{ $t('events.show.regulation_title') }}</h3>
            <div class="ev-rules">{{ event.rules }}</div>
          </div>
          <div v-if="event.tech_requirements" class="ev-reg-card mb-4">
            <h3 class="ev-sec-title">{{ $t('events.show.tech_requirements') }}</h3>
            <div class="ev-rules">{{ event.tech_requirements }}</div>
          </div>
          <template v-if="!event.rules">
          <div v-if="!regulationCards.length" class="ev-empty">
            <font-awesome-icon :icon="['fas', 'clipboard-list']" />
            <p class="mb-0 mt-2">—</p>
          </div>
          <div v-else class="reg-grid">
            <div v-for="(card, i) in regulationCards" :key="i" class="reg-card">
              <h3><font-awesome-icon :icon="['fas', card.i]" /> {{ card.t }}</h3>
              <p>{{ card.b }}</p>
            </div>
          </div>
          </template>
        </section>

      </div>
    </template>

    <!-- ═══ GATEWAY MODAL ═══ -->
    <div v-if="showGatewayModal" class="modal-overlay" @click.self="showGatewayModal = false">
      <div class="modal-card">
        <div class="modal-card__header">
          <h5 class="mb-0">{{ $t('events.show.registration.choose_gateway.title') }}</h5>
          <button class="btn-close btn-close-white" @click="showGatewayModal = false"></button>
        </div>
        <div class="modal-card__body">
          <div class="gateway-list">
            <button v-for="gw in availableGateways" :key="gw" class="gateway-btn" :disabled="retryingPayment" @click="selectGateway(gw)">
              <span v-if="retryingPayment" class="spinner-border spinner-border-sm me-2"></span>
              <font-awesome-icon v-else :icon="['fas', 'credit-card']" class="me-2" />
              {{ $t(`events.show.registration.choose_gateway.${gw}`) }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ REGISTER MODAL ═══ -->
    <EhubRegistrationModal
      v-if="showRegisterModal"
      :event-name="event?.name || ''"
      :accent="orgColor || ''"
      :fee="Number(event?.fee) || 0"
      :currency="event?.currency || ''"
      :fields="regTemplate"
      v-model="formData"
      :errors="formErrors"
      :loading="registering"
      :rules-available="!!event?.rules"
      :team-mode="event?.entry_type === 'team'"
      :teams="myTeams"
      v-model:team-id="regTeamId"
      :team-size="Number(event?.team_size) || 0"
      @close="showRegisterModal = false"
      @confirm="confirmRegister"
      @open-rules="showRegisterModal = false; goTab('regulation')"
    />

    <!-- ═══ CANCEL REGISTRATION ═══ -->
    <div v-if="cancelOpen" class="modal-overlay" @click.self="cancelOpen = false">
      <div class="modal-card">
        <div class="modal-card__header">
          <h5 class="mb-0">{{ $t('events.show.join.cancel_title') }}</h5>
          <button class="btn-close btn-close-white" @click="cancelOpen = false"></button>
        </div>
        <div class="modal-card__body">
          <p class="mb-0">{{ $t('events.show.join.cancel_text', { event: event?.name }) }}</p>
          <p v-if="paidConfirmed" class="ev-refund-note mb-0 mt-2">
            <font-awesome-icon :icon="['fas', 'rotate-left']" />
            {{ $t('events.show.join.refund_text', { amount: fmtFee(event) }) }}
          </p>
        </div>
        <div class="modal-card__footer">
          <button class="btn btn-outline-secondary btn-sm" @click="cancelOpen = false">{{ $t('events.show.join.keep') }}</button>
          <button class="btn btn-danger btn-sm" :disabled="cancelling" @click="doCancelRegistration">
            <span v-if="cancelling" class="spinner-border spinner-border-sm me-1"></span>{{ $t(paidConfirmed ? 'events.show.join.cancel_refund_confirm' : 'events.show.join.cancel_confirm') }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.hl-card.me { background: color-mix(in srgb, var(--ehub-primary) 7%, var(--ehub-card)); border-color: var(--ehub-primary-border); }
.hl-card.me .hl-ico { background: var(--ehub-primary-tint); color: var(--ehub-primary-text); }
.hl-card.me .k { color: var(--ehub-primary-text); }
.hl-me { min-width: 0; }
.hl-me__stages { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.hl-me__chip { border: 1px solid var(--ehub-line); background: var(--ehub-card); color: var(--ehub-ink); font-size: .78rem; padding: 4px 10px; border-radius: 50rem; min-height: 30px; }
.hl-me__chip:hover { border-color: var(--ehub-primary); }
.you-chip { display: inline-block; margin-left: 8px; font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: var(--ehub-primary-text); background: var(--ehub-primary-tint); padding: 1px 8px; border-radius: 50rem; vertical-align: middle; }
table.ev-table tr.mine td { background: color-mix(in srgb, var(--ehub-primary) 6%, transparent); }
table.ev-table th.c, table.ev-table td.c { text-align: center; }
.standings-note { display: flex; gap: 6px; align-items: flex-start; font-size: .8rem; color: var(--ehub-muted); margin: 10px 4px 0; }
.standings-note svg { margin-top: 3px; }
.stage-item.focus { box-shadow: 0 0 0 2px var(--ehub-primary); }

.ev-orgbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 16px; padding: 10px 14px; border-radius: 12px; background: var(--ehub-primary-tint); border: 1px solid var(--ehub-primary-border); }
.ev-orgbar__ico { color: var(--ehub-primary-text); }
.ev-orgbar__txt { flex: 1; min-width: 180px; font-size: .88rem; font-weight: 600; color: var(--ehub-ink); }

.ev-live-title { display: flex; align-items: center; gap: 8px; }
.ev-live-dot { width: 9px; height: 9px; border-radius: 50%; background: #e23b3b; box-shadow: 0 0 0 0 rgba(226,59,59,.6); animation: ev-live-pulse 1.6s infinite; }
@keyframes ev-live-pulse { 0% { box-shadow: 0 0 0 0 rgba(226,59,59,.6); } 70% { box-shadow: 0 0 0 8px rgba(226,59,59,0); } 100% { box-shadow: 0 0 0 0 rgba(226,59,59,0); } }

/* Org colors are chosen freely: small text uses a darker shade so it stays readable (WCAG AA). */
.ev-root { --org-accent-text: color-mix(in srgb, var(--org-accent, var(--ehub-primary)), #000 28%); }
html[data-bs-theme="dark"] .ev-root { --org-accent-text: color-mix(in srgb, var(--org-accent, var(--ehub-primary)), #fff 12%); }

.ev-join__policy { display: flex; gap: 6px; align-items: center; font-size: .78rem; color: var(--ehub-muted); margin: 6px 0 0; }
.ev-refund-note { display: flex; gap: 8px; align-items: flex-start; font-size: .84rem; background: color-mix(in srgb, #1f8a5b 10%, transparent); color: var(--ehub-ink); border-radius: 8px; padding: 9px 11px; }
.ev-refund-note svg { color: var(--ehub-success-text); margin-top: 3px; }

/* ── Skeleton ── */
.ev-skel-page { background: var(--ehub-page); min-height: 100vh; }

/* ── Hero ── */
.ev-hero { position: relative; height: 230px; overflow: hidden; border-bottom: 1px solid var(--ehub-line); }
.ev-hero .cover { position: absolute; inset: 0; overflow: hidden; }
.ev-hero .cover-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .85; }
.ev-hero .cover::after { content: ''; position: absolute; inset: 0; background-image: repeating-linear-gradient(118deg, transparent 0 46px, rgba(255,255,255,.06) 46px 48px); }
.ev-hero .cover-fade { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 30%, color-mix(in srgb, var(--ehub-page) 90%, transparent) 100%); }
.cover-ico { position: absolute; top: 26px; left: 30px; font-size: 2.4rem; color: rgba(255,255,255,.9); filter: drop-shadow(0 2px 10px rgba(0,0,0,.35)); }
.breadcrumb-bar { position: absolute; top: 16px; right: 22px; z-index: 2; display: flex; align-items: center; gap: 8px; font-size: .8rem; font-weight: 600; }
.breadcrumb-bar a { color: #fff; background: rgba(0,0,0,.3); backdrop-filter: blur(6px); padding: 6px 12px; border-radius: 50rem; text-decoration: none; }
.breadcrumb-bar a:hover { background: rgba(0,0,0,.45); }

/* ── Head ── */
.ev-head { position: relative; margin-top: -58px; padding-bottom: 8px; }
.ev-identity { display: flex; align-items: flex-end; gap: 20px; flex-wrap: wrap; }
.ev-logo { width: 110px; height: 110px; border-radius: 24px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 2.6rem; color: #fff; border: 4px solid var(--ehub-card); box-shadow: 0 8px 24px rgba(0,0,0,.24); overflow: hidden; position: relative; }
.ev-logo-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 2; }
.ev-logo-fallback { position: relative; z-index: 1; }
.ev-titleblock { flex: 1; min-width: 260px; padding-bottom: 0; }
.ev-titleblock .org-link { display: inline-flex; align-items: center; gap: 7px; font-size: .85rem; font-weight: 600; color: var(--ehub-muted); margin-bottom: 6px; text-decoration: none; }
.ev-titleblock .org-link:hover { color: var(--org-accent-text); }
.ev-titleblock .org-link .dot { width: 18px; height: 18px; border-radius: 6px; display: inline-block; flex-shrink: 0; }
.ev-titleblock h1 { font-size: clamp(1.5rem, 3vw, 2.1rem); font-weight: 800; letter-spacing: -.02em; margin: 0 0 10px; color: var(--ehub-ink); }
.ev-badges { display: flex; flex-wrap: wrap; gap: 7px; }
.ev-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; justify-content: flex-end; padding-bottom: 0; }
.ev-desc { color: var(--ehub-muted); font-size: .98rem; line-height: 1.6; margin: 18px 0 0; max-width: 820px; }
.ev-metabar { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 10px 24px; margin-top: 18px; }
.ev-metabar .m { display: flex; align-items: center; gap: 8px; color: var(--ehub-ink); font-size: .9rem; font-weight: 600; min-width: 0; }
.ev-metabar .m svg { color: var(--org-accent-text); width: 16px; }
.ev-metabar .m .lbl { color: var(--ehub-muted); font-weight: 500; white-space: nowrap; }
.ev-metabar .m svg { flex-shrink: 0; }
.ev-metabar .m-link { text-decoration: none; }
.ev-metabar .m-link:hover { color: var(--org-accent-text); }
.badge-pill.closed { background: color-mix(in srgb, #868e96 16%, transparent); color: var(--ehub-muted); }

/* ── Info tab: content + sticky join card ── */
.ev-info-grid { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 22px; align-items: start; }
.ev-info-grid .ev-join { order: 2; position: sticky; top: 84px; }
.ev-info-main { min-width: 0; }
.ev-join { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-top: 4px solid var(--org-accent, var(--ehub-primary)); border-radius: 14px; padding: 18px; box-shadow: 0 10px 30px rgba(0,0,0,.08); }
.ev-join__price { display: flex; flex-direction: column; margin-bottom: 12px; }
.ev-join__price .k { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--ehub-muted); }
.ev-join__price .v { font-size: 1.7rem; font-weight: 800; color: var(--ehub-ink); letter-spacing: -.02em; }
.ev-join__price.free .v { color: var(--ehub-success-text); }
.ev-join__slots { margin-bottom: 14px; }
.ev-join__slots-row { display: flex; justify-content: space-between; font-size: .8rem; color: var(--ehub-muted); margin-bottom: 6px; }
.ev-join__slots-row strong { color: var(--org-accent-text); }
.ev-join__bar { height: 7px; border-radius: 4px; background: var(--ehub-line); overflow: hidden; }
.ev-join__bar span { display: block; height: 100%; background: var(--org-accent, var(--ehub-primary)); }
.ev-join__facts { list-style: none; padding: 0; margin: 0 0 16px; display: flex; flex-direction: column; gap: 11px; }
.ev-join__facts li { display: flex; gap: 11px; font-size: .86rem; color: var(--ehub-ink); font-weight: 600; }
.ev-join__facts li svg { color: var(--org-accent-text); width: 16px; margin-top: 3px; flex-shrink: 0; }
.ev-join__facts .k { display: block; font-size: .75rem; font-weight: 600; color: var(--ehub-muted); text-transform: uppercase; letter-spacing: .04em; }
.ev-join__facts a { color: inherit; }
.ev-join__urgent { display: inline-block; margin-left: 6px; font-style: normal; font-size: .72rem; font-weight: 700; color: var(--ehub-warn-text); background: color-mix(in srgb, #f0b400 18%, transparent); padding: 1px 8px; border-radius: 50rem; }
.ev-join__cta { padding: 11px; font-weight: 700; font-size: .95rem; }
.ev-join__note { font-size: .78rem; color: var(--ehub-muted); margin: 0; }
.ev-join__state { display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; font-size: .9rem; padding: 11px; border-radius: 10px; }
.ev-join__state.ok { background: color-mix(in srgb, #1f8a5b 14%, transparent); color: var(--ehub-success-text); }
.ev-join__state.closed { background: color-mix(in srgb, #868e96 14%, transparent); color: var(--ehub-muted); }
.ev-join__cancel { display: block; margin: 4px auto 0; padding: 10px 12px; --bs-btn-color: var(--ehub-muted); --bs-btn-hover-color: var(--ehub-danger-text); color: var(--ehub-muted); font-size: .8rem; text-decoration: underline; }
.ev-join__cancel:hover { color: var(--ehub-danger-text); }
.ev-streams { display: flex; flex-wrap: wrap; gap: 10px; }
.ev-stream { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 10px; border: 1px solid var(--ehub-line); background: var(--ehub-card); color: var(--ehub-ink); font-size: .85rem; font-weight: 600; text-decoration: none; }
.ev-stream.twitch svg { color: #9146ff; }
.ev-stream.youtube svg { color: #ff0000; }
.ev-rules { white-space: pre-wrap; font-size: .92rem; line-height: 1.65; color: var(--ehub-ink); }
@media (max-width: 900px) {
  .ev-info-grid { grid-template-columns: minmax(0, 1fr); }
  .ev-info-grid .ev-join { order: 0; position: static; }
}

/* ── badge-pill ── */
.badge-pill { font-size: .74rem; font-weight: 700; padding: 4px 11px; border-radius: 50rem; letter-spacing: .02em; display: inline-flex; align-items: center; gap: 5px; }
.badge-pill.cat { background: var(--ehub-field-bg); color: var(--ehub-muted); border: 1px solid var(--ehub-line); }
.badge-pill.sub { background: color-mix(in srgb, var(--org-accent, var(--ehub-primary)) 14%, transparent); color: var(--org-accent-text); }
.badge-pill.active { background: color-mix(in srgb, #1f8a5b 16%, transparent); color: var(--ehub-success-text); }
.badge-pill.finished { background: var(--ehub-field-bg); color: var(--ehub-muted); border: 1px solid var(--ehub-line); }
.badge-pill.free { background: color-mix(in srgb, var(--org-accent, var(--ehub-primary)), #000 22%); color: #fff; }
.badge-pill.paid { background: #187a4f; color: #fff; }
html[data-bs-theme="dark"] .badge-pill.active { color: #51cf66; }

/* ── Tabs ── */
.ehub-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--ehub-line); margin-top: 32px; overflow-x: auto; scrollbar-width: none; }
.ehub-tabs::-webkit-scrollbar { display: none; }
.tab-btn { border: 0; background: transparent; color: var(--ehub-muted); font-size: .95rem; font-weight: 600; padding: 12px 18px; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; white-space: nowrap; display: inline-flex; align-items: center; gap: 8px; transition: color .15s, border-color .15s; }
.tab-btn:hover { color: var(--ehub-ink); }
.tab-btn.active { color: var(--org-accent-text); border-bottom-color: var(--org-accent, var(--ehub-primary)); }
.tab-badge { font-size: .72rem; font-weight: 700; background: var(--ehub-field-bg); color: var(--ehub-muted); border-radius: 50rem; padding: 2px 8px; border: 1px solid var(--ehub-line); }
.tab-pane { padding-top: 24px; padding-bottom: 48px; }

/* ── Info ── */
.ev-reg-card { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); padding: 22px 24px; }
.ev-description { color: var(--ehub-ink); line-height: 1.7; font-size: .95rem; }
.ev-description :deep(h2) { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 .4rem; }
.ev-description :deep(h3) { font-size: 1.05rem; font-weight: 600; margin: .8rem 0 .3rem; }
.ev-description :deep(p)  { margin-bottom: .6rem; }
.ev-description :deep(ul), .ev-description :deep(ol) { padding-left: 1.4rem; margin-bottom: .6rem; }

/* ── Stages ── */
.stage-list { display: flex; flex-direction: column; gap: 10px; }
.stage-item { border: 1px solid var(--ehub-line); border-radius: 12px; overflow: hidden; background: var(--ehub-card); }
.stage-head { padding: 15px 18px; display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.stage-head .lhs { display: flex; align-items: center; gap: 14px; min-width: 0; }
.stage-flag { width: 42px; height: 42px; border-radius: 10px; background: var(--ehub-field-bg); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--ehub-muted); flex-shrink: 0; }
.stage-title { font-size: .98rem; font-weight: 700; color: var(--ehub-ink); display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.stage-date { font-size: .8rem; color: var(--ehub-muted); margin-top: 3px; }
.stage-body { border-top: 1px solid var(--ehub-line); }

/* ── Table ── */
.table-wrap { overflow-x: auto; border: none; background: transparent; }
table.ev-table { width: 100%; border-collapse: collapse; font-size: .9rem; }
table.ev-table th { padding: 12px 14px; font-size: .72rem; font-weight: 700; color: var(--ehub-muted); text-transform: uppercase; letter-spacing: .05em; border-bottom: 1px solid var(--ehub-line); }
table.ev-table th.l, table.ev-table td.l { text-align: left; }
table.ev-table td { padding: 12px 14px; color: var(--ehub-ink); border-bottom: 1px solid var(--ehub-line); text-align: center; vertical-align: middle; }
table.ev-table tbody tr:last-child td { border-bottom: 0; }
.driver-cell .nm { font-weight: 600; }
.driver-cell .sub { font-size: .76rem; color: var(--ehub-muted); }
.qualified-ico { color: var(--org-accent-text); }

/* ── Participants ── */
.reg-head { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
.reg-head .info { color: var(--ehub-muted); font-size: .92rem; }
.reg-head .info b { color: var(--ehub-ink); }
.slots-track { height: 6px; border-radius: 3px; background: var(--ehub-field-bg); width: 200px; overflow: hidden; }
.slots-track > span { display: block; height: 100%; border-radius: 3px; background: var(--org-accent, var(--ehub-primary)); transition: width .3s; }
.part-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 14px; }
.part-card { display: flex; align-items: center; gap: 13px; padding: 14px; background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 12px; }
.part-av { width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; font-size: .85rem; overflow: hidden; }
.part-info { min-width: 0; }
.part-name { font-weight: 600; color: var(--ehub-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.part-team { font-size: .8rem; color: var(--ehub-muted); }
.part-seed { margin-left: auto; font-size: .72rem; font-weight: 700; color: var(--ehub-muted); background: var(--ehub-field-bg); border-radius: 50rem; padding: 3px 9px; border: 1px solid var(--ehub-line); white-space: nowrap; }

/* ── News ── */
.news-item { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); overflow: hidden; transition: border-color .14s; display: block; }
.news-item:hover { border-color: color-mix(in srgb, var(--org-accent, var(--ehub-primary)) 35%, var(--ehub-line)); }
.news-item-head { padding: 14px 18px 0; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.news-item-meta { display: flex; align-items: center; gap: 7px; }
.news-cat { display: inline-flex; align-items: center; gap: 5px; font-size: .72rem; font-weight: 700; padding: 3px 10px; border-radius: 50rem; }
.news-cat.comunicado { background: color-mix(in srgb, var(--org-accent, var(--ehub-primary)) 14%, transparent); color: var(--org-accent-text); }
.news-date { font-size: .75rem; color: var(--ehub-muted); }
.news-item-body { padding: 10px 18px 14px; }
.news-item-title { font-size: .97rem; font-weight: 700; color: var(--ehub-ink); margin-bottom: 5px; line-height: 1.3; }
.news-item-text { font-size: .88rem; color: var(--ehub-muted); line-height: 1.6; }
.news-item-foot { padding: 0 18px 14px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.news-author { display: flex; align-items: center; gap: 7px; font-size: .78rem; color: var(--ehub-muted); }
.news-author-dot { width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: .55rem; font-weight: 800; color: #fff; flex-shrink: 0; }
.news-read-more { font-size: .78rem; font-weight: 600; color: var(--org-accent-text); background: none; border: 0; cursor: pointer; padding: 0; display: inline-flex; align-items: center; gap: 5px; }

/* ── Highlight row ── */
.highlight-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-top: 22px; }
.hl-card { display: flex; align-items: center; gap: 14px; padding: 16px 20px; border-radius: var(--ehub-radius-card); border: 1px solid var(--ehub-line); background: var(--ehub-card); }
.hl-card.leader { background: color-mix(in srgb, var(--ehub-gold, #f59e0b) 9%, var(--ehub-card)); border-color: color-mix(in srgb, var(--ehub-gold, #f59e0b) 35%, var(--ehub-line)); }
.hl-ico { width: 46px; height: 46px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
.hl-card.leader .hl-ico { background: color-mix(in srgb, var(--ehub-gold, #f59e0b) 20%, transparent); color: color-mix(in srgb, var(--ehub-gold, #f59e0b), #000 22%); }
.hl-card.next .hl-ico { background: color-mix(in srgb, var(--org-accent, var(--ehub-primary)) 14%, transparent); color: var(--org-accent-text); }
.hl-card .k { font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; }
.hl-card.leader .k { color: color-mix(in srgb, var(--ehub-gold, #f59e0b), #000 22%); }
.hl-card.next .k { color: var(--org-accent-text); }
.hl-card .v { font-size: 1.05rem; font-weight: 700; color: var(--ehub-ink); line-height: 1.2; margin-top: 2px; }
.hl-card .s { font-size: .82rem; color: var(--ehub-muted); margin-top: 2px; }
html[data-bs-theme="dark"] .hl-card.leader .k { color: var(--ehub-gold, #f59e0b); }
html[data-bs-theme="dark"] .hl-card.leader .hl-ico { color: var(--ehub-gold, #f59e0b); }

/* ── Standings ── */
.standings-wrap { overflow-x: auto; border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); background: var(--ehub-card); }
.pos-badge { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; font-weight: 700; font-size: .85rem; }
.pos-badge.p1 { background: color-mix(in srgb, var(--ehub-gold, #f59e0b) 22%, transparent); color: color-mix(in srgb, var(--ehub-gold, #f59e0b), #000 26%); }
.pos-badge.p2 { background: rgba(150,150,160,.22); color: #8a8f99; }
.pos-badge.p3 { background: rgba(205,127,50,.20); color: #b5703a; }
html[data-bs-theme="dark"] .pos-badge.p1 { color: var(--ehub-gold, #f59e0b); }
.pts-total { font-weight: 800; font-size: 1rem; color: var(--org-accent-text); }
.pts-cell.top { color: var(--ehub-ink); font-weight: 600; }
.pts-cell { color: var(--ehub-muted); }

/* ── Regulation ── */
.reg-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.reg-card { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); padding: 20px 22px; }
.reg-card h3 { font-size: 1rem; font-weight: 700; color: var(--org-accent-text); margin: 0 0 8px; display: flex; align-items: center; gap: 8px; }
.reg-card p { color: var(--ehub-ink); font-size: .92rem; line-height: 1.6; margin: 0; }

/* ── Empty state ── */
.ev-empty { text-align: center; padding: 54px 20px; color: var(--ehub-muted); border: 1px dashed var(--ehub-line); border-radius: var(--ehub-radius-card); }
.ev-empty svg { font-size: 2rem; opacity: .4; display: block; margin: 0 auto; }

/* ── Modals ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; z-index: 1050; padding: 1rem; }
.modal-card { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 14px; width: 100%; max-width: 420px; overflow: hidden; }
.modal-card__header { display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 1.4rem; border-bottom: 1px solid var(--ehub-line); font-size: 1rem; font-weight: 600; color: var(--ehub-ink); }
.modal-card__body { padding: 1.2rem 1.4rem; }
.modal-card__footer { display: flex; justify-content: flex-end; gap: .5rem; padding: .9rem 1.4rem; border-top: 1px solid var(--ehub-line); }
.ev-sec-title { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--ehub-muted); margin: 0 0 8px; }
.ev-extra-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
.ev-extra { display: flex; gap: 10px; align-items: flex-start; background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: 12px; padding: 12px 14px; min-width: 0; }
.ev-extra__ico { color: var(--org-accent-text); margin-top: 3px; width: 16px; flex-shrink: 0; }
.ev-extra__txt { min-width: 0; }
.ev-extra__lbl { font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--ehub-muted); }
.ev-extra__val { font-size: .86rem; font-weight: 500; color: var(--ehub-ink); overflow-wrap: anywhere; white-space: pre-line; }
a.ev-extra__val { color: var(--org-accent-text); }
.stage-info { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.stage-info__chip { display: inline-flex; align-items: center; gap: 5px; font-size: .74rem; color: var(--ehub-ink); background: var(--ehub-field-bg); border: 1px solid var(--ehub-line); border-radius: 50rem; padding: 2px 10px; }
.stage-info__chip svg { color: var(--org-accent-text); font-size: .7rem; }
.stage-info__chip .lbl { color: var(--ehub-muted); }
.reg-field__label { display: block; font-size: .8rem; font-weight: 600; color: var(--ehub-ink); margin-bottom: .3rem; }
.reg-input { background: var(--ehub-field-bg); border-color: var(--ehub-line); color: var(--ehub-ink); border-radius: 7px; }
.reg-input:focus { background: var(--ehub-field-bg); border-color: var(--org-accent, var(--ehub-primary)); box-shadow: none; color: var(--ehub-ink); }
.gateway-list { display: flex; flex-direction: column; gap: .75rem; }
.gateway-btn { display: flex; align-items: center; width: 100%; padding: .9rem 1.2rem; background: var(--ehub-field-bg); border: 1px solid var(--ehub-line); border-radius: 10px; color: var(--ehub-ink); font-size: .95rem; font-weight: 500; cursor: pointer; transition: background .15s, border-color .15s; text-align: left; }
.gateway-btn:hover:not(:disabled) { border-color: var(--org-accent, var(--ehub-primary)); }
.gateway-btn:disabled { opacity: .6; cursor: not-allowed; }
.my-match { display: flex; align-items: center; gap: 12px; padding: 12px 16px; margin-bottom: 14px; border-radius: 12px; border: 1px solid color-mix(in srgb, var(--org-accent, var(--ehub-primary)) 40%, transparent); background: color-mix(in srgb, var(--org-accent, var(--ehub-primary)) 10%, var(--ehub-card)); }
.my-match__ico { font-size: 1.2rem; color: var(--org-accent, var(--ehub-primary)); }
.my-match__lbl { font-size: .74rem; color: var(--ehub-muted); text-transform: uppercase; letter-spacing: .05em; font-weight: 700; }
.reg-done { display: inline-flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 12px; background: color-mix(in srgb, #1f8a5b 14%, var(--ehub-card)); border: 1px solid color-mix(in srgb, #1f8a5b 45%, transparent); color: var(--ehub-ink); }
.reg-done__ico { font-size: 1.5rem; color: var(--ehub-success-text); }
.reg-done span { display: flex; flex-direction: column; line-height: 1.25; }
.reg-done small { color: var(--ehub-muted); font-size: .76rem; }
</style>
