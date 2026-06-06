<script setup>
import ehubButton from '@/components/inputs/ehub-button.vue';
import Organization from '@/helpers/communication/Organization.js';
import InitialsAvatar from '@/components/general/InitialsAvatar.vue';
</script>

<template>
    <loading v-model:active="isLoading" :can-cancel="false" background-color="#000000" :opacity="0.75" color="#dadada">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">{{ $t('pages.organization.mine.title') }}</span>
        </div>
    </loading>

    <main class="container">
        <div class="row justify-content-between align-items-center mb-4">
            <div class="col">
                <h1 class="display-5">{{ $t('pages.organization.mine.title') }}</h1>
                <p class="text-muted">{{ $t('pages.organization.mine.subtitle') }}</p>
            </div>
            <div class="col-auto">
                <router-link to="/create-org">
                    <ehubButton :text="$t('pages.organization.mine.create_btn')" />
                </router-link>
            </div>
        </div>

        <hr class="mb-4" />

        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <div v-else-if="!isLoading && organizations.length === 0" class="text-center py-5">
            <font-awesome-icon :icon="['fas', 'building']" size="4x" class="text-muted mb-4" />
            <h3 class="mb-2">{{ $t('pages.organization.mine.empty.title') }}</h3>
            <p class="text-muted mb-4">{{ $t('pages.organization.mine.empty.description') }}</p>
            <router-link to="/create-org">
                <ehubButton :text="$t('pages.organization.mine.empty.btn')" />
            </router-link>
        </div>

        <div v-else class="row g-4">
            <div class="col-12 col-md-6 col-lg-4" v-for="org in organizations" :key="org.id">
                <div class="card h-100 org-card">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3 gap-3">
                            <InitialsAvatar :name="org.name" :image="org.logo_image" type="org" :size="48" />
                            <div class="overflow-hidden">
                                <h5 class="card-title mb-1 text-truncate">{{ org.name }}</h5>
                                <span class="badge" :class="roleBadgeClass(org.role)">{{ roleLabel(org.role) }}</span>
                            </div>
                        </div>
                        <p class="card-text text-muted small">
                            {{ org.description || $t('pages.organization.mine.card.no_description') }}
                        </p>
                    </div>
                    <div class="card-footer d-flex gap-2 bg-transparent border-top-0 pb-3">
                        <router-link :to="`/org/${org.route}`" class="btn btn-outline-secondary btn-sm flex-fill">
                            {{ $t('pages.organization.mine.card.view') }}
                        </router-link>
                        <router-link
                            v-if="canManage(org.role)"
                            :to="`/org/${org.route}/manage`"
                            class="btn btn-primary btn-sm flex-fill"
                        >
                            {{ $t('pages.organization.mine.card.manage') }}
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

<script>
import Organization from '@/helpers/communication/Organization.js';
import { i18n } from '@/helpers/i18n';

export default {
    data() {
        return {
            organizations: [],
            isLoading: false,
            error: null,
        };
    },
    async mounted() {
        await this.loadOrganizations();
    },
    methods: {
        async loadOrganizations() {
            this.isLoading = true;
            this.error = null;

            const result = await Organization.getMine();
            this.isLoading = false;

            if (result.code === 200) {
                this.organizations = result.data || [];
            } else {
                this.error = i18n.t('pages.organization.mine.error.load');
            }
        },
        roleBadgeClass(role) {
            const map = {
                owner: 'bg-warning text-dark',
                admin: 'bg-danger',
                financial: 'bg-success',
                event_manager: 'bg-info text-dark',
            };
            return map[role] ?? 'bg-secondary';
        },
        roleLabel(role) {
            const key = `pages.organization.mine.roles.${role}`;
            return i18n.t(key) !== key ? i18n.t(key) : role;
        },
        canManage(role) {
            return ['owner', 'admin'].includes(role);
        },
    },
};
</script>

<style scoped>
.org-card {
    transition: box-shadow 0.2s ease;
}
.org-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}
</style>
