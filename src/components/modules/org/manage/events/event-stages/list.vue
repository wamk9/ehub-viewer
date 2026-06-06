<script setup>
import { ref, computed, watch } from "vue";
import { useRoute } from 'vue-router';
import ehubButton from '@/components/inputs/ehub-button.vue';
import { useLivePoll } from '@/helpers/LivePoll.js';
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import manageEventStage from './manage.vue';
import removeEventStage from './remove.vue';
import saveEventStage from './save.vue';
import resultsEventStage from './results.vue';
const route = useRoute();

// props
const props = defineProps({
    event: { type: Object, default: () => ({}) }
});

// state
const eventData = ref({ ...props.event }); // initialize with prop
const stageData = ref({});
const creatingStage = ref(false);
const showManage = ref(false);
const showRemove = ref(false);
const showResults = ref(false);
const showSave = ref(false);

// computed
const stagesAvailable = computed(() =>
    eventData.value?.stages?.length > 0 ? eventData.value.stages : []
);
function manageEnabled(index) {
    if (eventData.value?.stages?.length < index) return false;

    const stage = eventData.value.stages[index];

    return ((index == 0 && !stage.finished) || (index > 0 && eventData.value.initialized && eventData.value?.stages[(index - 1)]?.finished));
}

const cardColClass = "col-12 col-md-12 col-lg-4 mb-4";

// methods
function SaveStage(item, creating = false) {
    if (eventData.value.initialized) return;
    stageData.value = item;
    creatingStage.value = creating;
    showSave.value = true;
}

function ResultsStage(item) {
    stageData.value = item;
    showResults.value = true;
}

function ManageStage(item) {
    stageData.value = item;
    showManage.value = true;
}

function RemoveStage(item) {
    if (eventData.value.initialized) return;
    stageData.value = item;
    showRemove.value = true;
}

// polling: refresh event stages every 10 seconds
async function fetchEvent() {
    const result = await OrganizationEvent.show(route.params.orgRoute, route.params.eventRoute);
    if (result.code === 200 && result.data) {
        eventData.value = { ...result.data };
    }
}

useLivePoll(fetchEvent, 10000);

// watch for updates from parent
watch(() => props.event, (newEvent) => {
    eventData.value = { ...newEvent };
}, { deep: true, immediate: true });
</script>

<template>
    <manageEventStage v-model:show="showManage" :stage="stageData" :eventInitialized="eventData.initialized" />
    <removeEventStage v-model:show="showRemove" :stage="stageData" />
    <saveEventStage v-model:show="showSave" :stage="stageData" :creating="creatingStage" />
    <resultsEventStage v-model:show="showResults" :stage="stageData" />

    <div class="col-12">
        <div class="d-flex mb-3 w-100">
            <ehubButton buttonClass="btn-primary w-100"
                containerClass="col-12 offset-md-6 col-md-6 offset-lg-9 col-lg-3" text="Create stage"
                @click="() => SaveStage(stageModel, true)" :disabled="eventData.initialized" />
        </div>

        <div v-if="stagesAvailable.length === 0" class="my-5">
            <p class="display-6">Ops! We don't found a event stage setted...</p>
        </div>

        <div class="row d-flex">
            <div v-for="(item, index) in stagesAvailable" :key="index" :class="cardColClass">
                <div class="card h-100">
                    <div class="ratio ratio-16x9">
                        <img class="card-img-top" :src="item.image" :alt="item.name">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">{{ item.name }}</h5>
                        <p class="mb-0">Start at: {{ item.startDateTime }}</p>
                        <p>Type: {{ item.type.id }}</p>
                    </div>
                    <div class="d-flex flex-row btn-group" role="group">
                        <button @click="() => SaveStage(item)" class="btn btn-primary"
                            :disabled="eventData.initialized">Edit</button>
                        <button v-if="!item.finished" @click="() => ManageStage(item)" class="btn btn-primary"
                            :disabled="!manageEnabled(index)">
                            Manage
                        </button>
                        <button v-if="item.finished" @click="() => ResultsStage(item)" class="btn btn-primary">
                            Results
                        </button>
                        <button @click="() => RemoveStage(item)" class="btn btn-danger"
                            :disabled="eventData.initialized">Remove</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
