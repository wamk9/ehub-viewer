<template>
    <div v-if="show" class="event-manage">

        <!-- Header -->
        <div class="gen-header mb-4">
            <button class="gen-back" @click="goBack">
                <font-awesome-icon :icon="['fas', 'arrow-left']" />
                {{ $t('events.manage.menu.title') }}
            </button>
            <h2 class="gen-title">{{ eventToManage.name || '&nbsp;' }}</h2>
            <div></div>
        </div>

        <!-- Tabs -->
        <ul class="nav nav-tabs gen-tabs mb-4">
            <li v-for="(option, index) in options" :key="index" class="nav-item">
                <button
                    class="nav-link"
                    :class="[
                        { active: option[getOptionAction(index)].active },
                        getOptionAction(index) === 'remove' ? 'gen-tab--danger' : ''
                    ]"
                    @click="goToOption(getOptionAction(index), true)"
                >
                    <font-awesome-icon
                        v-if="getOptionAction(index) === 'remove'"
                        :icon="['fas', 'trash']"
                        class="me-1"
                    />
                    {{ $t(`events.manage.menu.${getOptionAction(index)}.title`) }}
                </button>
            </li>
        </ul>

        <!-- Tab content -->
        <eventGeneralInfo :show="checkOptionIsActive('general')" :event="eventToManage" />
        <eventStagesIndex  :show="checkOptionIsActive('stages')"  :event="eventToManage" />
        <eventNotifications :show="checkOptionIsActive('notifications')" :event="eventToManage" />
        <eventNews :show="checkOptionIsActive('news')" :event="eventToManage" :orgRoute="route.params.orgRoute" />
        <eventParticipants :show="checkOptionIsActive('participants')" :event="eventToManage" :orgRoute="route.params.orgRoute" />

        <div v-if="checkOptionIsActive('remove')" class="gen-section gen-section--danger">
            <h6 class="gen-section__title gen-section__title--danger">
                {{ $t('events.manage.menu.remove.title') }}
            </h6>
            <div class="alert alert-warning d-flex align-items-center gap-2 mb-4 small">
                <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="flex-shrink-0" />
                {{ $t('events.manage.menu.remove.description') }}
            </div>
            <div class="d-flex gap-2">
                <button class="btn btn-danger" :disabled="removing" @click="removeEvent">
                    <span v-if="removing" class="spinner-border spinner-border-sm me-1"></span>
                    <font-awesome-icon v-else :icon="['fas', 'trash']" class="me-1" />
                    {{ $t('events.manage.menu.remove.title') }}
                </button>
            </div>
        </div>

        <!-- No option selected message -->
        <div v-if="!ActiveOptionKey" class="gen-section text-center py-4">
            <p class="text-muted mb-0">
                {{ $t('events.manage.menu.message', { eventName: eventToManage.name }) }}
            </p>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import eventStagesIndex from './event-stages/index.vue'
import eventGeneralInfo from './general.vue'
import eventNotifications from './notifications.vue'
import eventNews from './event-news.vue'
import eventParticipants from './event-participants.vue'
import { i18n } from '@/helpers/i18n'
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js'

const props = defineProps({
    event: { type: Object, default: () => ({}) },
    show: { type: Boolean, required: true },
    forceOption: { type: Array, default: () => [] }
})

const emit = defineEmits(['close'])

const route = useRoute()
const router = useRouter()

const eventToManage = ref({})
const removing = ref(false)

const options = ref([
    { general:       { active: false } },
    { stages:        { active: false } },
    { notifications: { active: false } },
    { participants:  { active: false } },
    { news:          { active: false } },
    { remove:        { active: false } },
])

const ActiveOptionKey = computed(() => {
    const active = options.value.find(o => Object.values(o)[0].active)
    return active ? Object.keys(active)[0] : null
})

function checkOptionIsActive(optkey) {
    return ActiveOptionKey.value === optkey
}

function getOptionAction(index) {
    if (index < 0 || index >= options.value.length) return null
    return Object.keys(options.value[index])[0] ?? null
}

function goToOption(action, needsRoute) {
    options.value = options.value.map(optionObj => {
        const key = Object.keys(optionObj)[0]
        return { [key]: { ...optionObj[key], active: action === key } }
    })

    if (needsRoute) {
        const baseName = route.name.split('-').slice(0, 3).join('-')
        router.push({
            name: `${baseName}-${action}`,
            params: {
                orgRoute:   route.params.orgRoute,
                eventRoute: route.params.eventRoute
            }
        })
    }
}

function goBack() {
    router.push({
        name: 'manage-organization-events',
        params: { orgRoute: route.params.orgRoute }
    })
    emit('close')
}

async function removeEvent() {
    removing.value = true
    const result = await OrganizationEvent.destroy(route.params.orgRoute, route.params.eventRoute)
    removing.value = false
    if (result.code === 200) goBack()
}

onMounted(() => {
    eventToManage.value = { ...props.event }
    const lastSegment = route.name.split('-').pop().toLowerCase()
    const validOptions = options.value.map(o => Object.keys(o)[0])
    if (validOptions.includes(lastSegment)) {
        goToOption(lastSegment, false)
    }
})

onBeforeUnmount(() => emit('close'))

watch(() => props.event, newEvent => {
    if (newEvent) eventToManage.value = { ...eventToManage.value, ...newEvent }
}, { immediate: true, deep: true })
</script>

<style scoped>
.event-manage { position: relative; }

/* ── Header ── */
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

/* ── Tabs ── */
.gen-tabs {
    border-bottom: 1px solid rgba(255,255,255,0.12);
    gap: 0.25rem;
}
.gen-tabs .nav-link {
    color: rgba(255,255,255,0.45);
    border: none;
    border-bottom: 2px solid transparent;
    padding: 0.55rem 1.1rem;
    font-size: 0.9rem;
    font-weight: 500;
    transition: color 0.15s, border-color 0.15s;
    background: none;
    border-radius: 0;
}
.gen-tabs .nav-link:hover {
    color: rgba(255,255,255,0.8);
    border-bottom-color: rgba(255,255,255,0.2);
}
.gen-tabs .nav-link.active {
    color: #fff;
    border-bottom-color: #4e8bff;
    background: none;
}
.gen-tab--danger { color: rgba(220,53,69,0.6) !important; }
.gen-tab--danger:hover {
    color: rgba(220,53,69,0.9) !important;
    border-bottom-color: rgba(220,53,69,0.4) !important;
}
.gen-tab--danger.active {
    color: #dc3545 !important;
    border-bottom-color: #dc3545 !important;
}

/* ── Sections ── */
.gen-section {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 1.4rem 1.6rem;
}
.gen-section--danger { border-color: rgba(220,53,69,0.3); }
.gen-section__title {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.35);
    margin-bottom: 1.1rem;
}
.gen-section__title--danger { color: rgba(220,53,69,0.7); }
</style>
