<script setup>
import ehubInput from '@/components/inputs/ehub-input.vue';
import ehubButton from '@/components/inputs/ehub-button.vue';
import AvatarUpload from '@/components/inputs/AvatarUpload.vue';
import Organization from '@/helpers/communication/Organization.js';
import router from '@/router';
import { i18n } from '@/helpers/i18n';
</script>

<template>
    <loading v-model:active="isLoading" :can-cancel="false" background-color="#000000" :opacity="0.75" color="#dadada">
        <div class="text-center">
            <div class="spinner-border text-primary mb-3" role="status"></div>
            <h5 class="text-white">{{ loadingText }}</h5>
        </div>
    </loading>

    <main class="container py-4">

        <!-- Live title -->
        <div class="row justify-content-center text-center mb-4">
            <div class="col-12 col-lg-8">
                <transition name="fade-title" mode="out-in">
                    <h1 :key="displayName" class="display-4 fw-light mb-2">{{ displayName }}</h1>
                </transition>
                <p class="text-muted">{{ $t("pages.organization.create.subtitle") }}</p>
            </div>
        </div>

        <hr class="mb-4" />

        <!-- Tip alert -->
        <div class="row justify-content-center mb-4">
            <div class="col-12 col-lg-10">
                <div class="alert alert-primary d-flex align-items-center gap-2 mb-0 py-2" role="alert">
                    <font-awesome-icon icon="circle-info" class="flex-shrink-0" />
                    <span class="small">{{ $t("pages.organization.create.tips.image") }}</span>
                </div>
            </div>
        </div>

        <!-- Form row -->
        <div class="row justify-content-center g-4">

            <!-- Image upload -->
            <div class="col-12 col-lg-10">
                <div class="d-flex flex-column flex-md-row align-items-start gap-4">

                    <AvatarUpload
                        v-model="orgForm.logo_image"
                        :buttonLabel="$t('users.create.form.image.upload')"
                        :dropLabel="$t('users.create.form.image.drop')"
                    />

                    <!-- Fields -->
                    <div class="flex-grow-1 min-w-0">

                        <!-- Name -->
                        <ehubInput
                            id="org-name"
                            v-model="orgForm.name"
                            type="text"
                            :label='$t("pages.organization.create.form.org_name")'
                            placeholder=""
                            :validation="formValidation.name"
                        />
                        <div class="d-flex justify-content-end mb-3">
                            <small :class="charCounterClass(orgForm.name.length, 64)">{{ orgForm.name.length }}/64</small>
                        </div>

                        <!-- Route / Identifier -->
                        <ehubInput
                            id="org-route"
                            v-model="orgForm.route"
                            :label='$t("pages.organization.create.form.org_identifier")'
                            placeholder=""
                            :validation="formValidation.route"
                        />
                        <div class="d-flex justify-content-end mb-3">
                            <small :class="charCounterClass(orgForm.route.length, 64)">{{ orgForm.route.length }}/64</small>
                        </div>

                        <!-- Description -->
                        <ehubInput
                            id="org-description"
                            v-model="orgForm.description"
                            type="text"
                            :label='$t("pages.organization.create.form.org_description")'
                            placeholder=""
                            :validation="formValidation.description"
                        />
                        <div class="d-flex justify-content-end mb-4">
                            <small :class="charCounterClass(orgForm.description.length, 180)">{{ orgForm.description.length }}/180</small>
                        </div>

                        <!-- General error -->
                        <div v-if="formValidation.general" class="alert alert-danger mb-3 py-2">
                            {{ formValidation.general }}
                        </div>

                        <!-- Submit -->
                        <ehubButton
                            @click="executeAction"
                            :text='$t("pages.organization.create.form.org_submit")'
                            :disabled="!enableToCreateOrg"
                            containerClass="w-100"
                            buttonClass="w-100"
                        />
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

<script>
import Organization from '@/helpers/communication/Organization.js';
import router from '@/router';
import { i18n } from '@/helpers/i18n';

export default {
    data() {
        return {
            orgForm: {
                name: '',
                description: '',
                route: '',
                logo_image: '',
            },
            routeManuallyEdited: false,
            formValidation: {},
            enableToCreateOrg: false,
            isLoading: false,
            loadingText: '',
        };
    },
    computed: {
        displayName() {
            return this.orgForm.name.trim()
                ? i18n.t('pages.organization.create.title', { org_name: this.orgForm.name.trim() })
                : i18n.t('pages.organization.create.title_default');
        },
    },
    watch: {
        'orgForm.name'(val) {
            const clean = val.replace(/\s+/g, ' ').slice(0, 64);
            if (clean !== val) { this.orgForm.name = clean; return; }

            if (!this.routeManuallyEdited)
                this.orgForm.route = this.slugify(clean);

            this.validateRoute();
        },
        'orgForm.route'(val) {
            const sanitized = this.sanitizeRoute(val);
            if (sanitized !== val) { this.orgForm.route = sanitized; return; }

            if (val !== this.slugify(this.orgForm.name))
                this.routeManuallyEdited = true;

            this.validateRoute();
        },
        'orgForm.description'(val) {
            if (val.length > 180) this.orgForm.description = val.slice(0, 180);
        },
    },
    methods: {
        charCounterClass(len, max) {
            if (len >= max) return 'text-danger';
            if (len >= max * 0.875) return 'text-warning';
            return 'text-muted';
        },

        sanitizeRoute(val) {
            return val
                .toLowerCase()
                .normalize('NFD').replace(/[̀-ͯ]/g, '')
                .replace(/[^a-z0-9_-]/g, '-')
                .replace(/-{2,}/g, '-')
                .slice(0, 64);
        },

        slugify(val) {
            return this.sanitizeRoute(val).replace(/^[-_]+|[-_]+$/g, '');
        },

        validateRoute() {
            const r = this.slugify(this.orgForm.route);
            if (r.length < 3) {
                this.formValidation = { ...this.formValidation, route: { type: 'error', text: i18n.t('pages.organization.create.validation.route_min') } };
                this.enableToCreateOrg = false;
                return;
            }
            this.formValidation = { ...this.formValidation, route: { type: 'success', text: i18n.t('pages.organization.create.validation.route_available') } };
            this.enableToCreateOrg = this.orgForm.name.trim().length >= 2;
        },

        async executeAction() {
            if (!this.enableToCreateOrg) return;

            this.formValidation = {};
            this.isLoading = true;
            this.loadingText = i18n.t('pages.organization.create.loading.creating');

            const response = await Organization.create({
                ...this.orgForm,
                route: this.slugify(this.orgForm.route),
            });

            if (response.created) {
                this.loadingText = i18n.t('pages.organization.create.loading.created', { name: this.orgForm.name });
                setTimeout(() => router.push(`/org/${this.slugify(this.orgForm.route)}/manage`), 1200);
            } else {
                this.isLoading = false;
                if (response.errors) {
                    for (const [key, value] of Object.entries(response.errors))
                        this.formValidation[key] = { type: 'error', text: Array.isArray(value) ? value[0] : value };
                } else {
                    this.formValidation.general = response.message || i18n.t('pages.organization.create.loading.error');
                }
            }
        },
    },
};
</script>

<style scoped>
.fade-title-enter-active,
.fade-title-leave-active {
    transition: opacity 0.2s ease;
}
.fade-title-enter-from,
.fade-title-leave-to {
    opacity: 0;
}
</style>
