<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, onBeforeMount, useTemplateRef, onBeforeUpdate } from "vue";
import { useRoute, useRouter } from 'vue-router';
import ehubButton from '@/components/inputs/ehub-button.vue';
import ehubSocket from '@/helpers/communication/Socket.js';
import { i18n } from '@/helpers/i18n';
import ehubInput from '@/components/inputs/ehub-input.vue';
import ehubMultiInputs from '@/components/inputs/ehub-multi-inputs.vue';
import ehubProfileImage from '@/components/inputs/ehub-profile-image.vue';
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import Api from '@/helpers/communication/Connection.js';

const route = useRoute();
const router = useRouter();
const publishing = ref(false);
const publishError = ref('');

// props
const props = defineProps({
    forceOption: { type: Object, default: () => ({}) },
    show: { type: Boolean, default: false }
});

// data
const internalShow = ref(props.show)
const eventDataToPublish = ref({
    runMode: '',
    category: ''
});
const stepIndex = ref(0);
const stepPage = ref(0);
const newStepSetted = ref(false);
const apiCategories = ref([]);
const loadingCategories = ref(false);
const loadingForm = ref(false);
const formLoadError = ref('');
const refsValidation = useTemplateRef('inputRef');
const steps = ref([]);
const formSchemaId = ref(null);
const formSchemaUpdatedAt = ref(null);

// derived from selected category
const availableRunmodes = computed(() => {
    if (!eventDataToPublish.value.category) {
        const all = [];
        const seen = new Set();
        apiCategories.value.forEach(cat => {
            (cat.runmodes ?? []).forEach(rm => {
                if (!seen.has(rm.key)) { seen.add(rm.key); all.push(rm); }
            });
        });
        return all;
    }
    const cat = apiCategories.value.find(c => c.route === eventDataToPublish.value.category);
    return cat?.runmodes ?? [];
})

const actualStep = computed(() =>
    steps.value.find(x => x.step == stepIndex.value)?.form ?? { form: [], data: [] }
)

const i18nEventsPath = computed(() => {
    if (stepIndex.value == 2) { // Specific category step form
        return `categories.${eventDataToPublish.value.category}.${eventDataToPublish.value.runMode}.form`;
    } else { // others steps
        return `events.manage.create.step${stepIndex.value}.form`;
    }
});

function setActualStepContainerSize(sizes, offsets) {
    let classToFill = [];

    if (!!sizes) {
        Object.entries(sizes).forEach(([key, value]) => {
            classToFill.push(key == 'xs' ? `col-${value}` : `col-${key}-${value}`)
        });
    }

    if (!!offsets) {
        Object.entries(offsets).forEach(([key, value]) => {
            classToFill.push(key == 'xs' ? `offset-${value}` : `offset-${key}-${value}`)
        });
    }

    return classToFill.join(' ');
}

function goToPage(page) {
    if (page < 0) {
        if (stepPage.value > 0) {
            stepPage.value--;
        } else {
            stepIndex.value = Math.max(0, stepIndex.value - 1);
            stepPage.value = 0;
        }
    } else {
        let valid = true;
        refsValidation.value?.forEach((child) => {
            if (!child.forceValidate()) valid = false;
        });

        if (!valid) return;

        const stepData = actualStep.value?.data ?? [];
        const totalPages = stepData.length;

        if (page >= totalPages) {
            if (stepIndex.value >= 2) {
                // On last step — publish
            } else {
                stepIndex.value++;
            }
            stepPage.value = 0;
        } else {
            stepPage.value = page;
        }
    }
}

function hydrateRegex(form) {
    const walk = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(walk);
        const result = {};
        for (const key in obj) {
            if (key === 'regex' && typeof obj[key] === 'string') {
                try { result[key] = new RegExp(obj[key]); } catch { result[key] = /[\s\S]*/; }
            } else {
                result[key] = walk(obj[key]);
            }
        }
        return result;
    };
    return walk(form);
}

async function getBasicForm() {
    if (!eventDataToPublish.value.runMode || !eventDataToPublish.value.category) return;

    loadingForm.value = true;
    formLoadError.value = '';

    const result = await Api.getAsync(
        `/category/${eventDataToPublish.value.category}/event-form/${eventDataToPublish.value.runMode}`
    );

    loadingForm.value = false;

    if (result.code !== 200 || !result.response?.message) {
        formLoadError.value = 'Failed to load form. Please try again.';
        return;
    }

    const { basic, advanced, schema_id, schema_updated_at } = result.response.message;
    formSchemaId.value = schema_id ?? null;
    formSchemaUpdatedAt.value = schema_updated_at ?? null;

    steps.value = [
        { step: 1, form: { ...hydrateRegex(basic),    data: [] } },
        { step: 2, form: { ...hydrateRegex(advanced),  data: [] } },
    ];

    steps.value.forEach(s => { s.form.data = [...s.form.form]; });

    stepIndex.value = 1;
    stepPage.value = 0;
}

// watchs
watch(() => props.show, (newShow) => {
    internalShow.value = newShow
})


watch(stepIndex, () => {
    const stepObj = steps.value.find(x => x.step == stepIndex.value)?.form;
    if (stepObj) stepObj.data = [...stepObj.form];
    stepPage.value = 0;
}, { flush: 'sync' });

// lifecycle
onBeforeMount(() => {})

onMounted(async () => {
    loadingCategories.value = true;
    const result = await Api.getAsync('/category');
    loadingCategories.value = false;
    if (result.code === 200 && Array.isArray(result.response?.message)) {
        apiCategories.value = result.response.message;
    }
});

onBeforeUpdate(() => {
})

onBeforeUnmount(() => {
});

function extractFormValues(stepIndex) {
    const stepObj = steps.value.find(x => x.step == stepIndex)?.form;
    if (!stepObj) return {};

    const values = {};
    const allPages = stepObj.data ?? stepObj.form ?? [];

    allPages.forEach(page => {
        (page ?? []).forEach(container => {
            (container.inputs ?? []).forEach(input => {
                if (input.name && input.eventValue !== undefined) {
                    values[input.name] = input.eventValue;
                }
            });
        });
    });

    return values;
}

async function publishEvent() {
    publishError.value = '';
    publishing.value = true;

    const step1Values = extractFormValues(1);

    const payload = {
        name:              step1Values['event-name'] ?? '',
        route:             step1Values['event-endpoint'] ?? '',
        short_description: step1Values['event-short-description'] ?? '',
        description:       step1Values['event-description'] ?? '',
        currency:          step1Values['event-currency'] === 'free' ? 'brl' : (step1Values['event-currency'] ?? 'brl'),
        fee:               step1Values['event-currency'] === 'free' ? 0 : (parseFloat(step1Values['event-register-fee']) || 0),
        category:          eventDataToPublish.value.category,
        runmode:           eventDataToPublish.value.runMode,
        form_schema_id:    formSchemaId.value,
    };

    const result = await OrganizationEvent.store(route.params.orgRoute, payload);
    publishing.value = false;

    if (result.created) {
        router.push({
            name: 'manage-organization-events',
            params: { orgRoute: route.params.orgRoute }
        });
    } else {
        publishError.value = result.message ?? 'Error publishing event';
    }
}

// Before render...
//TODO: Use API to get categories and others process...
</script>

<template>
    <div v-if="show" class="event-create">

        <!-- Header -->
        <div class="gen-header mb-4">
            <button class="gen-back" @click="router.push({ name: 'manage-organization-events', params: { orgRoute: route.params.orgRoute } })">
                <font-awesome-icon :icon="['fas', 'arrow-left']" />
                {{ i18n.t('events.manage.menu.title') }}
            </button>
            <h2 class="gen-title">{{ i18n.t('events.manage.create.step0.title') }}</h2>
            <div></div>
        </div>

        <!-- Step 0: mode + category -->
        <div v-if="stepIndex == 0" class="gen-section mb-4">
            <h6 class="gen-section__title">{{ i18n.t('events.manage.create.step0.description') }}</h6>

            <!-- Category -->
            <div class="mb-3">
                <label class="gen-section__title" for="input-category">
                    {{ i18n.t(`${i18nEventsPath}.category.placeholder`) }}
                </label>
                <div v-if="loadingCategories" class="d-flex align-items-center gap-2 text-muted small">
                    <span class="spinner-border spinner-border-sm"></span>
                    Loading categories...
                </div>
                <select v-else id="input-category" class="form-select create-select"
                    v-model="eventDataToPublish.category"
                    @change="eventDataToPublish.runMode = ''">
                    <option value="" disabled hidden>{{ i18n.t(`${i18nEventsPath}.category.placeholder`) }}</option>
                    <option v-for="cat in apiCategories" :key="cat.id" :value="cat.route">
                        {{ i18n.te(`categories.names.${cat.route}`) ? i18n.t(`categories.names.${cat.route}`) : cat.name }}
                    </option>
                </select>
            </div>

            <!-- Run mode -->
            <div class="mb-4">
                <label class="gen-section__title" for="input-runmode">
                    {{ i18n.t(`${i18nEventsPath}.runmode.placeholder`) }}
                </label>
                <select id="input-runmode" class="form-select create-select"
                    v-model="eventDataToPublish.runMode"
                    :disabled="!eventDataToPublish.category || availableRunmodes.length === 0">
                    <option value="" disabled hidden>{{ i18n.t(`${i18nEventsPath}.runmode.placeholder`) }}</option>
                    <option v-for="rm in availableRunmodes" :key="rm.id" :value="rm.key">
                        {{ i18n.te(`categories.runmode.${rm.key}`) ? i18n.t(`categories.runmode.${rm.key}`) : rm.key }}
                    </option>
                </select>
            </div>

            <div v-if="eventDataToPublish.category == 'notfound'" class="alert alert-info">
                <p class="mb-2 fw-semibold">{{ i18n.t('events.manage.create.step0.suggestion.title') }}</p>
                <p class="mb-3 small">{{ i18n.t('events.manage.create.step0.suggestion.description') }}</p>
                <button class="btn btn-primary btn-sm">
                    {{ i18n.t('events.manage.create.step0.suggestion.call_action') }}
                </button>
            </div>
            <div v-if="formLoadError" class="alert alert-danger py-2 small mb-3">
                {{ formLoadError }}
            </div>

            <div v-else class="d-flex justify-content-end">
                <button class="btn btn-primary px-5"
                    :disabled="!eventDataToPublish.runMode || !eventDataToPublish.category || loadingForm"
                    @click="() => { getBasicForm() }">
                    <span v-if="loadingForm" class="spinner-border spinner-border-sm me-1"></span>
                    {{ i18n.t(`events.manage.create.step${stepIndex}.nextstep`) }}
                </button>
            </div>
        </div>

        <!-- Steps 1+ -->
        <div v-else-if="stepIndex > 0">
            <div class="gen-section mb-4">
                <h6 class="gen-section__title">
                    {{ i18n.t(`events.manage.create.step${stepIndex}.title`, {
                        type: i18n.t(`categories.names.${eventDataToPublish.category}`),
                        runMode: i18n.t(`categories.runmode.${eventDataToPublish.runMode}`)
                    }) }}
                </h6>
                <p class="text-muted small mb-0">{{ i18n.t(`events.manage.create.step${stepIndex}.description`) }}</p>
            </div>

        <div class="row text-start" v-if="actualStep.data?.[stepPage]?.length">
            <template v-for="(containerForm, containerIndex) in actualStep.data[stepPage]" :key="containerIndex">

                <div class="w-100 mb-3" v-if="containerForm.independentRow"></div>

                <div :class="setActualStepContainerSize(containerForm.sizes, containerForm.offsets)">
                    <template v-for="(inputForm, inputIndex) in containerForm.inputs" :key="inputIndex">
                        <h2 class="display-5" v-if="inputForm.type == 'title'">
                            {{
                                i18n.t(`${i18nEventsPath}.${inputForm.name}.title`,
                                    inputForm.eventValue)
                            }}
                        </h2>
                        <p class="text-muted" v-else-if="inputForm.type == 'description'">
                            {{
                                i18n.t(`${i18nEventsPath}.${inputForm.name}.description`,
                                    inputForm.eventValue)
                            }}
                        </p>
                        <hr class="mt-0 mb-3" v-else-if="inputForm.type == 'separator'" />

                        <label v-if="inputForm.hasLabel" :for="`input-${inputForm.name}`">
                            {{
                                i18n.t(`${i18nEventsPath}.${inputForm.name}.label`,
                                    inputForm.eventValue)
                            }}
                        </label>

                        <ehubProfileImage v-else-if="inputForm.type == 'image'" :id="`input-${inputForm.name}`"
                            v-model="inputForm.eventValue" ratio="1x1" :roundImage="true" />

                        <ehubInput v-else-if="inputForm.type == 'list'" :id="`input-${inputForm.name}`"
                            :name="inputForm.name"
                            :option="{ ...inputForm.inputValue, i18nPath: `${i18nEventsPath}.${inputForm.name}.values` }"
                            :placeholder="i18n.t(`${i18nEventsPath}.${inputForm.name}.placeholder`)" type="select"
                            class="w-100" v-model="inputForm.eventValue"
                            :validation="{ ...inputForm.validate, i18nPath: `${i18nEventsPath}.${inputForm.name}.validation` }"
                            ref="inputRef" />

                        <ehubInput v-else-if="inputForm.type == 'text'" :id="`input-${inputForm.name}`"
                            :name="inputForm.name"
                            :placeholder="i18n.t(`${i18nEventsPath}.${inputForm.name}.placeholder`)"
                            :type="inputForm.type" class="w-100" v-model="inputForm.eventValue"
                            :validation="{ ...inputForm.validate, i18nPath: `${i18nEventsPath}.${inputForm.name}.validation` }"
                            ref="inputRef" />

                        <ehubInput v-else-if="inputForm.type == 'number'" :id="`input-${inputForm.name}`"
                            :name="inputForm.name"
                            :placeholder="i18n.t(`${i18nEventsPath}.${inputForm.name}.placeholder`)"
                            :type="inputForm.type" class="w-100" v-model="inputForm.eventValue"
                            :validation="{ ...inputForm.validate, i18nPath: `${i18nEventsPath}.${inputForm.name}.validation` }"
                            ref="inputRef" />

                        <ehubInput v-else-if="inputForm.type == 'switch'" :id="`input-${inputForm.name}`"
                            :name="inputForm.name" :checkedLabel="i18n.t(`${i18nEventsPath}.${inputForm.name}.checked`)"
                            :uncheckedLabel="i18n.t(`${i18nEventsPath}.${inputForm.name}.unchecked`)"
                            :type="inputForm.type" class="w-100" v-model="inputForm.eventValue"
                            :validation="{ ...inputForm.validate, i18nPath: `${i18nEventsPath}.${inputForm.name}.validation` }"
                            ref="inputRef" />

                        <ehubInput v-else-if="inputForm.type == 'checkbox'" :id="`input-${inputForm.name}`"
                            :name="inputForm.name" :label="i18n.t(`${i18nEventsPath}.${inputForm.name}.label`)"
                            :type="inputForm.type" class="w-100" v-model="inputForm.eventValue"
                            :validation="{ ...inputForm.validate, i18nPath: `${i18nEventsPath}.${inputForm.name}.validation` }"
                            ref="inputRef" />

                        <ehubInput v-else-if="inputForm.type == 'color'" :id="`input-${inputForm.name}`"
                            :name="inputForm.name" :key="inputIndex"
                            :label="i18n.t(`${i18nEventsPath}.${inputForm.name}.label`)" :type="inputForm.type"
                            class="w-100" v-model="inputForm.eventValue"
                            :validation="{ ...inputForm.validate, i18nPath: `${i18nEventsPath}.${inputForm.name}.validation` }"
                            ref="inputRef" />

                        <ehubInput v-else-if="inputForm.type == 'textarea'" :id="`input-${inputForm.name}`"
                            :name="inputForm.name"
                            :placeholder="i18n.t(`${i18nEventsPath}.${inputForm.name}.placeholder`)"
                            :type="inputForm.type" class="w-100" v-model="inputForm.eventValue"
                            :validation="{ ...inputForm.validate, i18nPath: `${i18nEventsPath}.${inputForm.name}.validation` }"
                            ref="inputRef" />

                        <ehubMultiInputs v-else-if="inputForm.type == 'multitext'" :id="`input-${inputForm.name}`"
                            :name="inputForm.name" v-model="inputForm.eventValue" type="text"
                            :placeholder="i18n.t(`${i18nEventsPath}.${inputForm.name}.placeholder`)"
                            :validation="{ ...inputForm.validate, i18nPath: `${i18nEventsPath}.${inputForm.name}.validation` }"
                            ref="inputRef" />
                    </template>
                </div>
            </template>
        </div>

        <p v-if="publishError" class="text-danger mb-3">{{ publishError }}</p>

        <div class="d-flex justify-content-between align-items-center gen-section mt-4 py-3">
            <button class="btn btn-outline-secondary btn-sm" @click="() => { goToPage((stepPage - 1)) }">
                <font-awesome-icon :icon="['fas', 'arrow-left']" class="me-1" />
                {{ i18n.t('events.manage.create.step2.previouspage') }}
            </button>

            <p class="text-muted small mb-0" v-if="formSchemaUpdatedAt">
                {{ i18n.t('events.manage.create.step2.updated_form_advice', { date: i18n.d(formSchemaUpdatedAt, 'dateOnly') }) }}
            </p>

            <button v-if="stepIndex < 2 || stepPage < (actualStep.data?.length ?? 0) - 1" class="btn btn-primary btn-sm"
                @click="() => { goToPage((stepPage + 1)); }">
                {{ i18n.t('events.manage.create.step2.nextpage') }}
                <font-awesome-icon :icon="['fas', 'arrow-right']" class="ms-1" />
            </button>
            <button v-else class="btn btn-primary btn-sm" @click="() => { publishEvent(); }"
                :disabled="publishing">
                <span v-if="publishing" class="spinner-border spinner-border-sm me-1" role="status"></span>
                <font-awesome-icon v-else :icon="['fas', 'rocket']" class="me-1" />
                {{ i18n.t('events.manage.create.step2.publish') }}
            </button>
        </div>
        </div>
    </div>
</template>

<style scoped>
.event-create { position: relative; }

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
    transition: color 0.15s;
}
.gen-back:hover { color: rgba(255,255,255,0.9); }
.gen-title {
    text-align: center;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: rgba(255,255,255,0.92);
}
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
    margin-bottom: 0.5rem;
    display: block;
}
.create-select {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.88);
}
.create-select:focus {
    background: rgba(255,255,255,0.07);
    border-color: rgba(255,255,255,0.3);
    box-shadow: none;
    color: rgba(255,255,255,0.95);
}
.create-select:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}
.create-select option {
    background: #1a1a2e;
    color: rgba(255,255,255,0.88);
}
</style>
