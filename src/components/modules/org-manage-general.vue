<script setup>
import ehubInput from '@/components/inputs/ehub-input.vue';
import ehubButton from '@/components/inputs/ehub-button.vue';
import Organization from '@/helpers/communication/Organization.js';
import InitialsAvatar from '@/components/general/InitialsAvatar.vue';
import AvatarUpload from '@/components/inputs/AvatarUpload.vue';
import SystemVars from '@/helpers/General/SystemVars';
</script>

<template>
    <loading v-model:active="isLoading" :can-cancel="false" background-color="#000000" :opacity="0.75" color="#dadada">
        <div class="spinner-border text-primary" role="status"></div>
    </loading>

    <!-- Page header -->
    <div class="gen-header mb-4">
        <button class="gen-back" @click="$emit('close')">
            <font-awesome-icon :icon="['fas', 'arrow-left']" />
            {{ $t('pages.organization.general.back') }}
        </button>
        <h2 class="gen-title">{{ $t('pages.organization.general.title') }}</h2>
        <div></div>
    </div>

    <!-- Tab nav -->
    <ul class="nav nav-tabs gen-tabs mb-4">
        <li v-for="menu in menus" :key="menu.action" class="nav-item">
            <button
                v-if="menu.action !== 'danger' || userRole === 'owner'"
                class="nav-link"
                :class="[{ active: actualMenu === menu.action }, menu.action === 'danger' ? 'gen-tab--danger' : '']"
                @click="actualMenu = menu.action"
            >
                <font-awesome-icon v-if="menu.action === 'danger'" :icon="['fas', 'trash']" class="me-1" />
                {{ $t(`pages.organization.general.menus.${menu.action}`) }}
            </button>
        </li>
    </ul>

    <!-- About -->
    <div v-if="actualMenu === 'about'">

        <!-- Logo -->
        <div class="gen-section mb-4">
            <h6 class="gen-section__title">{{ $t('pages.organization.general.about.sections.logo') }}</h6>
            <div class="gen-logo-center">
                <AvatarUpload
                    v-model="aboutForm.logo_image"
                    :buttonLabel="$t('pages.organization.general.about.logo_upload')"
                    :dropLabel="$t('pages.organization.general.about.logo_drop')"
                    :fallbackName="orgName"
                    fallbackType="org"
                    :initialsSize="120"
                />
            </div>
            <div class="alert alert-info d-flex align-items-center gap-2 mt-3 mb-0 py-2 small">
                <font-awesome-icon :icon="['fas', 'circle-info']" class="flex-shrink-0" />
                {{ $t('pages.organization.general.about.logo_hint') }}
            </div>
        </div>

        <!-- Basic info -->
        <div class="gen-section mb-4">
            <h6 class="gen-section__title">{{ $t('pages.organization.general.about.sections.basic') }}</h6>
            <div class="row g-3">
                <div class="col-12">
                    <label class="gen-label">{{ $t('pages.organization.general.about.fields.name') }}</label>
                    <ehubInput id="about-name" v-model="aboutForm.name" type="text"
                        :placeholder="$t('pages.organization.general.about.placeholders.name')"
                        :validation="aboutValidation.name" />
                </div>
                <div class="col-12">
                    <label class="gen-label">{{ $t('pages.organization.general.about.fields.description') }}</label>
                    <ehubInput id="about-desc" v-model="aboutForm.description" type="text"
                        :placeholder="$t('pages.organization.general.about.placeholders.description')" />
                </div>
                <div class="col-12">
                    <label class="gen-label">{{ $t('pages.organization.general.about.fields.about') }}</label>
                    <ehubInput id="about-about" v-model="aboutForm.about" type="textarea"
                        :placeholder="$t('pages.organization.general.about.placeholders.about')" />
                </div>
            </div>
        </div>

        <!-- Social media -->
        <div class="gen-section mb-4">
            <h6 class="gen-section__title">{{ $t('pages.organization.general.about.sections.social') }}</h6>
            <div class="row g-3">
                <div class="col-12 col-md-6">
                    <label class="gen-label">
                        <font-awesome-icon :icon="['fab', 'instagram']" class="me-1" />
                        {{ $t('pages.organization.general.about.fields.instagram') }}
                    </label>
                    <ehubInput id="about-instagram" v-model="aboutForm.instagram" type="text"
                        :placeholder="$t('pages.organization.general.about.placeholders.instagram')" />
                </div>
                <div class="col-12 col-md-6">
                    <label class="gen-label">
                        <font-awesome-icon :icon="['fab', 'facebook']" class="me-1" />
                        {{ $t('pages.organization.general.about.fields.facebook') }}
                    </label>
                    <ehubInput id="about-facebook" v-model="aboutForm.facebook" type="text"
                        :placeholder="$t('pages.organization.general.about.placeholders.facebook')" />
                </div>
                <div class="col-12 col-md-6">
                    <label class="gen-label">
                        <font-awesome-icon :icon="['fab', 'x-twitter']" class="me-1" />
                        {{ $t('pages.organization.general.about.fields.x_twitter') }}
                    </label>
                    <ehubInput id="about-x" v-model="aboutForm.x_twitter" type="text"
                        :placeholder="$t('pages.organization.general.about.placeholders.x_twitter')" />
                </div>
                <div class="col-12 col-md-6">
                    <label class="gen-label">
                        <font-awesome-icon :icon="['fas', 'globe']" class="me-1" />
                        {{ $t('pages.organization.general.about.fields.website') }}
                    </label>
                    <ehubInput id="about-website" v-model="aboutForm.website" type="text"
                        :placeholder="$t('pages.organization.general.about.placeholders.website')" />
                </div>
            </div>
        </div>

        <!-- Contact -->
        <div class="gen-section mb-4">
            <h6 class="gen-section__title">{{ $t('pages.organization.general.about.sections.contact') }}</h6>
            <div class="row g-3">
                <div class="col-12 col-md-6">
                    <label class="gen-label">
                        <font-awesome-icon :icon="['fas', 'phone']" class="me-1" />
                        {{ $t('pages.organization.general.about.fields.phone') }}
                    </label>
                    <ehubInput id="about-phone" v-model="aboutForm.phone" type="text"
                        :placeholder="$t('pages.organization.general.about.placeholders.phone')" />
                </div>
                <div class="col-12 col-md-6">
                    <label class="gen-label">
                        <font-awesome-icon :icon="['fas', 'envelope']" class="me-1" />
                        {{ $t('pages.organization.general.about.fields.contact_email') }}
                    </label>
                    <ehubInput id="about-email" v-model="aboutForm.contact_email" type="text"
                        :placeholder="$t('pages.organization.general.about.placeholders.contact_email')" />
                </div>
            </div>
        </div>

        <div class="d-flex justify-content-end">
            <ehubButton
                :text="$t('pages.organization.general.about.save')"
                buttonClass="btn-primary px-5"
                @click="saveAbout"
            />
        </div>
    </div>

    <!-- Staff -->
    <div v-else-if="actualMenu === 'staff'">

        <!-- Members list -->
        <div class="gen-section mb-4">
            <h6 class="gen-section__title">{{ $t('pages.organization.general.staff.members_title') }}</h6>

            <p v-if="members.length === 0 && invites.length === 0" class="text-muted small mb-0">
                {{ $t('pages.organization.general.staff.empty') }}
            </p>

            <div v-else class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead>
                        <tr>
                            <th>{{ $t('pages.organization.general.staff.table.username') }}</th>
                            <th>{{ $t('pages.organization.general.staff.table.name') }}</th>
                            <th>{{ $t('pages.organization.general.staff.table.role') }}</th>
                            <th>{{ $t('pages.organization.general.staff.table.actions') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="member in members" :key="member.id">
                            <td>
                                <router-link
                                    v-if="member.user?.username"
                                    :to="`/profile/${member.user.username}`"
                                    class="d-flex align-items-center gap-2 text-decoration-none"
                                >
                                    <InitialsAvatar
                                        :name="`${member.user?.name ?? ''} ${member.user?.surname ?? ''}`"
                                        :image="member.user?.image ?? ''"
                                        type="user"
                                        :size="32"
                                    />
                                    <span class="fw-medium" style="color:var(--ehub-ink)">{{ member.user?.username }}</span>
                                </router-link>
                                <div v-else class="d-flex align-items-center gap-2">
                                    <InitialsAvatar
                                        :name="`${member.user?.name ?? ''} ${member.user?.surname ?? ''}`"
                                        :image="member.user?.image ?? ''"
                                        type="user"
                                        :size="32"
                                    />
                                    <span class="fw-medium">{{ member.user?.username }}</span>
                                </div>
                            </td>
                            <td class="text-muted">{{ member.user?.name }} {{ member.user?.surname }}</td>
                            <td>
                                <span class="badge" :class="roleBadgeClass(member.role)">
                                    {{ $t(`pages.organization.general.staff.roles.${member.role}`) }}
                                </span>
                            </td>
                            <td>
                                <!-- Non-owner member: show role change + remove (never on own row) -->
                                <div v-if="member.role !== 'owner' && member.user?.id !== myUserId && userRole === 'owner' || member.role !== 'owner' && member.user?.id !== myUserId && userRole === 'admin'" class="d-flex gap-2">
                                    <select
                                        class="form-select form-select-sm gen-role-select"
                                        :value="member.role"
                                        @change="changeRole(member, $event.target.value)"
                                    >
                                        <option value="admin">{{ $t('pages.organization.general.staff.roles.admin') }}</option>
                                        <option value="financial">{{ $t('pages.organization.general.staff.roles.financial') }}</option>
                                        <option value="event_manager">{{ $t('pages.organization.general.staff.roles.event_manager') }}</option>
                                    </select>
                                    <button class="btn btn-outline-danger btn-sm" @click="removeMember(member)">
                                        <font-awesome-icon :icon="['fas', 'trash']" />
                                    </button>
                                </div>
                                <!-- Own non-owner row: leave button -->
                                <div v-else-if="member.user?.id === myUserId && member.role !== 'owner'">
                                    <button class="btn btn-outline-danger btn-sm" @click="leaveOrg">
                                        <font-awesome-icon :icon="['fas', 'arrow-right-from-bracket']" class="me-1" />
                                        {{ $t('pages.organization.general.staff.leave') }}
                                    </button>
                                </div>
                                <!-- Owner row: show transfer button only if I am the owner -->
                                <div v-else-if="member.role === 'owner' && member.user?.id === myUserId && userRole === 'owner'">
                                    <button
                                        class="btn btn-outline-warning btn-sm"
                                        @click="transfer.show = !transfer.show"
                                    >
                                        <font-awesome-icon :icon="['fas', 'arrow-right']" class="me-1" />
                                        {{ $t('pages.organization.general.staff.transfer.button') }}
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <!-- Pending invite rows -->
                        <tr v-for="invite in invites" :key="'invite-' + invite.id" class="gen-invite-row">
                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <div class="gen-invite-avatar">
                                        <font-awesome-icon :icon="['fas', 'envelope']" />
                                    </div>
                                    <span class="text-muted">{{ invite.email }}</span>
                                </div>
                            </td>
                            <td class="text-muted small">
                                {{ $t('pages.organization.general.staff.invite_expires', { date: formatExpiry(invite.expires_at) }) }}
                            </td>
                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <span class="badge" :class="roleBadgeClass(invite.role)">
                                        {{ $t(`pages.organization.general.staff.roles.${invite.role}`) }}
                                    </span>
                                    <span class="gen-pending-badge">
                                        {{ $t('pages.organization.general.staff.pending_badge') }}
                                    </span>
                                </div>
                            </td>
                            <td>
                                <div v-if="userRole === 'owner' || userRole === 'admin'" class="d-flex gap-2">
                                    <button class="btn btn-outline-secondary btn-sm" @click="resendInvite(invite)">
                                        <font-awesome-icon :icon="['fas', 'envelope']" class="me-1" />
                                        {{ $t('pages.organization.general.staff.resend') }}
                                    </button>
                                    <button class="btn btn-outline-danger btn-sm" @click="removeInvite(invite)">
                                        <font-awesome-icon :icon="['fas', 'trash']" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Transfer ownership panel -->
                <Transition name="slide-down">
                    <div v-if="transfer.show" class="gen-transfer mt-3">
                        <p class="gen-section__title mb-2">{{ $t('pages.organization.general.staff.transfer.title') }}</p>
                        <div class="gen-add-row">
                            <div class="gen-add-field">
                                <label class="gen-label">{{ $t('pages.organization.general.staff.transfer.label') }}</label>
                                <input
                                    type="email"
                                    class="form-control"
                                    v-model="transfer.email"
                                    :placeholder="$t('pages.organization.general.staff.transfer.placeholder')"
                                />
                            </div>
                            <div class="d-flex flex-column gap-1">
                                <label class="gen-label gen-label--spacer">&nbsp;</label>
                                <div class="d-flex gap-2">
                                <button class="btn btn-warning btn-sm" @click="confirmTransfer" :disabled="transfer.loading">
                                    {{ $t('pages.organization.general.staff.transfer.confirm') }}
                                </button>
                                <button class="btn btn-outline-secondary btn-sm" @click="transfer.show = false">
                                    {{ $t('pages.organization.general.staff.transfer.cancel') }}
                                </button>
                                </div>
                            </div>
                        </div>
                        <p class="text-warning small mt-2 mb-0">
                            <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="me-1" />
                            {{ $t('pages.organization.general.staff.transfer.warning') }}
                        </p>
                    </div>
                </Transition>
            </div>
        </div>

        <!-- Invite member (owner/admin only) -->
        <div v-if="userRole === 'owner' || userRole === 'admin'" class="gen-section">
            <h6 class="gen-section__title">{{ $t('pages.organization.general.staff.add.title') }}</h6>
            <div class="gen-add-row">
                <div class="gen-add-field">
                    <label class="gen-label">{{ $t('pages.organization.general.staff.add.email') }}</label>
                    <ehubInput
                        v-model="addForm.email"
                        type="text"
                        :placeholder="$t('pages.organization.general.staff.add.email_placeholder')"
                        :validation="addValidation.email"
                    />
                </div>
                <div class="gen-add-role">
                    <select class="form-select" v-model="addForm.role">
                        <option value="admin">{{ $t('pages.organization.general.staff.roles.admin') }}</option>
                        <option value="financial">{{ $t('pages.organization.general.staff.roles.financial') }}</option>
                        <option value="event_manager">{{ $t('pages.organization.general.staff.roles.event_manager') }}</option>
                    </select>
                </div>
                <div class="gen-add-action">
                    <ehubButton
                        :text="$t('pages.organization.general.staff.add.button')"
                        buttonClass="btn-primary"
                        @click="addMember"
                    />
                </div>
            </div>
            <p class="text-muted small mt-2 mb-0">
                <font-awesome-icon :icon="['fas', 'circle-info']" class="me-1" />
                {{ $t('pages.organization.general.staff.add.email_hint') }}
            </p>
        </div>
    </div>

    <!-- Danger zone -->
    <div v-else-if="actualMenu === 'danger'">
        <div class="gen-section gen-section--danger">
            <h6 class="gen-section__title gen-section__title--danger">
                {{ $t('pages.organization.general.danger.section_title') }}
            </h6>

            <div class="alert alert-warning d-flex align-items-center gap-2 mb-4 small">
                <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="flex-shrink-0" />
                {{ $t('pages.organization.general.danger.warning') }}
            </div>

            <label class="gen-label mb-1">
                {{ $t('pages.organization.general.danger.confirm_label', { name: orgName }) }}
            </label>
            <div class="gen-add-row mt-1">
                <div class="gen-add-field">
                    <input
                        type="text"
                        class="form-control"
                        v-model="deleteConfirm.input"
                        :placeholder="orgName"
                    />
                </div>
                <div class="gen-add-action">
                    <label class="gen-label gen-label--spacer">&nbsp;</label>
                    <button
                        class="btn btn-danger"
                        :disabled="deleteConfirm.input !== orgName || deleteConfirm.loading"
                        @click="deleteOrganization"
                    >
                        <font-awesome-icon :icon="['fas', 'trash']" class="me-1" />
                        {{ $t('pages.organization.general.danger.delete_button') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Organization from '@/helpers/communication/Organization.js';
import { toast } from '@/helpers/toast.js';

export default {
    components: { InitialsAvatar },
    emits: ['close'],
    props: {
        orgRoute: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            menus: [
                { action: 'about' },
                { action: 'staff' },
                { action: 'danger' },
            ],
            actualMenu: 'about',
            userRole: null,
            orgName: '',
            isLoading: false,
            deleteConfirm: { input: '', loading: false },

            aboutForm: {
                logo_image: '',
                name: '', description: '', about: '',
                instagram: '', facebook: '', x_twitter: '', website: '',
                phone: '', contact_email: '',
            },
            aboutValidation: {},

            myUserId: null,
            members: [],
            invites: [],

            addForm: { email: '', role: 'event_manager' },
            addValidation: {},

            transfer: { show: false, email: '', loading: false },
        };
    },
    watch: {
        actualMenu(val) {
            if (val === 'about') this.loadAbout();
            if (val === 'staff') this.loadMembers();
        },
    },
    mounted() {
        this.loadAbout();
    },
    methods: {
        async loadAbout() {
            this.isLoading = true;
            const result = await Organization.show(this.orgRoute);
            this.isLoading = false;
            if (result.code === 200 && result.data) {
                const d = result.data;
                this.userRole                = d.role ?? null;
                this.myUserId                = d.my_user_id ?? null;
                this.orgName                 = d.name ?? '';
                this.aboutForm.logo_image    = d.logo_image ? SystemVars.baseUrl + 'storage/' + d.logo_image : '';
                this.aboutForm.name          = d.name ?? '';
                this.aboutForm.description   = d.description ?? '';
                this.aboutForm.about         = d.about ?? '';
                this.aboutForm.instagram     = d.instagram ?? '';
                this.aboutForm.facebook      = d.facebook ?? '';
                this.aboutForm.x_twitter     = d.x_twitter ?? '';
                this.aboutForm.website       = d.website ?? '';
                this.aboutForm.phone         = d.phone ?? '';
                this.aboutForm.contact_email = d.contact_email ?? '';
            }
        },
        async saveAbout() {
            this.aboutValidation = {};
            this.isLoading = true;
            const payload = { ...this.aboutForm };
            if (!payload.logo_image?.startsWith('data:')) delete payload.logo_image;
            const result = await Organization.updateProfile(this.orgRoute, payload);
            this.isLoading = false;
            if (result.code === 200) {
                toast.success(this.$t('pages.organization.general.about.success'));
            } else {
                toast.error(result.data?.message ?? this.$t('pages.organization.general.about.error'));
            }
        },
        async loadMembers() {
            this.isLoading = true;
            const [membersResult, invitesResult] = await Promise.all([
                Organization.getMembers(this.orgRoute),
                Organization.getInvites(this.orgRoute),
            ]);
            this.isLoading = false;

            if (membersResult.code === 200) {
                this.members = membersResult.data ?? [];
                const me = this.members.find(m => m.user?.id === this.myUserId);
                if (me) this.userRole = me.role;
            } else {
                toast.error(this.$t('pages.organization.general.staff.error_load'));
            }

            if (invitesResult.code === 200) {
                this.invites = invitesResult.data ?? [];
            }
        },
        async deleteOrganization() {
            this.deleteConfirm.loading = true;
            const result = await Organization.delete(this.orgRoute);
            this.deleteConfirm.loading = false;

            if (result.code === 200) {
                this.$emit('close');
                this.$router.push({ name: 'my-organizations' });
            }
        },
        staffApiError(key, fallback) {
            const path = `pages.organization.general.staff.errors.${key}`;
            return this.$te(path) ? this.$t(path) : this.$t(fallback);
        },
        async addMember() {
            this.addValidation = {};

            const email = this.addForm.email.trim();
            if (!email) {
                this.addValidation.email = { type: 'error', text: 'Email is required' };
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                this.addValidation.email = { type: 'error', text: 'Invalid email' };
                return;
            }

            this.isLoading = true;
            const result = await Organization.addMember(this.orgRoute, email, this.addForm.role);
            this.isLoading = false;

            if (result.code === 201) {
                toast.success(this.$t('pages.organization.general.staff.success_add', { email }));
                this.addForm.email = '';
                await this.loadMembers();
            } else {
                toast.error(this.staffApiError(result.data, 'pages.organization.general.staff.error_add'));
            }
        },
        async confirmTransfer() {
            const email = this.transfer.email.trim();
            if (!email) return;

            this.transfer.loading = true;
            const result = await Organization.transferOwnership(this.orgRoute, email);
            this.transfer.loading = false;

            if (result.code === 200) {
                toast.success(this.$t('pages.organization.general.staff.transfer.success'));
                this.transfer.show = false;
                this.transfer.email = '';
                await this.loadMembers();
            } else {
                toast.error(this.staffApiError(result.data, 'pages.organization.general.staff.transfer.error'));
            }
        },
        async changeRole(member, newRole) {
            this.isLoading = true;
            const result = await Organization.updateMemberRole(this.orgRoute, member.user.id, newRole);
            this.isLoading = false;
            if (result.code === 200) {
                member.role = newRole;
            } else {
                toast.error(this.$t('pages.organization.general.staff.error_role'));
            }
        },
        async removeMember(member) {
            this.isLoading = true;
            const result = await Organization.removeMember(this.orgRoute, member.user.id);
            this.isLoading = false;
            if (result.code === 200) {
                this.members = this.members.filter(m => m.id !== member.id);
                toast.success(this.$t('pages.organization.general.staff.success_remove', { username: member.user.username }));
            } else {
                toast.error(this.$t('pages.organization.general.staff.error_remove'));
            }
        },
        async resendInvite(invite) {
            this.isLoading = true;
            const result = await Organization.resendInvite(this.orgRoute, invite.id);
            this.isLoading = false;
            if (result.code === 200) {
                toast.success(this.$t('pages.organization.general.staff.resend_success', { email: invite.email }));
            } else {
                toast.error(this.$t('pages.organization.general.staff.resend_error'));
            }
        },
        async leaveOrg() {
            this.isLoading = true;
            const result = await Organization.leaveOrganization(this.orgRoute);
            this.isLoading = false;
            if (result.code === 200) {
                this.$emit('close');
                this.$router.push({ name: 'my-organizations' });
            } else {
                toast.error(this.$t('pages.organization.general.staff.error_leave'));
            }
        },
        async removeInvite(invite) {
            this.isLoading = true;
            const result = await Organization.removeInvite(this.orgRoute, invite.id);
            this.isLoading = false;
            if (result.code === 200) {
                this.invites = this.invites.filter(i => i.id !== invite.id);
                toast.success(this.$t('pages.organization.general.staff.remove_invite_success'));
            } else {
                toast.error(this.$t('pages.organization.general.staff.remove_invite_error'));
            }
        },
        formatExpiry(dateStr) {
            return new Date(dateStr).toLocaleDateString();
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
    },
};
</script>

<style scoped>
/* ── Logo upload ── */
.gen-logo-center {
    display: flex;
    justify-content: center;
}

/* ── Header ── */
.gen-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.gen-back {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.875rem;
    padding: 0;
    cursor: pointer;
    transition: color 0.15s ease;
}

.gen-back:hover {
    color: rgba(255, 255, 255, 0.9);
}

.gen-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: rgba(255, 255, 255, 0.92);
}

/* ── Tabs ── */
.gen-tabs {
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    gap: 0.25rem;
}

.gen-tabs .nav-link {
    color: rgba(255, 255, 255, 0.45);
    border: none;
    border-bottom: 2px solid transparent;
    padding: 0.55rem 1.1rem;
    font-size: 0.9rem;
    font-weight: 500;
    transition: color 0.15s ease, border-color 0.15s ease;
    background: none;
    border-radius: 0;
}

.gen-tabs .nav-link:hover {
    color: rgba(255, 255, 255, 0.8);
    border-bottom-color: rgba(255, 255, 255, 0.2);
}

.gen-tabs .nav-link.active {
    color: #fff;
    border-bottom-color: #4e8bff;
    background: none;
}

/* ── Sections ── */
.gen-section {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.4rem 1.6rem;
}

.gen-section__title {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.35);
    margin-bottom: 1.1rem;
}

.gen-label {
    display: block;
    font-size: 0.85rem;
    font-weight: 500;
    margin-bottom: 0.35rem;
    color: rgba(255, 255, 255, 0.75);
}

/* ── Danger zone ── */
.gen-section--danger {
    border-color: rgba(220, 53, 69, 0.3);
}

.gen-section__title--danger {
    color: rgba(220, 53, 69, 0.7);
}

.gen-tab--danger {
    color: rgba(220, 53, 69, 0.6) !important;
}

.gen-tab--danger:hover {
    color: rgba(220, 53, 69, 0.9) !important;
    border-bottom-color: rgba(220, 53, 69, 0.4) !important;
}

.gen-tab--danger.active {
    color: #dc3545 !important;
    border-bottom-color: #dc3545 !important;
}

/* ── Pending invite rows ── */
.gen-invite-row td {
    opacity: 0.7;
}

.gen-invite-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    border: 1px dashed rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    flex-shrink: 0;
}

.gen-pending-badge {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #fbbf24;
    border: 1px solid rgba(251, 191, 36, 0.35);
    background: rgba(251, 191, 36, 0.08);
    padding: 2px 8px;
    border-radius: 20px;
}

/* ── Role select ── */
.gen-role-select {
    width: auto;
    min-width: 140px;
}

/* ── Add / invite row ── */
.gen-add-row {
    display: flex;
    gap: 0.75rem;
    align-items: flex-end;
    flex-wrap: wrap;
}

.gen-add-field {
    flex: 1 1 240px;
}

.gen-add-field :deep(.input-group) {
    margin-bottom: 0 !important;
}

.gen-add-field :deep(.input-feedback) {
    display: none;
}

.gen-add-role {
    flex: 0 0 160px;
}

.gen-add-role .form-select {
    height: 38px;
}

.gen-add-action {
    flex: 0 0 auto;
}

.gen-label--spacer {
    visibility: hidden;
    pointer-events: none;
    user-select: none;
}

/* ── Transfer panel ── */
.gen-transfer {
    background: rgba(255, 193, 7, 0.06);
    border: 1px solid rgba(255, 193, 7, 0.25);
    border-radius: 8px;
    padding: 1rem 1.1rem;
}

/* ── Slide-down transition ── */
.slide-down-enter-active,
.slide-down-leave-active {
    transition: opacity 0.22s ease, transform 0.22s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-8px);
}
</style>
