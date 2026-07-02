<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Event from '@/helpers/communication/Event.js'
import EhubEventCard from '@/components/EhubEventCard.vue'

// type → default Event method mapping
const TYPE_METHOD = {
  upcoming:       'feedUpcoming',
  latest:         'feedLatest',
  participating:  'feedParticipating',
  following_orgs: 'feedFollowingOrgs',
  following_teams:'feedFollowingTeams',
}

const props = defineProps({
  type:       { type: String, required: true },
  title:      { type: String, default: null },
  params:     { type: Object, default: () => ({}) },
  authMethod: { type: String, default: null }, // explicit override
})

const router = useRouter()
const { t } = useI18n()

const events  = ref([])
const loading = ref(true)

const sectionTitle = computed(() => props.title || t(`events.feed.${props.type}.title`))

const resolvedMethod = computed(() => props.authMethod || TYPE_METHOD[props.type] || 'feedUpcoming')

async function load() {
  loading.value = true
  const method = resolvedMethod.value
  const result = await Event[method](props.params)
  loading.value = false
  if (result.code === 200) events.value = result.data ?? []
}

onMounted(load)
watch(() => props.params, load, { deep: true })

function goToEvent(event) {
  router.push(`/org/${event.org_route}/event/${event.route}`)
}
</script>

<template>
  <section class="ef-section">
    <div class="ef-header">
      <h2 class="ef-title">{{ sectionTitle }}</h2>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="ef-track">
      <div v-for="i in 5" :key="i" class="skel ef-skel" :style="{ animationDelay: (i * 0.07) + 's' }"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="!events.length" class="ef-empty">
      <div class="ef-empty-card">
        <font-awesome-icon :icon="['fas', 'calendar-days']" />
        <span>{{ $t('events.feed.empty') }}</span>
      </div>
    </div>

    <!-- Cards -->
    <div v-else class="ef-track">
      <div
        v-for="event in events"
        :key="event.id"
        class="ef-card-wrap"
        @click="goToEvent(event)"
      >
        <EhubEventCard
          :event="event"
          :org-color="event.org_color"
          :org-name="event.org_name"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.ef-section {
  width: 100%;
  overflow: hidden;
}

.ef-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px 12px;
}

.ef-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ehub-ink);
  margin: 0;
}

.ef-track {
  display: flex;
  gap: 14px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 8px;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.ef-track::-webkit-scrollbar { display: none; }

.ef-card-wrap {
  flex: 0 0 300px;
  height: 360px;
  scroll-snap-align: start;
  cursor: pointer;
}

.ef-skel {
  flex: 0 0 300px;
  height: 360px;
  border-radius: 16px;
}

.ef-empty {
  display: flex;
  justify-content: flex-start;
  padding: 8px 4px;
}
.ef-empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  max-width: 300px;
  min-height: 340px;
  padding: 32px 20px;
  border: 1px dashed var(--ehub-line);
  border-radius: 16px;
  background: var(--ehub-field-bg);
  color: var(--ehub-muted);
  font-size: .88rem;
  text-align: center;
}
.ef-empty-card svg {
  font-size: 1.5rem;
  opacity: .5;
}
</style>
