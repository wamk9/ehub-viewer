<script setup>
</script>

<template>
    <main class="container py-4">

        <!-- Loading -->
        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
        </div>

        <!-- Error / not found -->
        <div v-else-if="!event" class="text-center py-5 text-muted">
            <font-awesome-icon :icon="['fas', 'circle-exclamation']" size="3x" class="mb-3 opacity-50" />
            <p>{{ $t('pages.organization.show.events.empty') }}</p>
            <router-link :to="`/org/${$route.params.orgRoute}`" class="btn btn-outline-secondary btn-sm">
                <font-awesome-icon :icon="['fas', 'arrow-left']" class="me-1" />
                {{ $t('pages.organization.general.back') }}
            </router-link>
        </div>

        <!-- Payment return banner -->
        <div v-if="paymentReturnStatus === 'success'" class="alert alert-success d-flex gap-2 align-items-center mb-3 small">
            <font-awesome-icon :icon="['fas', 'circle-check']" />
            {{ $t('events.show.registration.payment_success') }}
        </div>
        <div v-else-if="paymentReturnStatus === 'pending'" class="alert alert-warning d-flex gap-2 align-items-center mb-3 small">
            <font-awesome-icon :icon="['fas', 'clock']" />
            {{ $t('events.show.registration.payment_pending') }}
        </div>
        <div v-else-if="paymentReturnStatus === 'failure'" class="alert alert-danger d-flex gap-2 align-items-center mb-3 small">
            <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
            {{ $t('events.show.registration.payment_failure') }}
        </div>

        <!-- Event detail -->
        <template v-else>

            <!-- Cover -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="event-cover ratio ratio-21x9" v-if="event.cover_image">
                        <img :src="baseUrl + 'storage/' + event.cover_image" :alt="event.name" />
                    </div>
                    <div class="event-cover event-cover--placeholder ratio ratio-21x9" v-else>
                        <div class="d-flex align-items-center justify-content-center">
                            <font-awesome-icon :icon="['fas', 'calendar-days']" style="font-size:3rem;opacity:.2" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Header row: title + badges + register -->
            <div class="row justify-content-center mb-4">
                <div class="col-12 col-lg-10">
                    <div class="d-flex align-items-start justify-content-between gap-3 flex-wrap">

                        <div class="flex-grow-1">
                            <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
                                <span class="badge" :class="event.finished ? 'bg-secondary' : (event.initialized ? 'bg-warning text-dark' : 'bg-success')">
                                    {{ event.finished ? $t('pages.organization.show.events.finished') : (event.initialized ? $t('events.show.in_progress') : $t('pages.organization.show.events.active')) }}
                                </span>
                                <span class="badge" :class="event.fee == 0 ? 'bg-info text-dark' : 'bg-primary'">
                                    {{ event.fee == 0 ? $t('pages.organization.show.events.free') : (event.currency?.toUpperCase() + ' ' + event.fee) }}
                                </span>
                                <span v-if="event.category" class="event-meta">
                                    {{ event.category }}<template v-if="event.runmode"> · {{ event.runmode }}</template>
                                </span>
                                <span v-if="event.registrations_count > 0" class="event-meta">
                                    <font-awesome-icon :icon="['fas', 'users']" class="me-1" />
                                    {{ event.registrations_count }}
                                </span>
                            </div>
                            <h1 class="event-title mb-1">{{ event.name }}</h1>
                            <p v-if="event.short_description" class="lead text-muted mb-0 small">{{ event.short_description }}</p>
                        </div>

                        <!-- Register button area -->
                        <div class="flex-shrink-0">
                            <!-- Already registered -->
                            <template v-if="event.user_registration">
                                <!-- Pending payment -->
                                <div v-if="event.user_registration.payment_status === 'pending'" class="d-flex flex-column align-items-end gap-2">
                                    <span class="badge bg-warning text-dark p-2">
                                        <font-awesome-icon :icon="['fas', 'clock']" class="me-1" />
                                        {{ $t('events.show.registration.pending') }}
                                    </span>
                                    <div class="d-flex gap-2 flex-wrap justify-content-end">
                                        <button class="btn btn-sm btn-outline-light"
                                            :disabled="checkingPayment || retryingPayment"
                                            @click="doCheckPayment">
                                            <span v-if="checkingPayment" class="spinner-border spinner-border-sm me-1"></span>
                                            <font-awesome-icon v-else :icon="['fas', 'rotate-right']" class="me-1" />
                                            {{ $t('events.show.registration.check_payment') }}
                                        </button>
                                        <button class="btn btn-sm btn-warning text-dark"
                                            :disabled="checkingPayment || retryingPayment"
                                            @click="doRetryPayment">
                                            <span v-if="retryingPayment" class="spinner-border spinner-border-sm me-1"></span>
                                            <font-awesome-icon v-else :icon="['fas', 'credit-card']" class="me-1" />
                                            {{ $t('events.show.registration.retry_payment') }}
                                        </button>
                                    </div>
                                    <span v-if="paymentCheckMessage" class="small" :class="paymentCheckMessage === 'confirmed' ? 'text-success' : 'text-muted'">
                                        {{ paymentCheckMessage === 'confirmed' ? $t('events.show.registration.payment_now_confirmed') : $t('events.show.registration.payment_still_pending') }}
                                    </span>
                                </div>
                                <!-- Confirmed -->
                                <span v-else class="badge bg-success p-2">
                                    <font-awesome-icon :icon="['fas', 'check']" class="me-1" />
                                    {{ $t('events.show.registration.confirmed') }}
                                </span>
                            </template>

                            <!-- Can register -->
                            <div v-else-if="!event.initialized && !event.finished" class="d-flex flex-column align-items-end gap-2">
                                <button
                                    class="btn btn-primary"
                                    :disabled="registering"
                                    @click="handleRegister"
                                >
                                    <span v-if="registering" class="spinner-border spinner-border-sm me-1"></span>
                                    <font-awesome-icon v-else :icon="['fas', 'user-plus']" class="me-2" />
                                    {{ $t('events.show.registration.register') }}
                                </button>
                                <p v-if="registerError === 'no_compatible_gateway'" class="text-warning small mb-0" style="max-width:260px;text-align:right">
                                    <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="me-1" />
                                    {{ $t('events.show.registration.no_compatible_gateway') }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabs -->
            <div class="row justify-content-center mb-4">
                <div class="col-12 col-lg-10">
                    <ul class="nav nav-tabs gen-tabs">
                        <li class="nav-item">
                            <button class="nav-link" :class="{ active: activeTab === 'info' }" @click="activeTab = 'info'">
                                <font-awesome-icon :icon="['fas', 'circle-info']" class="me-1" />
                                {{ $t('events.show.tabs.info') }}
                            </button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" :class="{ active: activeTab === 'stages' }" @click="activeTab = 'stages'">
                                <font-awesome-icon :icon="['fas', 'flag-checkered']" class="me-1" />
                                {{ $t('events.show.tabs.stages') }}
                                <span v-if="event.stages?.length" class="badge bg-secondary ms-1">{{ event.stages.length }}</span>
                            </button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" :class="{ active: activeTab === 'participants' }" @click="loadParticipants">
                                <font-awesome-icon :icon="['fas', 'users']" class="me-1" />
                                {{ $t('events.show.tabs.participants') }}
                                <span v-if="event.registrations_count" class="badge bg-secondary ms-1">{{ event.registrations_count }}</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Tab: Info -->
            <div v-if="activeTab === 'info'" class="row justify-content-center">
                <div class="col-12 col-lg-10">

                    <div v-if="event.description" class="gen-section mb-3">
                        <p class="gen-section__title">{{ $t('events.show.info.description') }}</p>
                        <div class="event-description" v-html="event.description"></div>
                    </div>

                    <div class="gen-section">
                        <p class="gen-section__title">{{ $t('events.show.info.details') }}</p>
                        <div class="event-info-grid">
                            <div v-if="effectiveStartAt" class="event-info-item">
                                <font-awesome-icon :icon="['fas', 'calendar']" class="me-2 text-muted" />
                                <span class="text-muted small">
                                    <span v-if="startAtIsPreview" class="badge bg-secondary me-1 fw-normal" style="font-size:.7em">
                                        {{ $t('events.show.info.start_at_preview') }}
                                    </span>
                                    {{ formatDate(effectiveStartAt) }}
                                </span>
                            </div>
                            <div v-if="event.max_registrations" class="event-info-item">
                                <font-awesome-icon :icon="['fas', 'users']" class="me-2 text-muted" />
                                <span class="text-muted small">
                                    {{ $t('events.show.info.max_registrations', { n: event.max_registrations }) }}
                                </span>
                            </div>
                            <div v-if="event.category" class="event-info-item">
                                <font-awesome-icon :icon="['fas', 'tag']" class="me-2 text-muted" />
                                <span class="text-muted small">{{ event.category }}<template v-if="event.runmode"> · {{ event.runmode }}</template></span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Tab: Stages -->
            <div v-if="activeTab === 'stages'" class="row justify-content-center">
                <div class="col-12 col-lg-10">

                    <div v-if="!event.stages?.length" class="gen-section text-center py-5">
                        <font-awesome-icon :icon="['fas', 'flag-checkered']" class="mb-3 text-muted" style="font-size:2rem;opacity:.4" />
                        <p class="text-muted mb-0">{{ $t('events.show.stages.empty') }}</p>
                    </div>

                    <div v-else class="stages-list">
                        <div v-for="(stage, idx) in event.stages" :key="stage.id" class="gen-section mb-3">

                            <!-- Stage header -->
                            <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                                <div class="d-flex align-items-center gap-2">
                                    <span class="stage-order">{{ idx + 1 }}</span>
                                    <h5 class="mb-0">{{ stage.name }}</h5>
                                </div>
                                <div class="d-flex gap-2 flex-wrap">
                                    <span class="badge stage-type-badge">{{ stage.stage_type }}</span>
                                    <span class="badge" :class="stageStatusClass(stage)">{{ stageStatusLabel(stage) }}</span>
                                </div>
                            </div>

                            <p v-if="stage.description" class="text-muted small mb-3">{{ stage.description }}</p>

                            <!-- Sub-rounds (if any) -->
                            <div v-if="stage.rounds?.length" class="rounds-list mb-3">
                                <p class="gen-section__title">{{ $t('events.show.stages.rounds') }}</p>
                                <div class="row g-2">
                                    <div v-for="(round, ri) in stage.rounds" :key="round.id" class="col-12 col-md-6 col-lg-4">
                                        <div class="round-card">
                                            <span class="round-name">{{ round.name }}</span>
                                            <span class="badge ms-auto" :class="stageStatusClass(round)">{{ stageStatusLabel(round) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Results (if stage finished) -->
                            <div v-if="stage.finished && stage.results?.length">
                                <p class="gen-section__title">{{ $t('events.show.stages.qualification') }}</p>
                                <div class="results-table">
                                    <div class="results-table__header">
                                        <span>#</span>
                                        <span>{{ $t('events.show.stages.results.participant') }}</span>
                                        <span>{{ $t('events.show.stages.results.score') }}</span>
                                        <span>{{ $t('events.show.stages.results.qualified') }}</span>
                                    </div>
                                    <div
                                        v-for="result in stage.results"
                                        :key="result.position"
                                        class="results-table__row"
                                        :class="{ 'results-table__row--qualified': result.qualified }"
                                    >
                                        <span class="result-position">{{ result.position ?? '-' }}</span>
                                        <span class="result-user">
                                            <span v-if="result.user">{{ result.user.name }}</span>
                                            <span v-else class="text-muted">—</span>
                                        </span>
                                        <span class="result-score text-muted small">{{ result.score ?? '—' }}</span>
                                        <span>
                                            <font-awesome-icon
                                                v-if="result.qualified"
                                                :icon="['fas', 'circle-check']"
                                                class="text-success"
                                            />
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div v-else-if="stage.finished && !stage.results?.length" class="text-muted small">
                                {{ $t('events.show.stages.no_results') }}
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            <!-- Tab: Participants -->
            <div v-if="activeTab === 'participants'" class="row justify-content-center">
                <div class="col-12 col-lg-10">

                    <div v-if="participantsLoading" class="text-center py-4">
                        <div class="spinner-border spinner-border-sm text-primary"></div>
                    </div>

                    <div v-else-if="!participants.length" class="gen-section text-center py-5">
                        <font-awesome-icon :icon="['fas', 'users']" class="mb-3 text-muted" style="font-size:2rem;opacity:.4" />
                        <p class="text-muted mb-0">{{ $t('events.show.participants.empty') }}</p>
                    </div>

                    <div v-else class="gen-section">
                        <p class="gen-section__title">{{ $t('events.show.participants.title', { n: participants.length }) }}</p>
                        <div class="participants-list">
                            <div v-for="(p, i) in participants" :key="p.id" class="participant-row">
                                <span class="participant-index">{{ i + 1 }}</span>
                                <div class="participant-avatar">
                                    <img v-if="p.user?.username"
                                        :src="baseUrl + 'storage/' + p.user.username + '/profile.webp'"
                                        :alt="p.user.name"
                                        @error="$event.target.style.display='none'; $event.target.nextSibling.style.display='flex'" />
                                    <span class="participant-avatar__initials" :style="p.user?.username ? 'display:none' : ''">{{ initials(p.user?.name) }}</span>
                                </div>
                                <span class="participant-name">{{ p.user?.name || '—' }}</span>
                                <span v-if="p.user?.username" class="participant-username">@{{ p.user.username }}</span>
                                <span class="ms-auto">
                                    <span class="badge" :class="p.payment_status === 'confirmed' ? 'bg-success' : 'bg-info text-dark'">
                                        {{ p.payment_status === 'free' ? $t('pages.organization.show.events.free') : p.payment_status }}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Back link -->
            <div class="row justify-content-center mt-4">
                <div class="col-12 col-lg-10">
                    <router-link :to="`/org/${$route.params.orgRoute}`" class="btn btn-outline-secondary btn-sm">
                        <font-awesome-icon :icon="['fas', 'arrow-left']" class="me-1" />
                        {{ $t('pages.organization.general.back') }}
                    </router-link>
                </div>
            </div>

        </template>

        <!-- Gateway picker modal -->
        <div v-if="showGatewayModal" class="modal-overlay" @click.self="showGatewayModal = false">
            <div class="modal-card">
                <div class="modal-card__header">
                    <h5 class="mb-0">{{ $t('events.show.registration.choose_gateway.title') }}</h5>
                    <button class="btn-close btn-close-white" @click="showGatewayModal = false"></button>
                </div>
                <div class="modal-card__body">
                    <div class="gateway-list">
                        <button
                            v-for="gw in availableGateways"
                            :key="gw"
                            class="gateway-btn"
                            :disabled="retryingPayment"
                            @click="selectGateway(gw)"
                        >
                            <span v-if="retryingPayment" class="spinner-border spinner-border-sm me-2"></span>
                            <font-awesome-icon v-else-if="gw === 'mercadopago'" :icon="['fas', 'credit-card']" class="me-2" />
                            <font-awesome-icon v-else :icon="['fas', 'credit-card']" class="me-2" />
                            {{ $t(`events.show.registration.choose_gateway.${gw}`) }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Register modal -->
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
                        {{ $t('events.show.registration.modal.fee_warning', { fee: event.currency?.toUpperCase() + ' ' + event.fee }) }}
                    </div>

                    <!-- Dynamic registration form fields -->
                    <template v-if="regTemplate.length">
                        <div v-for="field in regTemplate" :key="field.name" class="reg-field mb-3">
                            <label class="reg-field__label">
                                {{ field.label }}
                                <span v-if="field.required" class="text-danger ms-1">*</span>
                            </label>

                            <!-- text / number -->
                            <input v-if="field.type === 'text' || field.type === 'number'"
                                :type="field.type"
                                class="form-control form-control-sm reg-input"
                                :class="{ 'is-invalid': formErrors[field.name] }"
                                v-model="formData[field.name]" />

                            <!-- select -->
                            <select v-else-if="field.type === 'select'"
                                class="form-select form-select-sm reg-input"
                                :class="{ 'is-invalid': formErrors[field.name] }"
                                v-model="formData[field.name]">
                                <option value="">—</option>
                                <option v-for="opt in field.values" :key="opt" :value="opt">{{ opt }}</option>
                            </select>

                            <!-- switch -->
                            <div v-else-if="field.type === 'switch'" class="form-check form-switch mt-1">
                                <input class="form-check-input" type="checkbox"
                                    :id="`reg-${field.name}`" v-model="formData[field.name]" />
                                <label class="form-check-label small" :for="`reg-${field.name}`">{{ field.label }}</label>
                            </div>

                            <!-- checkbox -->
                            <div v-else-if="field.type === 'checkbox'" class="form-check mt-1">
                                <input class="form-check-input" type="checkbox"
                                    :id="`reg-${field.name}`" v-model="formData[field.name]" />
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

    </main>
</template>

<script>
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import OrganizationEventRegistration from '@/helpers/communication/OrganizationEventRegistration.js';
import SystemVars from '@/helpers/General/SystemVars';

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
            paymentReturnStatus: null,
            checkingPayment: false,
            retryingPayment: false,
            paymentCheckMessage: null,
            availableGateways: [],
            showGatewayModal: false,
            registerError: null,
            baseUrl: SystemVars.baseUrl,
        };
    },

    computed: {
        effectiveStartAt() {
            const stageStart = this.event?.stages?.find(s => s.start_at)?.start_at;
            return stageStart || this.event?.start_at || null;
        },
        startAtIsPreview() {
            return !this.event?.stages?.find(s => s.start_at);
        },
        regTemplate() {
            return Array.isArray(this.event?.registration_form_template)
                ? this.event.registration_form_template
                : [];
        },
    },

    async created() {
        const result = await OrganizationEvent.show(
            this.$route.params.orgRoute,
            this.$route.params.eventRoute
        );
        this.loading = false;
        if (result.code === 200 && result.data) {
            this.event = result.data;
        }
        this.checkPaymentReturn();
    },

    methods: {
        formatDate(dateStr) {
            if (!dateStr) return '';
            return new Date(dateStr).toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric',
            });
        },

        initials(name) {
            if (!name) return '?';
            return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
        },

        stageStatusClass(stage) {
            if (stage.finished)    return 'bg-secondary';
            if (stage.in_progress) return 'bg-warning text-dark';
            if (stage.initialized) return 'bg-primary';
            return 'bg-outline';
        },

        stageStatusLabel(stage) {
            if (stage.finished)    return this.$t('events.show.stages.status.finished');
            if (stage.in_progress) return this.$t('events.show.stages.status.in_progress');
            if (stage.initialized) return this.$t('events.show.stages.status.initialized');
            return this.$t('events.show.stages.status.pending');
        },

        async loadParticipants() {
            this.activeTab = 'participants';
            if (this.participantsLoaded) return;
            this.participantsLoading = true;
            const result = await OrganizationEventRegistration.index(
                this.$route.params.orgRoute,
                this.$route.params.eventRoute
            );
            this.participantsLoading = false;
            this.participantsLoaded = true;
            if (result.code === 200 && Array.isArray(result.data)) {
                this.participants = result.data;
            }
        },

        handleRegister() {
            if (!this.$store.getters.getToken) {
                this.$router.push({ name: 'user-login', query: { redirect: this.$route.fullPath } });
                return;
            }
            // Init form fields
            const fd = {};
            this.regTemplate.forEach(f => {
                fd[f.name] = f.type === 'switch' || f.type === 'checkbox' ? false : '';
            });
            this.formData   = fd;
            this.formErrors = {};
            this.showRegisterModal = true;
        },

        async confirmRegister() {
            // Validate required fields
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
                this.$route.params.orgRoute,
                this.$route.params.eventRoute,
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
                    this.showGatewayModal  = true;
                }
            }
        },

        async doCheckPayment() {
            this.checkingPayment = true;
            this.paymentCheckMessage = null;
            const result = await OrganizationEventRegistration.checkPayment(
                this.$route.params.orgRoute,
                this.$route.params.eventRoute
            );
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
            const result = await OrganizationEventRegistration.retryPayment(
                this.$route.params.orgRoute,
                this.$route.params.eventRoute,
                gateway
            );
            this.retryingPayment = false;
            if (result.code === 200 && result.data?.available_gateways?.length) {
                this.availableGateways = result.data.available_gateways;
                this.showGatewayModal  = true;
                return;
            }
            this.showGatewayModal = false;
            if (result.code === 200 && result.data?.payment_url) {
                window.location.href = result.data.payment_url;
            }
        },

        async selectGateway(gateway) {
            await this.doRetryPayment(gateway);
        },

        checkPaymentReturn() {
            const payment = this.$route.query.payment;
            if (!payment) return;
            if (payment === 'success') {
                this.paymentReturnStatus = 'success';
            } else if (payment === 'failure' || payment === 'cancelled') {
                this.paymentReturnStatus = 'failure';
            } else if (payment === 'pending') {
                this.paymentReturnStatus = 'pending';
            }
            // Clear query from URL
            this.$router.replace({ query: {} });
        },
    },
};
</script>

<style scoped>
/* ── Cover ── */
.event-cover {
    border-radius: 12px;
    overflow: hidden;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
}
.event-cover img { width: 100%; height: 100%; object-fit: cover; }
.event-cover--placeholder { border: 1px dashed rgba(255,255,255,0.12); }

/* ── Header ── */
.event-title {
    font-size: 1.6rem;
    font-weight: 700;
    color: rgba(255,255,255,0.95);
}
.event-meta {
    font-size: 0.72rem;
    color: rgba(255,255,255,0.35);
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

/* ── Tabs ── */
.gen-tabs {
    border-bottom: 1px solid rgba(255,255,255,0.12);
    gap: 0.25rem;
}
.gen-tabs .nav-link {
    color: rgba(255,255,255,0.45);
    border: none;
    border-bottom: 2px solid transparent;
    padding: 0.55rem 1.1rem;
    font-size: 0.9rem;
    font-weight: 500;
    background: none;
    border-radius: 0;
    transition: color 0.15s, border-color 0.15s;
}
.gen-tabs .nav-link:hover { color: rgba(255,255,255,0.8); border-bottom-color: rgba(255,255,255,0.2); }
.gen-tabs .nav-link.active { color: #fff; border-bottom-color: #4e8bff; background: none; }

/* ── Sections ── */
.gen-section {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 1.4rem 1.6rem;
}
.gen-section__title {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    margin-bottom: 1rem;
}

/* ── Info ── */
.event-description {
    color: rgba(255,255,255,0.75);
    line-height: 1.7;
    font-size: 0.95rem;
}
.event-description:deep(h2) { font-size: 1.35rem; font-weight: 600; margin: 0.9rem 0 0.3rem; }
.event-description:deep(h3) { font-size: 1.1rem;  font-weight: 600; margin: 0.7rem 0 0.25rem; }
.event-description:deep(p)  { margin-bottom: 0.6rem; }
.event-description:deep(ul),
.event-description:deep(ol) { padding-left: 1.4rem; margin-bottom: 0.6rem; }
.event-description:deep(blockquote) {
    border-left: 3px solid rgba(255,255,255,0.2);
    padding-left: 0.9rem;
    color: rgba(255,255,255,0.45);
    margin: 0.6rem 0;
}
.event-description:deep(a)      { color: #7eabff; }
.event-description:deep(strong) { color: rgba(255,255,255,0.95); }
.event-description:deep(em)     { font-style: italic; }
.event-info-grid { display: flex; flex-direction: column; gap: 0.6rem; }
.event-info-item { display: flex; align-items: center; }

/* ── Stages ── */
.stage-order {
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 50%;
    background: rgba(255,255,255,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255,255,255,0.6);
    flex-shrink: 0;
}
.stage-type-badge {
    background: rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.6);
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
.bg-outline {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.5);
}

/* ── Rounds ── */
.round-card {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
}
.round-name { color: rgba(255,255,255,0.7); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ── Results table ── */
.results-table { border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
.results-table__header,
.results-table__row {
    display: grid;
    grid-template-columns: 2.5rem 1fr 6rem 3rem;
    align-items: center;
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;
    font-size: 0.85rem;
}
.results-table__header {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.4);
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}
.results-table__row { border-top: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.75); }
.results-table__row--qualified { background: rgba(40,167,69,0.06); }
.result-position { font-weight: 700; color: rgba(255,255,255,0.9); }

/* ── Participants ── */
.participants-list { display: flex; flex-direction: column; gap: 0.4rem; }
.participant-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    font-size: 0.9rem;
}
.participant-row:last-child { border-bottom: none; }
.participant-index { width: 1.5rem; color: rgba(255,255,255,0.3); font-size: 0.8rem; text-align: right; }
.participant-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    overflow: hidden;
    background: rgba(255,255,255,0.1);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}
.participant-avatar img { width: 100%; height: 100%; object-fit: cover; }
.participant-avatar__initials { font-size: 0.65rem; font-weight: 700; color: rgba(255,255,255,0.6); }
.participant-name { font-weight: 500; color: rgba(255,255,255,0.85); }
.participant-username { font-size: 0.78rem; color: rgba(255,255,255,0.35); }

/* ── Register modal ── */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    padding: 1rem;
}
.modal-card {
    background: #1a1d2e;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 14px;
    width: 100%;
    max-width: 420px;
    overflow: hidden;
}
.modal-card__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.4rem;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    font-size: 1rem;
    font-weight: 600;
}
.modal-card__body { padding: 1.2rem 1.4rem; }
.modal-card__footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 0.9rem 1.4rem;
    border-top: 1px solid rgba(255,255,255,0.08);
}
.reg-field__label {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    color: rgba(255,255,255,0.75);
    margin-bottom: 0.3rem;
}
.reg-input {
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.9);
    border-radius: 7px;
}
.reg-input:focus {
    background: rgba(255,255,255,0.09);
    border-color: rgba(255,255,255,0.3);
    box-shadow: none;
    color: #fff;
}
.reg-input option { background: #1a1a2e; }

/* ── Gateway picker ── */
.gateway-list { display: flex; flex-direction: column; gap: 0.75rem; }
.gateway-btn {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 0.9rem 1.2rem;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    color: rgba(255,255,255,0.85);
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    text-align: left;
}
.gateway-btn:hover:not(:disabled) {
    background: rgba(255,255,255,0.09);
    border-color: rgba(255,255,255,0.25);
}
.gateway-btn:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
