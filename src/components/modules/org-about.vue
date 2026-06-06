<template>
    <div class="row w-100">
        <div class="col-12">

            <!-- About -->
            <div v-if="orgData.about || orgData.description" class="mb-4">
                <h4>Sobre</h4>
                <p class="text-muted">{{ orgData.about || orgData.description }}</p>
                <small v-if="orgData.created_at" class="text-muted d-block">
                    Organização desde {{ formatDate(orgData.created_at) }}
                </small>
            </div>

            <!-- Staff -->
            <div v-if="members.length > 0" class="mb-4">
                <hr />
                <h4>Staff</h4>
                <div class="row g-2 mt-1">
                    <div class="col-12 col-md-6" v-for="m in members" :key="m.id">
                        <div class="d-flex align-items-center gap-2">
                            <InitialsAvatar
                                :name="`${m.user?.name ?? ''} ${m.user?.surname ?? ''}`"
                                :image="m.user?.image ?? ''"
                                type="user"
                                :size="36"
                            />
                            <div>
                                <div class="fw-semibold small">{{ m.user?.name }} {{ m.user?.surname }}</div>
                                <div class="text-muted" style="font-size:0.75rem">{{ roleLabel(m.role) }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Social -->
            <div v-if="hasSocial" class="mb-4">
                <hr />
                <h4>Redes Sociais</h4>
                <div class="d-flex flex-wrap gap-3 mt-2">
                    <a v-if="orgData.instagram" :href="`https://instagram.com/${orgData.instagram.replace('@','')}`" target="_blank" class="text-muted text-decoration-none">
                        <font-awesome-icon :icon="['fab', 'instagram']" class="me-1" />{{ orgData.instagram }}
                    </a>
                    <a v-if="orgData.facebook" :href="`https://facebook.com/${orgData.facebook}`" target="_blank" class="text-muted text-decoration-none">
                        <font-awesome-icon :icon="['fab', 'facebook']" class="me-1" />{{ orgData.facebook }}
                    </a>
                    <a v-if="orgData.x_twitter" :href="`https://x.com/${orgData.x_twitter.replace('@','')}`" target="_blank" class="text-muted text-decoration-none">
                        <font-awesome-icon :icon="['fab', 'x-twitter']" class="me-1" />{{ orgData.x_twitter }}
                    </a>
                    <a v-if="orgData.website" :href="orgData.website" target="_blank" class="text-muted text-decoration-none">
                        <font-awesome-icon :icon="['fas', 'globe']" class="me-1" />{{ orgData.website }}
                    </a>
                </div>
            </div>

            <!-- Contact -->
            <div v-if="hasContact" class="mb-4">
                <hr />
                <h4>Contato</h4>
                <div class="d-flex flex-column gap-1 mt-2">
                    <span v-if="orgData.phone" class="text-muted">
                        <font-awesome-icon :icon="['fas', 'phone']" class="me-2" />{{ orgData.phone }}
                    </span>
                    <span v-if="orgData.contact_email" class="text-muted">
                        <font-awesome-icon :icon="['fas', 'envelope']" class="me-2" />{{ orgData.contact_email }}
                    </span>
                </div>
            </div>

            <!-- Empty state -->
            <div v-if="isEmpty" class="text-center py-4 text-muted">
                <font-awesome-icon :icon="['fas', 'building']" size="2x" class="mb-2 opacity-50" />
                <p>Nenhuma informação disponível ainda.</p>
            </div>
        </div>
    </div>
</template>

<script>
import InitialsAvatar from '@/components/general/InitialsAvatar.vue';

const ROLE_LABELS = {
    owner: 'Dono',
    admin: 'Administrador',
    financial: 'Financeiro',
    event_manager: 'Gestor de Eventos',
};

export default {
    components: { InitialsAvatar },
    props: {
        orgData: { type: Object, default: () => ({}) },
        members: { type: Array, default: () => [] },
    },
    computed: {
        hasSocial() {
            return !!(this.orgData.instagram || this.orgData.facebook || this.orgData.x_twitter || this.orgData.website);
        },
        hasContact() {
            return !!(this.orgData.phone || this.orgData.contact_email);
        },
        isEmpty() {
            return !this.orgData.about && !this.orgData.description && !this.members.length && !this.hasSocial && !this.hasContact;
        },
    },
    methods: {
        roleLabel(role) {
            return ROLE_LABELS[role] ?? role;
        },
        formatDate(dateStr) {
            if (!dateStr) return '';
            return new Date(dateStr).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
        },
    },
};
</script>
