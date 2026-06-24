<script>
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import OrganizationEventRegistration from '@/helpers/communication/OrganizationEventRegistration.js';
import OrganizationEventArticle from '@/helpers/communication/OrganizationEventArticle.js';
import SystemVars from '@/helpers/General/SystemVars';
import { toast } from '@/helpers/toast.js';

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
      formData: {},
      formErrors: {},
      checkingPayment: false,
      retryingPayment: false,
      paymentCheckMessage: null,
      availableGateways: [],
      showGatewayModal: false,
      registerError: null,
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
      const map = {};
      this.finishedStages.forEach((stage, si) => {
        stage.results.forEach(result => {
          const key = result.registration_id;
          if (!map[key]) map[key] = { user: result.user, stageScores: {}, total: 0 };
          const score = result.score ?? 0;
          map[key].stageScores[si] = score;
          map[key].total += score;
        });
      });
      return Object.values(map)
        .sort((a, b) => b.total - a.total)
        .map((e, i) => ({ ...e, position: i + 1 }));
    },
    leaderEntry() { return this.standings[0] || null; },
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
    slotsPct() {
      if (!this.event?.max_registrations) return 0;
      return Math.min(100, Math.round((this.event.registrations_count || 0) / this.event.max_registrations * 100));
    },
  },

  watch: {
    '$route.query.tab'(tab) {
      const valid = ['info', 'stages', 'standings', 'participants', 'regulation', 'news'];
      if (!tab || !valid.includes(tab)) { this.activeTab = 'info'; return; }
      if (tab === 'participants') { this.loadParticipants(); return; }
      if (tab === 'news') { this.loadArticles(); return; }
      this.activeTab = tab;
    },
  },

  async created() {
    const result = await OrganizationEvent.show(this.orgRoute, this.eventRoute);
    this.loading = false;
    if (result.code === 200 && result.data) {
      this.event = result.data;
    }
    this.checkPaymentReturn();
    const tab = this.$route.query.tab;
    if (tab === 'participants') this.loadParticipants();
    else if (tab === 'news') this.loadArticles();
    else if (tab) this.activeTab = tab;
  },

  methods: {
    formatDate(dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
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
      this.$router.replace({ query: { ...this.$route.query, tab: 'participants' } });
      if (this.participantsLoaded) return;
      this.participantsLoading = true;
      const result = await OrganizationEventRegistration.index(this.orgRoute, this.eventRoute);
      this.participantsLoading = false;
      this.participantsLoaded = true;
      if (result.code === 200 && Array.isArray(result.data)) this.participants = result.data;
    },
    handleRegister() {
      if (!this.$store.getters.getToken) {
        this.$router.push({ name: 'user-login', query: { redirect: this.$route.fullPath } });
        return;
      }
      const fd = {};
      this.regTemplate.forEach(f => { fd[f.name] = f.type === 'switch' || f.type === 'checkbox' ? false : ''; });
      this.formData = fd;
      this.formErrors = {};
      this.showRegisterModal = true;
    },
    async confirmRegister() {
      const errors = {};
      this.regTemplate.forEach(f => {
        if (f.required) {
          const val = this.formData[f.name];
          if (val === '' || val === null || val === undefined) errors[f.name] = true;
        }
      });
      this.formErrors = errors;
      if (Object.keys(errors).length) return;
      this.registering = true;
      const result = await OrganizationEventRegistration.store(
        this.orgRoute, this.eventRoute,
        { form_data: this.regTemplate.length ? { ...this.formData } : null }
      );
      this.registering = false;
      this.showRegisterModal = false;
      if (!result.registered && result.message === 'no_compatible_gateway') {
        this.registerError = 'no_compatible_gateway';
        return;
      }
      if (result.registered) {
        this.event.user_registration = result.data;
        this.event.registrations_count = (this.event.registrations_count || 0) + 1;
        this.participantsLoaded = false;
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
      this.$router.replace({ query: { ...this.$route.query, tab: 'news' } });
      if (this.articlesLoaded) return;
      this.articlesLoading = true;
      const result = await OrganizationEventArticle.getAll(this.orgRoute, this.eventRoute);
      this.articlesLoading = false;
      this.articlesLoaded = true;
      if (result.code === 200 && Array.isArray(result.data)) this.articles = result.data;
    },
    checkPaymentReturn() {
      const payment = this.$route.query.payment;
      if (!payment) return;
      if (payment === 'success')                      toast.success(this.$t('events.show.registration.payment_success'));
      else if (payment === 'failure' || payment === 'cancelled') toast.error(this.$t('events.show.registration.payment_failure'));
      else if (payment === 'pending')                 toast.warning(this.$t('events.show.registration.payment_pending'));
      const tab = this.$route.query.tab;
      this.$router.replace({ query: tab ? { tab } : {} });
    },
  },
};
</script>

<template>
  <div :style="orgAccentStyle">

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
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
        <div class="breadcrumb-bar">
          <router-link :to="`/org/${orgRoute}`">
            <font-awesome-icon :icon="['fas', 'building-flag']" />
            {{ event.organization?.name || orgRoute }}
          </router-link>
        </div>
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
                <span v-if="event.runmode" class="badge-pill sub">{{ event.runmode }}</span>
                <span class="badge-pill" :class="event.finished ? 'finished' : 'active'">
                  <font-awesome-icon :icon="['fas', event.finished ? 'flag-checkered' : 'bolt']" />
                  {{ event.finished ? $t('pages.organization.show.events.finished') : (event.initialized ? $t('events.show.in_progress') : $t('pages.organization.show.events.active')) }}
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
                <span v-else class="badge-pill active">
                  <font-awesome-icon :icon="['fas', 'check']" />
                  {{ $t('events.show.registration.confirmed') }}
                </span>
              </template>

              <!-- Can register -->
              <template v-else-if="!event.initialized && !event.finished">
                <button class="btn btn-primary round px-4" :disabled="registering" @click="handleRegister">
                  <span v-if="registering" class="spinner-border spinner-border-sm me-1"></span>
                  <font-awesome-icon v-else :icon="['fas', 'user-plus']" class="me-2" />
                  {{ $t('events.show.registration.register') }}
                </button>
                <p v-if="registerError === 'no_compatible_gateway'" class="text-warning small mb-0 mt-1" style="max-width:240px;text-align:right;font-size:.8rem">
                  <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="me-1" />
                  {{ $t('events.show.registration.no_compatible_gateway') }}
                </p>
              </template>
            </div>
          </div>

          <!-- Description -->
          <p v-if="event.short_description" class="ev-desc">{{ event.short_description }}</p>

          <!-- Metabar -->
          <div class="ev-metabar">
            <span v-if="effectiveStartAt" class="m">
              <font-awesome-icon :icon="['fas', 'calendar-days']" />
              <span class="lbl">{{ $t('events.show.info.details') }}</span>
              {{ formatDate(effectiveStartAt) }}
            </span>
            <span v-if="event.stages?.length" class="m">
              <font-awesome-icon :icon="['fas', 'flag-checkered']" />
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
          <div v-if="leaderEntry || nextStage" class="highlight-row">
            <div v-if="leaderEntry" class="hl-card leader">
              <div class="hl-ico"><font-awesome-icon :icon="['fas', 'trophy']" /></div>
              <div>
                <div class="k">{{ event.finished ? $t('events.show.highlights.champion') : $t('events.show.highlights.leader') }}</div>
                <router-link
                  v-if="leaderEntry.user?.username"
                  :to="`/profile/${leaderEntry.user.username}`"
                  class="v"
                  style="text-decoration:none;color:inherit;"
                >{{ leaderEntry.user?.name || '—' }}</router-link>
                <div v-else class="v">{{ leaderEntry.user?.name || '—' }}</div>
                <div class="s">{{ leaderEntry.total }} {{ $t('events.show.highlights.pts') }}</div>
              </div>
            </div>
            <div v-if="nextStage" class="hl-card next">
              <div class="hl-ico"><font-awesome-icon :icon="['fas', 'flag-checkered']" /></div>
              <div>
                <div class="k">{{ $t('events.show.highlights.next_stage') }}</div>
                <div class="v">{{ nextStage.name }}</div>
                <div v-if="nextStage.start_at" class="s">{{ formatDate(nextStage.start_at) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ TABS ═══ -->
        <div class="ehub-tabs">
          <button class="tab-btn" :class="{ active: activeTab === 'info' }" @click="activeTab = 'info'; $router.replace({ query: { ...$route.query, tab: 'info' } })">
            <font-awesome-icon :icon="['fas', 'circle-info']" />
            {{ $t('events.show.tabs.info') }}
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'stages' }" @click="activeTab = 'stages'; $router.replace({ query: { ...$route.query, tab: 'stages' } })">
            <font-awesome-icon :icon="['fas', 'flag-checkered']" />
            {{ $t('events.show.tabs.stages') }}
            <span v-if="event.stages?.length" class="tab-badge">{{ event.stages.length }}</span>
          </button>
          <button v-if="finishedStages.length" class="tab-btn" :class="{ active: activeTab === 'standings' }" @click="activeTab = 'standings'; $router.replace({ query: { ...$route.query, tab: 'standings' } })">
            <font-awesome-icon :icon="['fas', 'trophy']" />
            {{ $t('events.show.tabs.standings') }}
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'participants' }" @click="loadParticipants">
            <font-awesome-icon :icon="['fas', 'users']" />
            {{ $t('events.show.tabs.participants') }}
            <span v-if="event.registrations_count" class="tab-badge">{{ event.registrations_count }}</span>
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'regulation' }" @click="activeTab = 'regulation'; $router.replace({ query: { ...$route.query, tab: 'regulation' } })">
            <font-awesome-icon :icon="['fas', 'clipboard-list']" />
            {{ $t('events.show.tabs.regulation') }}
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'news' }" @click="loadArticles">
            <font-awesome-icon :icon="['fas', 'newspaper']" />
            {{ $t('events.show.tabs.news') }}
          </button>
        </div>

        <!-- ═══ TAB: INFO ═══ -->
        <section v-if="activeTab === 'info'" class="tab-pane active">
          <div v-if="event.description" class="ev-reg-card mb-4">
            <div class="ev-description" v-html="event.description"></div>
          </div>
          <div class="ev-empty" v-if="!event.description && !effectiveStartAt && !event.max_registrations">
            <font-awesome-icon :icon="['fas', 'circle-info']" />
            <p class="mb-0 mt-2">—</p>
          </div>
        </section>

        <!-- ═══ TAB: STAGES ═══ -->
        <section v-if="activeTab === 'stages'" class="tab-pane active">
          <div v-if="!event.stages?.length" class="ev-empty">
            <font-awesome-icon :icon="['fas', 'flag-checkered']" />
            <p class="mb-0 mt-2">{{ $t('events.show.stages.empty') }}</p>
          </div>
          <div v-else class="stage-list">
            <div v-for="(stage, idx) in event.stages" :key="stage.id" class="stage-item">
              <div class="stage-head" role="button">
                <div class="lhs">
                  <div class="stage-flag">
                    <font-awesome-icon :icon="['fas', 'flag-checkered']" />
                  </div>
                  <div>
                    <div class="stage-title">
                      {{ idx + 1 }}. {{ stage.name }}
                      <span class="badge-pill" :class="stageStatusClass(stage)" style="font-size:.7rem;padding:3px 10px">
                        {{ stageStatusLabel(stage) }}
                      </span>
                    </div>
                    <div v-if="stage.start_at" class="stage-date">
                      <font-awesome-icon :icon="['fas', 'calendar']" class="me-1" />
                      {{ formatDate(stage.start_at) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Stage results -->
              <div v-if="stage.finished && stage.results?.length" class="stage-body">
                <div class="table-wrap">
                  <table class="ev-table">
                    <thead>
                      <tr>
                        <th class="l">{{ $t('events.show.stages.results.participant') }}</th>
                        <th>{{ $t('events.show.stages.results.score') }}</th>
                        <th>{{ $t('events.show.stages.results.qualified') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="result in stage.results" :key="result.position">
                        <td class="l driver-cell">
                          <router-link
                            v-if="result.user?.username"
                            :to="`/profile/${result.user.username}`"
                            style="text-decoration:none;color:inherit;"
                          >
                            <div class="nm">{{ result.user?.name || '—' }}</div>
                            <div v-if="result.position" class="sub">#{{ result.position }}</div>
                          </router-link>
                          <template v-else>
                            <div class="nm">{{ result.user?.name || '—' }}</div>
                            <div v-if="result.position" class="sub">#{{ result.position }}</div>
                          </template>
                        </td>
                        <td class="pts-cell">{{ result.score ?? '—' }}</td>
                        <td>
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
                  <div class="part-name">{{ p.user?.name || '—' }}</div>
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
                  <th v-for="(stage, si) in finishedStages" :key="stage.id">
                    {{ $t('events.show.standings.stage_abbr') }}{{ si + 1 }}
                  </th>
                  <th class="r">{{ $t('events.show.standings.total') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in standings" :key="entry.registration_id">
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
                      <div class="nm">{{ entry.user?.name || '—' }}</div>
                      <div class="sub">@{{ entry.user.username }}</div>
                    </router-link>
                    <div v-else class="nm">{{ entry.user?.name || '—' }}</div>
                  </td>
                  <td v-for="(stage, si) in finishedStages" :key="stage.id" class="pts-cell" :class="entry.stageScores[si] != null ? 'top' : ''">
                    {{ entry.stageScores[si] ?? '—' }}
                  </td>
                  <td class="r pts-total">{{ entry.total }}</td>
                </tr>
              </tbody>
            </table>
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
    <div v-if="showRegisterModal" class="modal-overlay" @click.self="showRegisterModal = false">
      <div class="modal-card">
        <div class="modal-card__header">
          <h5 class="mb-0">{{ $t('events.show.registration.modal.title') }}</h5>
          <button class="btn-close btn-close-white" @click="showRegisterModal = false"></button>
        </div>
        <div class="modal-card__body">
          <p class="text-muted small mb-3">{{ event?.name }}</p>
          <div v-if="event?.fee > 0" class="alert alert-warning small mb-3">
            <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="me-1" />
            {{ $t('events.show.registration.modal.fee_warning', { fee: (event.currency?.toUpperCase() || '') + ' ' + Number(event.fee).toFixed(2) }) }}
          </div>
          <template v-if="regTemplate.length">
            <div v-for="field in regTemplate" :key="field.name" class="reg-field mb-3">
              <label class="reg-field__label">{{ field.label }}<span v-if="field.required" class="text-danger ms-1">*</span></label>
              <input v-if="field.type === 'text' || field.type === 'number'"
                :type="field.type" class="form-control form-control-sm reg-input"
                :class="{ 'is-invalid': formErrors[field.name] }" v-model="formData[field.name]" />
              <select v-else-if="field.type === 'select'"
                class="form-select form-select-sm reg-input"
                :class="{ 'is-invalid': formErrors[field.name] }" v-model="formData[field.name]">
                <option value="">—</option>
                <option v-for="opt in field.values" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <div v-else-if="field.type === 'switch' || field.type === 'checkbox'" class="form-check mt-1">
                <input class="form-check-input" type="checkbox" :id="`reg-${field.name}`" v-model="formData[field.name]" />
                <label class="form-check-label small" :for="`reg-${field.name}`">{{ field.label }}</label>
              </div>
              <div v-if="formErrors[field.name]" class="invalid-feedback d-block" style="font-size:.75rem">
                {{ $t('events.show.registration.modal.field_required') }}
              </div>
            </div>
          </template>
          <p v-else class="mb-0 small">{{ $t('events.show.registration.modal.confirm_text') }}</p>
        </div>
        <div class="modal-card__footer">
          <button class="btn btn-outline-secondary btn-sm" @click="showRegisterModal = false">
            {{ $t('events.show.registration.modal.cancel') }}
          </button>
          <button class="btn btn-primary btn-sm" :disabled="registering" @click="confirmRegister">
            <span v-if="registering" class="spinner-border spinner-border-sm me-1"></span>
            {{ $t('events.show.registration.modal.confirm') }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
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
.ev-titleblock { flex: 1; min-width: 260px; padding-bottom: 4px; }
.ev-titleblock .org-link { display: inline-flex; align-items: center; gap: 7px; font-size: .85rem; font-weight: 600; color: var(--ehub-muted); margin-bottom: 6px; text-decoration: none; }
.ev-titleblock .org-link:hover { color: var(--org-accent, var(--ehub-primary)); }
.ev-titleblock .org-link .dot { width: 18px; height: 18px; border-radius: 6px; display: inline-block; flex-shrink: 0; }
.ev-titleblock h1 { font-size: clamp(1.5rem, 3vw, 2.1rem); font-weight: 800; letter-spacing: -.02em; margin: 0 0 10px; color: var(--ehub-ink); }
.ev-badges { display: flex; flex-wrap: wrap; gap: 7px; }
.ev-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; padding-bottom: 6px; }
.ev-desc { color: var(--ehub-muted); font-size: .98rem; line-height: 1.6; margin: 18px 0 0; max-width: 820px; }
.ev-metabar { display: flex; flex-wrap: wrap; gap: 8px 26px; margin-top: 18px; }
.ev-metabar .m { display: inline-flex; align-items: center; gap: 8px; color: var(--ehub-ink); font-size: .9rem; font-weight: 600; }
.ev-metabar .m svg { color: var(--org-accent, var(--ehub-primary)); width: 16px; }
.ev-metabar .m .lbl { color: var(--ehub-muted); font-weight: 500; }

/* ── badge-pill ── */
.badge-pill { font-size: .74rem; font-weight: 700; padding: 4px 11px; border-radius: 50rem; letter-spacing: .02em; display: inline-flex; align-items: center; gap: 5px; }
.badge-pill.cat { background: var(--ehub-field-bg); color: var(--ehub-muted); border: 1px solid var(--ehub-line); }
.badge-pill.sub { background: color-mix(in srgb, var(--org-accent, var(--ehub-primary)) 14%, transparent); color: var(--org-accent, var(--ehub-primary)); }
.badge-pill.active { background: color-mix(in srgb, #1f8a5b 16%, transparent); color: #1f8a5b; }
.badge-pill.finished { background: var(--ehub-field-bg); color: var(--ehub-muted); border: 1px solid var(--ehub-line); }
.badge-pill.free { background: var(--org-accent, var(--ehub-primary)); color: #fff; }
.badge-pill.paid { background: #1f8a5b; color: #fff; }
html[data-bs-theme="dark"] .badge-pill.active { color: #51cf66; }

/* ── Tabs ── */
.ehub-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--ehub-line); margin-top: 32px; overflow-x: auto; scrollbar-width: none; }
.ehub-tabs::-webkit-scrollbar { display: none; }
.tab-btn { border: 0; background: transparent; color: var(--ehub-muted); font-size: .95rem; font-weight: 600; padding: 12px 18px; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; white-space: nowrap; display: inline-flex; align-items: center; gap: 8px; transition: color .15s, border-color .15s; }
.tab-btn:hover { color: var(--ehub-ink); }
.tab-btn.active { color: var(--org-accent, var(--ehub-primary)); border-bottom-color: var(--org-accent, var(--ehub-primary)); }
.tab-badge { font-size: .68rem; font-weight: 700; background: var(--ehub-field-bg); color: var(--ehub-muted); border-radius: 50rem; padding: 2px 8px; border: 1px solid var(--ehub-line); }
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
table.ev-table th { padding: 12px 14px; font-size: .7rem; font-weight: 700; color: var(--ehub-muted); text-transform: uppercase; letter-spacing: .05em; border-bottom: 1px solid var(--ehub-line); }
table.ev-table th.l, table.ev-table td.l { text-align: left; }
table.ev-table td { padding: 12px 14px; color: var(--ehub-ink); border-bottom: 1px solid var(--ehub-line); text-align: center; vertical-align: middle; }
table.ev-table tbody tr:last-child td { border-bottom: 0; }
.driver-cell .nm { font-weight: 600; }
.driver-cell .sub { font-size: .76rem; color: var(--ehub-muted); }
.qualified-ico { color: var(--org-accent, var(--ehub-primary)); }

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
.news-cat { display: inline-flex; align-items: center; gap: 5px; font-size: .7rem; font-weight: 700; padding: 3px 10px; border-radius: 50rem; }
.news-cat.comunicado { background: color-mix(in srgb, var(--org-accent, var(--ehub-primary)) 14%, transparent); color: var(--org-accent, var(--ehub-primary)); }
.news-date { font-size: .75rem; color: var(--ehub-muted); }
.news-item-body { padding: 10px 18px 14px; }
.news-item-title { font-size: .97rem; font-weight: 700; color: var(--ehub-ink); margin-bottom: 5px; line-height: 1.3; }
.news-item-text { font-size: .88rem; color: var(--ehub-muted); line-height: 1.6; }
.news-item-foot { padding: 0 18px 14px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.news-author { display: flex; align-items: center; gap: 7px; font-size: .78rem; color: var(--ehub-muted); }
.news-author-dot { width: 22px; height: 22px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: .55rem; font-weight: 800; color: #fff; flex-shrink: 0; }
.news-read-more { font-size: .78rem; font-weight: 600; color: var(--org-accent, var(--ehub-primary)); background: none; border: 0; cursor: pointer; padding: 0; display: inline-flex; align-items: center; gap: 5px; }

/* ── Highlight row ── */
.highlight-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 22px; }
@media (max-width: 720px) { .highlight-row { grid-template-columns: 1fr; } }
.hl-card { display: flex; align-items: center; gap: 14px; padding: 16px 20px; border-radius: var(--ehub-radius-card); border: 1px solid var(--ehub-line); background: var(--ehub-card); }
.hl-card.leader { background: color-mix(in srgb, var(--ehub-gold, #f59e0b) 9%, var(--ehub-card)); border-color: color-mix(in srgb, var(--ehub-gold, #f59e0b) 35%, var(--ehub-line)); }
.hl-ico { width: 46px; height: 46px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
.hl-card.leader .hl-ico { background: color-mix(in srgb, var(--ehub-gold, #f59e0b) 20%, transparent); color: color-mix(in srgb, var(--ehub-gold, #f59e0b), #000 22%); }
.hl-card.next .hl-ico { background: color-mix(in srgb, var(--org-accent, var(--ehub-primary)) 14%, transparent); color: var(--org-accent, var(--ehub-primary)); }
.hl-card .k { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; }
.hl-card.leader .k { color: color-mix(in srgb, var(--ehub-gold, #f59e0b), #000 22%); }
.hl-card.next .k { color: var(--org-accent, var(--ehub-primary)); }
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
.pts-total { font-weight: 800; font-size: 1rem; color: var(--org-accent, var(--ehub-primary)); }
.pts-cell.top { color: var(--ehub-ink); font-weight: 600; }
.pts-cell { color: var(--ehub-muted); }

/* ── Regulation ── */
.reg-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
.reg-card { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); padding: 20px 22px; }
.reg-card h3 { font-size: 1rem; font-weight: 700; color: var(--org-accent, var(--ehub-primary)); margin: 0 0 8px; display: flex; align-items: center; gap: 8px; }
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
.reg-field__label { display: block; font-size: .8rem; font-weight: 600; color: var(--ehub-ink); margin-bottom: .3rem; }
.reg-input { background: var(--ehub-field-bg); border-color: var(--ehub-line); color: var(--ehub-ink); border-radius: 7px; }
.reg-input:focus { background: var(--ehub-field-bg); border-color: var(--org-accent, var(--ehub-primary)); box-shadow: none; color: var(--ehub-ink); }
.gateway-list { display: flex; flex-direction: column; gap: .75rem; }
.gateway-btn { display: flex; align-items: center; width: 100%; padding: .9rem 1.2rem; background: var(--ehub-field-bg); border: 1px solid var(--ehub-line); border-radius: 10px; color: var(--ehub-ink); font-size: .95rem; font-weight: 500; cursor: pointer; transition: background .15s, border-color .15s; text-align: left; }
.gateway-btn:hover:not(:disabled) { border-color: var(--org-accent, var(--ehub-primary)); }
.gateway-btn:disabled { opacity: .6; cursor: not-allowed; }
</style>
