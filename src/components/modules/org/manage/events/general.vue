<script setup>
import { ref, watch } from 'vue'
import ehubInput from '@/components/inputs/ehub-input.vue';
import AvatarUpload from '@/components/inputs/AvatarUpload.vue';
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import SystemVars from '@/helpers/General/SystemVars';
import { i18n } from '@/helpers/i18n';
import { useRoute } from 'vue-router';

const route = useRoute();

const props = defineProps({
    show: { type: Boolean, required: true },
    event: { type: Object, default: null }
})

const form = ref({
    name: '',
    short_description: '',
    description: '',
    fee: 0,
    currency: 'brl',
    max_registrations: '',
    image: '',
})

const saving = ref(false)
const saveError = ref(null)
const saveSuccess = ref(false)

watch(() => props.event, (newEvent) => {
    if (newEvent) {
        form.value.name              = newEvent.name              ?? ''
        form.value.short_description = newEvent.short_description ?? ''
        form.value.description       = newEvent.description       ?? ''
        form.value.fee               = newEvent.fee               ?? 0
        form.value.currency          = newEvent.currency          ?? 'brl'
        form.value.max_registrations = newEvent.max_registrations ?? ''
        form.value.image             = newEvent.image
            ? SystemVars.baseUrl + 'storage/' + newEvent.image
            : ''
    }
}, { immediate: true, deep: true })

async function save() {
    saveError.value = null
    saveSuccess.value = false
    saving.value = true

    const payload = { ...form.value }
    if (!payload.image?.startsWith('data:')) delete payload.image

    const result = await OrganizationEvent.update(
        route.params.orgRoute,
        route.params.eventRoute,
        payload
    )

    saving.value = false

    if (result.code === 200) {
        saveSuccess.value = true
    } else {
        saveError.value = result.data ?? i18n.t('events.manage.general.error')
    }
}
</script>

<template>
    <div v-if="show">

        <div v-if="saveError" class="alert alert-danger mb-4">{{ saveError }}</div>
        <div v-if="saveSuccess" class="alert alert-success mb-4">{{ $t('events.manage.general.success') }}</div>

        <!-- Cover image -->
        <div class="gen-section mb-4">
            <h6 class="gen-section__title">{{ $t('events.manage.general.sections.cover') }}</h6>
            <div class="cover-upload-wrap">
                <AvatarUpload
                    v-model="form.image"
                    :buttonLabel="$t('events.manage.general.cover_upload')"
                    :dropLabel="$t('events.manage.general.cover_drop')"
                    fallbackType="event"
                    :initialsSize="100"
                />
            </div>
            <div class="alert alert-info d-flex align-items-center gap-2 mt-3 mb-0 py-2 small">
                <font-awesome-icon :icon="['fas', 'circle-info']" class="flex-shrink-0" />
                {{ $t('events.manage.general.cover_hint') }}
            </div>
        </div>

        <!-- Basic info -->
        <div class="gen-section mb-4">
            <h6 class="gen-section__title">{{ $t('events.manage.general.sections.basic') }}</h6>
            <div class="row g-3">
                <div class="col-12">
                    <label class="gen-label">{{ $t('events.manage.general.fields.name') }}</label>
                    <ehubInput id="event-name" v-model="form.name" type="text"
                        :placeholder="$t('events.manage.general.placeholders.name')" />
                </div>
                <div class="col-12">
                    <label class="gen-label">{{ $t('events.manage.general.fields.short_description') }}</label>
                    <ehubInput id="event-short-desc" v-model="form.short_description" type="text"
                        :placeholder="$t('events.manage.general.placeholders.short_description')" />
                </div>
                <div class="col-12">
                    <label class="gen-label">{{ $t('events.manage.general.fields.description') }}</label>
                    <ehubInput id="event-desc" v-model="form.description" type="textarea"
                        :placeholder="$t('events.manage.general.placeholders.description')" />
                </div>
            </div>
        </div>

        <!-- Registration settings -->
        <div class="gen-section mb-4">
            <h6 class="gen-section__title">{{ $t('events.manage.general.sections.registration') }}</h6>
            <div class="row g-3">
                <div class="col-12 col-md-4">
                    <label class="gen-label">{{ $t('events.manage.general.fields.currency') }}</label>
                    <select class="form-select form-select-sm gen-select" v-model="form.currency">
                        <option value="brl">BRL (R$)</option>
                        <option value="usd">USD (US$)</option>
                        <option value="eur">EUR (€)</option>
                    </select>
                </div>
                <div class="col-12 col-md-4">
                    <label class="gen-label">{{ $t('events.manage.general.fields.fee') }}</label>
                    <ehubInput id="event-fee" v-model="form.fee" type="number"
                        :placeholder="$t('events.manage.general.placeholders.fee')" />
                </div>
                <div class="col-12 col-md-4">
                    <label class="gen-label">{{ $t('events.manage.general.fields.max_registrations') }}</label>
                    <ehubInput id="event-max" v-model="form.max_registrations" type="number"
                        :placeholder="$t('events.manage.general.placeholders.max_registrations')" />
                </div>
            </div>
        </div>

        <div class="d-flex justify-content-end">
            <button class="btn btn-primary px-5" @click="save" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                {{ $t('events.manage.general.save') }}
            </button>
        </div>

    </div>
</template>

<style scoped>
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
    margin-bottom: 1.1rem;
}
.gen-label {
    display: block;
    font-size: 0.85rem;
    font-weight: 500;
    margin-bottom: 0.35rem;
    color: rgba(255,255,255,0.75);
}
.cover-upload-wrap { display: flex; justify-content: center; }
.gen-select {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.88);
}
.gen-select:focus { box-shadow: none; border-color: rgba(255,255,255,0.3); }
</style>
