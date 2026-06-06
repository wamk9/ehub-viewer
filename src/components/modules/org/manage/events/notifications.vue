<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { i18n } from '@/helpers/i18n';

const props = defineProps({
    show: { type: Boolean, required: true },
    event: { type: Object, required: true },
})

const eventNotifications = ref([])

function initNotifications() {
    // TODO: Call from API and enable Socket
    eventNotifications.value = [
        { type: 'Registration', description: 'User Carlos will participate in your event.', date: '2025-09-11T00:00:00Z' },
        { type: 'Registration', description: 'User Ana will participate in your event.',    date: '2025-09-12T00:00:00Z' },
    ]
}

function clearNotifications() {
    eventNotifications.value = []
}

watch(() => props.show, (val) => {
    val ? initNotifications() : clearNotifications()
}, { immediate: true })

onBeforeUnmount(clearNotifications)
</script>

<template>
    <div v-if="show">
        <div class="gen-section">
            <h6 class="gen-section__title">{{ $t('events.manage.menu.notifications.title') }}</h6>

            <div v-if="eventNotifications.length === 0" class="text-center py-4">
                <font-awesome-icon :icon="['fas', 'bell']" class="mb-2 text-muted" style="font-size:1.75rem" />
                <p class="text-muted mb-0 small">No notifications yet.</p>
            </div>

            <div v-else class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead>
                        <tr>
                            <th style="width:120px">Type</th>
                            <th>Description</th>
                            <th style="width:120px">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(n, idx) in eventNotifications" :key="idx">
                            <td>
                                <span class="badge bg-secondary">{{ n.type }}</span>
                            </td>
                            <td class="text-muted small">{{ n.description }}</td>
                            <td class="text-muted small">{{ i18n.d(n.date, 'short') }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
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
</style>
