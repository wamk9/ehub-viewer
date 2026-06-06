<script setup>
import InitialsAvatar from '@/components/general/InitialsAvatar.vue';
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import SystemVars from '@/helpers/General/SystemVars';
</script>

<template>
    <main class="container">

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

        <!-- Event detail -->
        <template v-else>

            <!-- Header -->
            <div class="row justify-content-center mb-4">
                <div class="col-12">
                    <div class="event-cover ratio ratio-21x9" v-if="event.image">
                        <img :src="SystemVars.baseUrl + 'storage/' + event.image" :alt="event.name" />
                    </div>
                    <div class="event-cover event-cover--placeholder ratio ratio-21x9" v-else>
                        <div class="d-flex align-items-center justify-content-center">
                            <font-awesome-icon :icon="['fas', 'calendar-days']" style="font-size:3rem;opacity:.2" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="row justify-content-center mb-5">
                <div class="col-12 col-lg-8">
                    <div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
                        <span class="badge" :class="event.finished ? 'bg-secondary' : 'bg-success'">
                            {{ event.finished ? $t('pages.organization.show.events.finished') : $t('pages.organization.show.events.active') }}
                        </span>
                        <span class="badge" :class="event.fee == 0 ? 'bg-info text-dark' : 'bg-primary'">
                            {{ event.fee == 0 ? $t('pages.organization.show.events.free') : (event.currency?.toUpperCase() + ' ' + event.fee) }}
                        </span>
                        <span v-if="event.category" class="event-meta">
                            {{ event.category }}<template v-if="event.runmode"> · {{ event.runmode }}</template>
                        </span>
                    </div>

                    <h1 class="mb-2">{{ event.name }}</h1>
                    <p v-if="event.short_description" class="lead text-muted mb-4">{{ event.short_description }}</p>

                    <div v-if="event.description" class="event-description mb-4">
                        {{ event.description }}
                    </div>

                    <div class="event-info-grid mb-4">
                        <div v-if="event.max_registrations" class="event-info-item">
                            <font-awesome-icon :icon="['fas', 'users']" class="me-2 text-muted" />
                            <span class="text-muted small">Max {{ event.max_registrations }} participants</span>
                        </div>
                        <div v-if="event.start_at" class="event-info-item">
                            <font-awesome-icon :icon="['fas', 'calendar']" class="me-2 text-muted" />
                            <span class="text-muted small">{{ formatDate(event.start_at) }}</span>
                        </div>
                    </div>

                    <div class="d-flex gap-2 flex-wrap">
                        <button class="btn btn-primary">
                            <font-awesome-icon :icon="['fas', 'user-plus']" class="me-2" />
                            Register
                        </button>
                        <router-link :to="`/org/${$route.params.orgRoute}`" class="btn btn-outline-secondary">
                            <font-awesome-icon :icon="['fas', 'arrow-left']" class="me-1" />
                            {{ $t('pages.organization.general.back') }}
                        </router-link>
                    </div>
                </div>
            </div>

        </template>
    </main>
</template>

<script>
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import SystemVars from '@/helpers/General/SystemVars';

export default {
    data() {
        return {
            event: null,
            loading: true,
        };
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
    },
    methods: {
        formatDate(dateStr) {
            if (!dateStr) return '';
            return new Date(dateStr).toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        },
    },
}
</script>

<style scoped>
.event-cover {
    border-radius: 12px;
    overflow: hidden;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
}
.event-cover img { width: 100%; height: 100%; object-fit: cover; }
.event-cover--placeholder { border: 1px dashed rgba(255,255,255,0.12); }

.event-description {
    color: rgba(255,255,255,0.75);
    line-height: 1.7;
    font-size: 0.95rem;
    white-space: pre-wrap;
}

.event-info-grid { display: flex; flex-direction: column; gap: 0.5rem; }
.event-info-item { display: flex; align-items: center; }

.event-meta {
    font-size: 0.72rem;
    color: rgba(255,255,255,0.35);
    text-transform: uppercase;
    letter-spacing: 0.06em;
}
</style>
