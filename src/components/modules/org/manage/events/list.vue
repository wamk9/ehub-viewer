<script setup>
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import SystemVars from '@/helpers/General/SystemVars';
</script>

<template>
    <div v-if="show" class="events-list">

        <!-- Header -->
        <div class="gen-header mb-4">
            <button class="gen-back" @click="$emit('back')">
                <font-awesome-icon :icon="['fas', 'arrow-left']" />
                {{ $t('pages.organization.general.back') }}
            </button>
            <h2 class="gen-title">{{ $t('events.manage.menu.title') }}</h2>
            <button class="btn btn-primary btn-sm" @click="showCreateEventModule">
                <font-awesome-icon :icon="['fas', 'plus']" class="me-1" />
                {{ $t('events.manage.list.btn_create') }}
            </button>
        </div>

        <!-- Filters -->
        <div class="gen-section mb-4 events-filter-bar">
            <div class="events-filter-bar__search">
                <div class="input-group input-group-sm">
                    <span class="input-group-text" style="background:rgba(255,255,255,0.05);border-color:rgba(255,255,255,0.12);color:rgba(255,255,255,0.4)">
                        <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
                    </span>
                    <input
                        type="text"
                        class="form-control events-filter-bar__input"
                        v-model="searchEventWord"
                        :placeholder="$t('events.manage.list.search_placeholder')"
                    />
                </div>
            </div>
            <div class="events-filter-bar__toggles">
                <input type="checkbox" class="btn-check" id="filter-finished" autocomplete="off"
                    v-model="showFinishedEvents" @change="loadEvents">
                <label class="btn btn-outline-secondary btn-sm" for="filter-finished">
                    {{ $t('events.manage.list.filter_finished') }}
                </label>

                <input type="checkbox" class="btn-check" id="filter-free" autocomplete="off"
                    v-model="showFreeEvents">
                <label class="btn btn-outline-secondary btn-sm" for="filter-free">
                    {{ $t('events.manage.list.filter_free') }}
                </label>

                <input type="checkbox" class="btn-check" id="filter-paid" autocomplete="off"
                    v-model="showPaidEvents">
                <label class="btn btn-outline-secondary btn-sm" for="filter-paid">
                    {{ $t('events.manage.list.filter_paid') }}
                </label>
            </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
        </div>

        <!-- Error -->
        <div v-else-if="loadError" class="text-center py-5">
            <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="mb-3 text-danger" style="font-size:2rem" />
            <p class="text-muted">{{ $t('events.manage.list.error') }}</p>
            <button class="btn btn-outline-secondary btn-sm" @click="loadEvents">
                <font-awesome-icon :icon="['fas', 'rotate']" class="me-1" />
                Retry
            </button>
        </div>

        <!-- Empty (no events at all) -->
        <div v-else-if="events.length === 0" class="text-center py-5">
            <font-awesome-icon :icon="['fas', 'calendar-days']" class="mb-3 text-muted" style="font-size:2.5rem" />
            <p class="text-muted mb-3">{{ $t('events.manage.list.empty') }}</p>
            <button class="btn btn-primary btn-sm" @click="showCreateEventModule">
                {{ $t('events.manage.list.create') }}
            </button>
        </div>

        <!-- Empty (filtered) -->
        <div v-else-if="filterEvents.length === 0" class="text-center py-5">
            <p class="text-muted">{{ $t('events.manage.list.empty_filtered') }}</p>
        </div>

        <!-- Event rows -->
        <div v-else class="event-list">
            <div
                v-for="(item, idx) in filterEvents"
                :key="idx"
                class="event-row"
                @click="showEventManageModule(item)"
                role="button"
                tabindex="0"
                @keydown.enter="showEventManageModule(item)"
            >
                <div class="event-row__cover">
                    <img v-if="item.cover_image" :src="baseUrl + 'storage/' + item.cover_image" :alt="item.name" />
                    <div v-else class="event-row__cover-placeholder">
                        <font-awesome-icon :icon="['fas', 'calendar-days']" />
                    </div>
                </div>

                <div class="event-row__body">
                    <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                        <span class="badge" :class="item.finished ? 'bg-secondary' : 'bg-success'">
                            {{ item.finished ? $t('events.manage.list.filter_finished') : 'Active' }}
                        </span>
                        <span class="badge" :class="item.fee == 0 ? 'bg-info text-dark' : 'bg-primary'">
                            {{ item.fee == 0 ? $t('events.manage.list.filter_free') : (item.currency?.toUpperCase() + ' ' + Number(item.fee).toFixed(2)) }}
                        </span>
                        <span v-if="item.category" class="event-row__category">
                            {{ item.category }}
                            <template v-if="item.runmode"> · {{ item.runmode }}</template>
                        </span>
                    </div>
                    <h5 class="event-row__title mb-1">{{ item.name }}</h5>
                    <p v-if="item.short_description" class="event-row__excerpt text-muted small mb-0">
                        {{ item.short_description }}
                    </p>
                </div>

                <div class="event-row__actions">
                    <button class="btn btn-sm btn-outline-light" @click.stop="showEventManageModule(item)"
                        :title="$t('events.manage.list.btn_manage')">
                        <font-awesome-icon :icon="['fas', 'pen']" />
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
export default {
    emits: ['eventSelected', 'back'],
    props: {
        show: { type: Boolean, required: true },
        forceOption: { type: Array, default: () => [] }
    },
    data() {
        return {
            baseUrl: SystemVars.baseUrl,
            events: [],
            searchEventWord: '',
            showFreeEvents: true,
            showPaidEvents: true,
            showFinishedEvents: false,
            loading: false,
            loadError: false,
        }
    },
    computed: {
        filterEvents() {
            const search = this.searchEventWord.toLowerCase();
            let result = search.length > 0
                ? this.events.filter(x =>
                    (x.name ?? '').toLowerCase().includes(search) ||
                    (x.short_description ?? '').toLowerCase().includes(search) ||
                    (x.category ?? '').toLowerCase().includes(search)
                )
                : this.events;

            if (this.showFreeEvents && this.showPaidEvents) return result;
            return result.filter(x =>
                (this.showFreeEvents && x.fee == 0) ||
                (this.showPaidEvents && x.fee > 0)
            );
        }
    },
    methods: {
        async loadEvents() {
            this.loading = true;
            this.loadError = false;
            const result = await OrganizationEvent.index(
                this.$route.params.orgRoute,
                this.showFinishedEvents
            );
            this.loading = false;
            if (result.code === 200 && Array.isArray(result.data)) {
                this.events = result.data;
            } else {
                this.loadError = true;
            }
        },
        showEventManageModule(event) {
            this.$emit('eventSelected', event);
            this.$router.push({
                name: this.$route.name,
                params: {
                    orgRoute: this.$route.params.orgRoute,
                    eventRoute: event.route
                }
            });
        },
        showCreateEventModule() {
            this.$router.push({
                name: 'manage-organization-events-create',
                params: { orgRoute: this.$route.params.orgRoute }
            });
        },
    },
    async mounted() {
        await this.loadEvents();
    },
}
</script>

<style scoped>
.events-list { position: relative; }

/* ── Header (reuse gen-* from global or define locally) ── */
.gen-header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 1rem;
}
.gen-back {
    background: none;
    border: none;
    color: rgba(255,255,255,0.45);
    font-size: 0.875rem;
    padding: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    transition: color 0.15s ease;
}
.gen-back:hover { color: rgba(255,255,255,0.9); }
.gen-title {
    text-align: center;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: rgba(255,255,255,0.92);
}

/* ── Section card ── */
.gen-section {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 1rem 1.25rem;
}

/* ── Filters bar ── */
.events-filter-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    padding: 0.75rem 1rem;
}
.events-filter-bar__search { flex: 1 1 200px; }
.events-filter-bar__input {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.88);
}
.events-filter-bar__input::placeholder { color: rgba(255,255,255,0.3); }
.events-filter-bar__input:focus {
    background: rgba(255,255,255,0.07);
    border-color: rgba(255,255,255,0.25);
    color: rgba(255,255,255,0.95);
    box-shadow: none;
}
.events-filter-bar__toggles {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
}

/* ── Event rows ── */
.event-list { display: flex; flex-direction: column; gap: 0.6rem; }

.event-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 0.85rem 1rem;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
}
.event-row:hover {
    background: rgba(255,255,255,0.07);
    border-color: rgba(255,255,255,0.15);
}
.event-row:focus-visible {
    outline: 2px solid rgba(78,139,255,0.6);
    outline-offset: 2px;
}

.event-row__cover {
    flex-shrink: 0;
    width: 90px;
    height: 56px;
    border-radius: 6px;
    overflow: hidden;
    background: rgba(255,255,255,0.06);
}
.event-row__cover img { width: 100%; height: 100%; object-fit: cover; }
.event-row__cover-placeholder {
    width: 100%; height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255,255,255,0.2);
    font-size: 1.1rem;
}

.event-row__body { flex: 1; min-width: 0; }

.event-row__title {
    font-size: 0.95rem;
    font-weight: 600;
    color: rgba(255,255,255,0.9);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;
}
.event-row__excerpt {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.event-row__category {
    font-size: 0.72rem;
    color: rgba(255,255,255,0.35);
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.event-row__actions { display: flex; gap: 0.4rem; flex-shrink: 0; }
</style>
