<template>
    <div v-if="show" class="participants-manage">

        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
        </div>

        <template v-else>
            <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="text-muted mb-0 small">
                    {{ $t('events.manage.menu.participants.manage.total', { n: registrations.length }) }}
                </p>
                <button class="btn btn-sm btn-outline-light" @click="load">
                    <font-awesome-icon :icon="['fas', 'rotate-right']" />
                </button>
            </div>

            <div v-if="!registrations.length" class="text-center py-5">
                <font-awesome-icon :icon="['fas', 'users']" class="mb-3 text-muted" style="font-size:2.5rem;opacity:.3" />
                <p class="text-muted mb-0">{{ $t('events.manage.menu.participants.manage.empty') }}</p>
            </div>

            <div v-else class="reg-table">
                <!-- Header -->
                <div class="reg-row reg-row--header">
                    <span>#</span>
                    <span>{{ $t('pages.organization.show.events.participants') || 'Participante' }}</span>
                    <span>Status</span>
                    <span>{{ $t('events.manage.menu.participants.manage.registered_at') }}</span>
                    <span>{{ $t('events.manage.menu.participants.manage.gateway_label') }}</span>
                </div>

                <div
                    v-for="(r, i) in registrations"
                    :key="r.id"
                    class="reg-row"
                    :class="{ 'reg-row--expanded': expanded === r.id }"
                    @click="toggle(r.id)"
                >
                    <!-- Main row -->
                    <span class="reg-index">{{ i + 1 }}</span>

                    <div class="reg-user">
                        <div class="reg-avatar">
                            <img
                                v-if="r.user?.username"
                                :src="baseUrl + 'storage/users/' + r.user.username + '/profile.webp'"
                                :alt="r.user.name"
                                @error="$event.target.style.display='none'; $event.target.nextSibling.style.display='flex'"
                            />
                            <span
                                class="reg-avatar__initials"
                                :style="r.user?.username ? 'display:none' : ''"
                            >{{ initials(r.user?.name) }}</span>
                        </div>
                        <div class="reg-user__info">
                            <span class="reg-user__name">{{ r.user?.name || '—' }}</span>
                            <span v-if="r.user?.username" class="reg-user__username">@{{ r.user.username }}</span>
                        </div>
                    </div>

                    <span>
                        <span class="badge" :class="statusClass(r.payment_status)">
                            {{ statusLabel(r.payment_status) }}
                        </span>
                    </span>

                    <span class="reg-date">{{ formatDate(r.registered_at) }}</span>

                    <span class="reg-gateway text-muted small">{{ r.gateway || '—' }}</span>

                    <!-- Expanded form data -->
                    <div v-if="expanded === r.id && r.form_data && Object.keys(r.form_data).length" class="reg-extra">
                        <p class="reg-extra__label">{{ $t('events.manage.menu.participants.manage.form_data_label') }}</p>
                        <div class="reg-extra__grid">
                            <div v-for="(val, key) in r.form_data" :key="key" class="reg-extra__item">
                                <span class="reg-extra__key">{{ key }}</span>
                                <span class="reg-extra__val">{{ val }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

    </div>
</template>

<script>
import OrganizationEventRegistration from '@/helpers/communication/OrganizationEventRegistration.js';
import SystemVars from '@/helpers/General/SystemVars';

export default {
    props: {
        show:     { type: Boolean, required: true },
        event:    { type: Object,  default: () => ({}) },
        orgRoute: { type: String,  required: true },
    },
    data() {
        return {
            loading: false,
            registrations: [],
            expanded: null,
            baseUrl: SystemVars.baseUrl,
        };
    },
    watch: {
        show(val) { if (val && !this.registrations.length) this.load(); },
        'event.route'() { this.registrations = []; if (this.show) this.load(); },
    },
    async mounted() {
        if (this.show && this.event?.route) this.load();
    },
    methods: {
        async load() {
            if (!this.event?.route) return;
            this.loading = true;
            const result = await OrganizationEventRegistration.manage(this.orgRoute, this.event.route);
            if (result.code === 200 && Array.isArray(result.data)) {
                this.registrations = result.data;
            }
            this.loading = false;
        },
        toggle(id) {
            this.expanded = this.expanded === id ? null : id;
        },
        statusClass(status) {
            if (status === 'confirmed') return 'bg-success';
            if (status === 'free')      return 'bg-info text-dark';
            if (status === 'pending')   return 'bg-warning text-dark';
            return 'bg-secondary';
        },
        statusLabel(status) {
            if (status === 'confirmed') return this.$t('events.manage.menu.participants.manage.confirmed');
            if (status === 'free')      return this.$t('events.manage.menu.participants.manage.free');
            if (status === 'pending')   return this.$t('events.manage.menu.participants.manage.pending');
            return status;
        },
        initials(name) {
            if (!name) return '?';
            return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
        },
        formatDate(dateStr) {
            if (!dateStr) return '—';
            return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        },
    },
};
</script>

<style scoped>
.participants-manage { position: relative; }

.reg-table { display: flex; flex-direction: column; gap: 0; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden; }

.reg-row {
    display: grid;
    grid-template-columns: 2rem 1fr 7rem 8rem 7rem;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    font-size: 0.85rem;
    cursor: pointer;
    transition: background 0.12s;
}
.reg-row:last-child { border-bottom: none; }
.reg-row:hover:not(.reg-row--header) { background: rgba(255,255,255,0.04); }
.reg-row--header {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.4);
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    cursor: default;
}
.reg-row--expanded { background: rgba(255,255,255,0.04); }

/* When expanded, grid-template-columns spans full width for extra row */
.reg-row--expanded { display: block; }
.reg-row--expanded > :not(.reg-extra) {
    display: grid;
    grid-template-columns: 2rem 1fr 7rem 8rem 7rem;
    gap: 0.75rem;
    align-items: center;
    padding: 0;
    /* Override block display for non-extra children — reset via wrapper below */
}

/* Simpler: just let expanded still use grid but add extra below */
.reg-row { flex-wrap: wrap; }
.reg-row--expanded { display: grid; grid-template-columns: 2rem 1fr 7rem 8rem 7rem; grid-template-rows: auto auto; }
.reg-extra { grid-column: 1 / -1; padding: 0.6rem 0 0.2rem; border-top: 1px solid rgba(255,255,255,0.06); }

.reg-index { color: rgba(255,255,255,0.3); text-align: right; font-size: 0.8rem; }

.reg-user { display: flex; align-items: center; gap: 0.6rem; min-width: 0; }
.reg-avatar {
    width: 2rem; height: 2rem; border-radius: 50%; overflow: hidden;
    background: rgba(255,255,255,0.1); flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
}
.reg-avatar img { width: 100%; height: 100%; object-fit: cover; }
.reg-avatar__initials { font-size: 0.65rem; font-weight: 700; color: rgba(255,255,255,0.6); }
.reg-user__info { display: flex; flex-direction: column; min-width: 0; }
.reg-user__name { font-weight: 500; color: rgba(255,255,255,0.88); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.reg-user__username { font-size: 0.72rem; color: rgba(255,255,255,0.35); }

.reg-date { color: rgba(255,255,255,0.45); white-space: nowrap; }
.reg-gateway { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.reg-extra__label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(255,255,255,0.3); margin-bottom: 0.4rem; }
.reg-extra__grid { display: flex; flex-wrap: wrap; gap: 0.4rem 1.5rem; }
.reg-extra__item { display: flex; gap: 0.4rem; font-size: 0.8rem; }
.reg-extra__key { color: rgba(255,255,255,0.4); }
.reg-extra__val { color: rgba(255,255,255,0.75); font-weight: 500; }

@media (max-width: 640px) {
    .reg-row, .reg-row--expanded { grid-template-columns: 2rem 1fr 6rem; }
    .reg-date, .reg-gateway { display: none; }
    .reg-row--header span:nth-child(4),
    .reg-row--header span:nth-child(5) { display: none; }
}
</style>
