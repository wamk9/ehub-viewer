<script setup>
import { ref, watch } from 'vue'
import ehubInput from '@/components/inputs/ehub-input.vue';
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import SystemVars from '@/helpers/General/SystemVars';
import { i18n } from '@/helpers/i18n';
import { useRoute } from 'vue-router';
import { toast } from '@/helpers/toast.js'

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
})

const logoPreview  = ref(null)
const logoBase64   = ref(null)
const coverPreview = ref(null)
const coverBase64  = ref(null)
const logoInput    = ref(null)
const coverInput   = ref(null)

const saving     = ref(false)

watch(() => props.event, (newEvent) => {
    if (newEvent) {
        form.value.name              = newEvent.name              ?? ''
        form.value.short_description = newEvent.short_description ?? ''
        form.value.description       = newEvent.description       ?? ''
        form.value.fee               = newEvent.fee               ?? 0
        form.value.currency          = newEvent.currency          ?? 'brl'
        form.value.max_registrations = newEvent.max_registrations ?? ''
        logoPreview.value  = newEvent.logo_image  ? SystemVars.baseUrl + 'storage/' + newEvent.logo_image  : null
        coverPreview.value = newEvent.cover_image ? SystemVars.baseUrl + 'storage/' + newEvent.cover_image : null
        logoBase64.value   = null
        coverBase64.value  = null
    }
}, { immediate: true, deep: true })

function pickLogo(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
        logoBase64.value  = ev.target.result
        logoPreview.value = ev.target.result
    }
    reader.readAsDataURL(file)
    e.target.value = ''
}

function pickCover(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
        coverBase64.value  = ev.target.result
        coverPreview.value = ev.target.result
    }
    reader.readAsDataURL(file)
    e.target.value = ''
}

async function save() {
    saving.value = true

    const payload = { ...form.value }
    if (logoBase64.value)  payload.logo_image  = logoBase64.value
    if (coverBase64.value) payload.cover_image = coverBase64.value

    const result = await OrganizationEvent.update(
        route.params.orgRoute,
        route.params.eventRoute,
        payload
    )

    saving.value = false

    if (result.code === 200) {
        toast.success(i18n.t('events.manage.general.success'))
        logoBase64.value  = null
        coverBase64.value = null
    } else {
        toast.error(result.data ?? i18n.t('events.manage.general.error'))
    }
}
</script>

<template>
    <div v-if="show">

        <!-- Images -->
        <div class="gen-section mb-4">
            <h6 class="gen-section__title">{{ $t('events.manage.create.step2.sections.images') }}</h6>
            <div class="row g-4">
                <!-- Logo 1:1 -->
                <div class="col-12 col-md-4">
                    <label class="gen-label">{{ $t('events.manage.create.step2.form.logo.label') }}</label>
                    <p class="field-hint mb-2">{{ $t('events.manage.create.step2.form.logo.help') }}</p>
                    <div class="img-upload img-upload--square" @click="logoInput.click()">
                        <img v-if="logoPreview" :src="logoPreview" class="img-upload__preview" />
                        <div v-else class="img-upload__empty">
                            <font-awesome-icon :icon="['fas', 'image']" class="mb-1" />
                            <span>logo.webp</span>
                        </div>
                    </div>
                    <input ref="logoInput" type="file" accept="image/*" class="d-none" @change="pickLogo" />
                </div>

                <!-- Cover 16:9 -->
                <div class="col-12 col-md-8">
                    <label class="gen-label">{{ $t('events.manage.create.step2.form.cover.label') }}</label>
                    <p class="field-hint mb-2">{{ $t('events.manage.create.step2.form.cover.help') }}</p>
                    <div class="img-upload img-upload--cover" @click="coverInput.click()">
                        <img v-if="coverPreview" :src="coverPreview" class="img-upload__preview" />
                        <div v-else class="img-upload__empty">
                            <font-awesome-icon :icon="['fas', 'image']" class="mb-1" />
                            <span>preview.webp · 16:9</span>
                        </div>
                    </div>
                    <input ref="coverInput" type="file" accept="image/*" class="d-none" @change="pickCover" />
                </div>
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
.field-hint {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.35);
    margin-bottom: 0.35rem;
}
.img-upload {
    border: 2px dashed rgba(255,255,255,0.15);
    border-radius: 10px;
    cursor: pointer;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.15s;
}
.img-upload:hover { border-color: rgba(255,255,255,0.35); }
.img-upload--square { width: 100%; aspect-ratio: 1/1; max-width: 200px; }
.img-upload--cover  { width: 100%; aspect-ratio: 16/9; }
.img-upload__preview { width: 100%; height: 100%; object-fit: cover; }
.img-upload__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    color: rgba(255,255,255,0.25);
    font-size: 0.8rem;
}
.gen-select {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.88);
}
.gen-select:focus { box-shadow: none; border-color: rgba(255,255,255,0.3); }
</style>
