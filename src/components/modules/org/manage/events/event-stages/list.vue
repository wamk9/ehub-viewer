<template>
    <div class="stages-manage">

        <!-- List view -->
        <div v-if="view === 'list'">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <p class="text-muted mb-0 small">
                    {{ stages.length }}
                    {{ stages.length !== 1 ? $t('events.manage.menu.stages.manage.stage_plural') : $t('events.manage.menu.stages.manage.stage_singular') }}
                </p>
                <button class="btn btn-primary btn-sm" @click="openCreate" :disabled="eventInitialized">
                    <font-awesome-icon :icon="['fas', 'plus']" class="me-1" />
                    {{ $t('events.manage.menu.stages.manage.new_stage') }}
                </button>
            </div>

            <div v-if="stages.length === 0" class="text-center py-5">
                <font-awesome-icon :icon="['fas', 'flag-checkered']" class="mb-3 text-muted" style="font-size:2.5rem" />
                <p class="text-muted">{{ $t('events.manage.menu.stages.manage.empty') }}</p>
                <button v-if="!eventInitialized" class="btn btn-primary btn-sm" @click="openCreate">
                    {{ $t('events.manage.menu.stages.manage.create_first') }}
                </button>
            </div>

            <div v-else class="stage-list">
                <div v-for="(stage, index) in stages" :key="stage.id" class="stage-row">
                    <div class="stage-row__order">{{ stage.stage_order }}</div>
                    <div v-if="stage.preview_image" class="stage-row__thumb">
                        <img :src="SystemVars.baseUrl + 'storage/' + stage.preview_image" :alt="stage.name" />
                    </div>
                    <div class="stage-row__body">
                        <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                            <span class="badge" :class="stageTypeBadge(stage).class">{{ stageTypeBadge(stage).label }}</span>
                            <span class="badge" :class="stageStatusBadge(stage).class">{{ stageStatusBadge(stage).label }}</span>
                            <span v-if="stage.start_at" class="text-muted small">{{ formatDate(stage.start_at) }}</span>
                        </div>
                        <h5 class="stage-row__name mb-0">{{ stage.name }}</h5>
                        <p v-if="stage.description" class="text-muted small mb-0 mt-1 stage-row__desc">{{ stage.description }}</p>
                    </div>
                    <div class="stage-row__actions">
                        <button v-if="stage.finished" class="btn btn-sm btn-outline-light" disabled>
                            <font-awesome-icon :icon="['fas', 'trophy']" />
                        </button>
                        <button v-else-if="canManage(index)" class="btn btn-sm btn-outline-light" @click="openManage(stage)">
                            <font-awesome-icon :icon="['fas', 'play']" />
                        </button>
                        <button v-if="canEdit(stage)" class="btn btn-sm btn-outline-light" @click="openEdit(stage)">
                            <font-awesome-icon :icon="['fas', 'pen']" />
                        </button>
                        <button v-if="canDelete(stage)" class="btn btn-sm btn-outline-danger" @click="confirmDelete(stage)">
                            <font-awesome-icon :icon="['fas', 'trash']" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Form view -->
        <div v-else-if="view === 'form'" class="stage-form">

            <!-- Basic info -->
            <div class="gen-section mb-4">
                <h6 class="gen-section__label">{{ $t('events.manage.menu.stages.manage.form.section_basic') }}</h6>
                <div class="row g-3">
                    <div class="col-12 col-md-6">
                        <label class="form-label text-muted small">{{ $t('events.manage.menu.stages.manage.form.name_label') }}</label>
                        <input v-model="form.name" type="text" class="form-control form-control-dark"
                            :placeholder="$t('events.manage.menu.stages.manage.form.name_placeholder')" />
                    </div>
                    <div class="col-12 col-md-6">
                        <label class="form-label text-muted small">{{ $t('events.manage.menu.stages.manage.form.date_label') }}</label>
                        <input v-model="form.start_at" type="datetime-local" class="form-control form-control-dark" />
                    </div>
                    <div class="col-12 col-md-6">
                        <label class="form-label text-muted small">{{ $t('events.manage.menu.stages.manage.form.route_label') }}</label>
                        <input v-model="form.route" type="text" class="form-control form-control-dark"
                            :placeholder="$t('events.manage.menu.stages.manage.form.route_placeholder')"
                            @input="routeManuallyEdited = true" />
                        <p class="form-hint">{{ $t('events.manage.menu.stages.manage.form.route_hint') }}</p>
                    </div>
                    <div class="col-12 col-md-6">
                        <label class="form-label text-muted small">{{ $t('events.manage.menu.stages.manage.form.preview_label') }}</label>
                        <div class="cover-upload" @click="imageInput?.click()">
                            <img v-if="form.preview_image_preview" :src="form.preview_image_preview" class="cover-upload__img" :alt="form.name" />
                            <div v-else class="cover-upload__placeholder">
                                <font-awesome-icon :icon="['fas', 'image']" />
                                <span>{{ $t('events.manage.menu.stages.manage.form.preview_hint') }}</span>
                            </div>
                        </div>
                        <input ref="imageInput" type="file" accept="image/*" class="d-none" @change="onImageUpload" />
                    </div>
                    <div class="col-12">
                        <label class="form-label text-muted small">{{ $t('events.manage.menu.stages.manage.form.description_label') }}</label>
                        <textarea v-model="form.description" class="form-control form-control-dark" rows="2"
                            :placeholder="$t('events.manage.menu.stages.manage.form.description_placeholder')"></textarea>
                    </div>
                </div>
            </div>

            <!-- Type selection -->
            <div class="gen-section mb-4">
                <h6 class="gen-section__label">{{ $t('events.manage.menu.stages.manage.form.section_type') }}</h6>
                <div class="d-flex gap-3 mb-4">
                    <button class="type-btn" :class="{ active: form.stage_type === 'points' }"
                        @click="form.stage_type = 'points'">
                        <font-awesome-icon :icon="['fas', 'list-ol']" class="me-2" />
                        {{ $t('events.manage.menu.stages.manage.type.points') }}
                    </button>
                    <button class="type-btn" :class="{ active: form.stage_type === 'bracket' }"
                        @click="form.stage_type = 'bracket'">
                        <font-awesome-icon :icon="['fas', 'sitemap']" class="me-2" />
                        {{ $t('events.manage.menu.stages.manage.type.bracket') }}
                    </button>
                </div>

                <!-- Points config -->
                <div v-if="form.stage_type === 'points'">
                    <p class="text-muted small mb-3">{{ $t('events.manage.menu.stages.manage.form.points_hint') }}</p>
                    <div class="d-flex gap-2 mb-3">
                        <button class="btn btn-sm btn-outline-light" @click="downloadPointsJson">
                            <font-awesome-icon :icon="['fas', 'download']" class="me-1" />
                            {{ $t('events.manage.menu.stages.manage.form.download_json') }}
                        </button>
                        <button class="btn btn-sm btn-outline-light" @click="openJsonUpload">
                            <font-awesome-icon :icon="['fas', 'upload']" class="me-1" />
                            {{ $t('events.manage.menu.stages.manage.form.import_json') }}
                        </button>
                        <input ref="jsonInput" type="file" accept="application/json" class="d-none" @change="onJsonUpload" />
                    </div>

                    <div v-if="jsonAlert.message" class="alert mb-3 small py-2"
                        :class="jsonAlert.success ? 'alert-success' : 'alert-danger'">
                        {{ jsonAlert.message }}
                    </div>

                    <div class="row g-3">
                        <div class="col-12 col-md-6">
                            <p class="text-muted small mb-2">{{ $t('events.manage.menu.stages.manage.form.points_by_position') }}</p>
                            <div class="points-table">
                                <div v-for="(pt, i) in form.config.points" :key="i" class="points-row">
                                    <span class="points-row__pos">{{ pt.position }}º</span>
                                    <input v-model.number="pt.value" type="number"
                                        class="form-control form-control-sm form-control-dark points-row__val"
                                        :class="{ 'text-danger': pt.value < 0 }" />
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-6">
                            <div class="d-flex align-items-center justify-content-between mb-2">
                                <p class="text-muted small mb-0">{{ $t('events.manage.menu.stages.manage.form.extra_points') }}</p>
                                <button class="btn btn-sm btn-outline-light" @click="addExtraPoint">
                                    <font-awesome-icon :icon="['fas', 'plus']" />
                                </button>
                            </div>
                            <div v-if="form.config.extra_points.length === 0" class="text-center text-muted small py-3">
                                {{ $t('events.manage.menu.stages.manage.form.no_extra_points') }}
                            </div>
                            <div v-for="(ep, i) in form.config.extra_points" :key="i" class="extra-point-row mb-2">
                                <input v-model="ep.name" type="text"
                                    class="form-control form-control-sm form-control-dark me-2"
                                    placeholder="Descrição" />
                                <input v-model.number="ep.value" type="number"
                                    class="form-control form-control-sm form-control-dark"
                                    style="width: 80px"
                                    :class="{ 'text-danger': ep.value < 0 }" />
                                <button class="btn btn-sm btn-outline-danger ms-2" @click="removeExtraPoint(i)">
                                    <font-awesome-icon :icon="['fas', 'times']" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bracket config -->
                <div v-else-if="form.stage_type === 'bracket'">
                    <label class="form-label text-muted small">{{ $t('events.manage.menu.stages.manage.form.bracket_variant_label') }}</label>
                    <select v-model="form.config.variant" class="form-select form-control-dark mb-3">
                        <option value="random">{{ $t('events.manage.menu.stages.manage.form.bracket_random') }}</option>
                        <option value="entry">{{ $t('events.manage.menu.stages.manage.form.bracket_entry') }}</option>
                        <option value="top-8">{{ $t('events.manage.menu.stages.manage.form.bracket_top', { n: 8 }) }}</option>
                        <option value="top-16">{{ $t('events.manage.menu.stages.manage.form.bracket_top', { n: 16 }) }}</option>
                        <option value="top-32">{{ $t('events.manage.menu.stages.manage.form.bracket_top', { n: 32 }) }}</option>
                        <option value="top-64">{{ $t('events.manage.menu.stages.manage.form.bracket_top', { n: 64 }) }}</option>
                    </select>

                    <div v-if="form.config.variant.startsWith('top')" class="mb-3">
                        <label class="form-label text-muted small">{{ $t('events.manage.menu.stages.manage.form.bracket_ref_label') }}</label>
                        <select v-model="form.config.reference_stage_id" class="form-select form-control-dark">
                            <option :value="null" disabled>{{ $t('events.manage.menu.stages.manage.form.bracket_ref_placeholder') }}</option>
                            <option v-for="s in pointsStages" :key="s.id" :value="s.id">{{ s.name }}</option>
                        </select>
                        <p v-if="pointsStages.length === 0" class="text-muted small mt-2">
                            {{ $t('events.manage.menu.stages.manage.form.bracket_ref_empty') }}
                        </p>
                    </div>

                    <p class="text-muted small mb-0">
                        <span v-if="form.config.variant === 'random'">{{ $t('events.manage.menu.stages.manage.form.bracket_desc_random') }}</span>
                        <span v-else-if="form.config.variant === 'entry'">{{ $t('events.manage.menu.stages.manage.form.bracket_desc_entry') }}</span>
                        <span v-else-if="form.config.variant.startsWith('top')">
                            {{ $t('events.manage.menu.stages.manage.form.bracket_desc_top', { n: form.config.variant.split('-')[1] }) }}
                        </span>
                    </p>
                </div>
            </div>

            <!-- Actions -->
            <div class="d-flex gap-2 justify-content-end">
                <button class="btn btn-outline-secondary" @click="view = 'list'" :disabled="saving">
                    {{ $t('events.manage.menu.stages.manage.form.cancel') }}
                </button>
                <button class="btn btn-primary" @click="save" :disabled="saving">
                    <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                    {{ editingStage ? $t('events.manage.menu.stages.manage.form.save') : $t('events.manage.menu.stages.manage.form.create') }}
                </button>
            </div>
        </div>

        <!-- Manage view -->
        <div v-else-if="view === 'manage' && managingStage" class="stage-manage-view">

            <!-- Header -->
            <div class="d-flex align-items-center gap-3 mb-4">
                <button class="btn btn-sm btn-outline-secondary" @click="view = 'list'">
                    <font-awesome-icon :icon="['fas', 'arrow-left']" class="me-1" />
                    {{ $t('events.manage.menu.stages.manage.manage_view.back') }}
                </button>
                <div>
                    <h5 class="mb-0">{{ managingStage.name }}</h5>
                    <div class="d-flex gap-2 mt-1">
                        <span class="badge" :class="stageTypeBadge(managingStage).class">{{ stageTypeBadge(managingStage).label }}</span>
                        <span class="badge" :class="stageStatusBadge(managingStage).class">{{ stageStatusBadge(managingStage).label }}</span>
                    </div>
                </div>
            </div>

            <!-- Stage control -->
            <div class="d-flex gap-2 mb-4" v-if="!managingStage.finished">
                <button v-if="!managingStage.initialized" class="btn btn-success btn-sm"
                    :disabled="controlLoading" @click="controlStage('start')">
                    <span v-if="controlLoading" class="spinner-border spinner-border-sm me-1"></span>
                    <font-awesome-icon v-else :icon="['fas', 'play']" class="me-1" />
                    {{ $t('events.manage.menu.stages.manage.manage_view.start_btn') }}
                </button>
                <button v-if="managingStage.in_progress" class="btn btn-warning btn-sm text-dark"
                    :disabled="controlLoading" @click="showFinishConfirm = true">
                    <font-awesome-icon :icon="['fas', 'flag-checkered']" class="me-1" />
                    {{ $t('events.manage.menu.stages.manage.manage_view.finish_btn') }}
                </button>
            </div>

            <!-- Loading -->
            <div v-if="loadingManage" class="text-center py-5">
                <div class="spinner-border text-light" style="width:1.5rem;height:1.5rem"></div>
            </div>

            <!-- Results table -->
            <div v-else class="gen-section mb-4">
                <div v-if="manageParticipants.length === 0" class="text-center py-4 text-muted small">
                    {{ $t('events.manage.menu.stages.manage.manage_view.no_participants') }}
                </div>
                <div v-else class="table-responsive">
                    <table class="manage-table">
                        <thead>
                            <tr>
                                <th>{{ $t('events.manage.menu.stages.manage.manage_view.col_position') }}</th>
                                <th>{{ $t('events.manage.menu.stages.manage.manage_view.col_participant') }}</th>
                                <th>{{ $t('events.manage.menu.stages.manage.manage_view.col_score') }}</th>
                                <th class="text-center">{{ $t('events.manage.menu.stages.manage.manage_view.col_qualified') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in manageResults" :key="row.registration_id">
                                <td>
                                    <input v-model.number="row.position" type="number" min="1"
                                        class="form-control form-control-sm form-control-dark pos-input"
                                        :disabled="managingStage.finished" />
                                </td>
                                <td class="participant-name">{{ row.userName }}</td>
                                <td>
                                    <input v-model.number="row.score" type="number" step="0.01"
                                        class="form-control form-control-sm form-control-dark score-input"
                                        :disabled="managingStage.finished" />
                                </td>
                                <td class="text-center">
                                    <input v-model="row.qualified" type="checkbox"
                                        class="form-check-input"
                                        :disabled="managingStage.finished" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Save -->
            <div v-if="!managingStage.finished && !loadingManage && manageParticipants.length > 0"
                class="d-flex justify-content-end">
                <button class="btn btn-primary" @click="saveManageResults" :disabled="savingResults">
                    <span v-if="savingResults" class="spinner-border spinner-border-sm me-1"></span>
                    {{ $t('events.manage.menu.stages.manage.manage_view.save_btn') }}
                </button>
            </div>

            <!-- Finish confirm -->
            <div v-if="showFinishConfirm" class="modal-overlay" @click.self="showFinishConfirm = false">
                <div class="modal-card">
                    <h5 class="mb-2">{{ $t('events.manage.menu.stages.manage.manage_view.confirm_finish_title') }}</h5>
                    <p class="text-muted mb-4">{{ $t('events.manage.menu.stages.manage.manage_view.confirm_finish_text') }}</p>
                    <div class="d-flex gap-2 justify-content-end">
                        <button class="btn btn-outline-secondary btn-sm" @click="showFinishConfirm = false">
                            {{ $t('events.manage.menu.stages.manage.manage_view.confirm_cancel') }}
                        </button>
                        <button class="btn btn-warning btn-sm text-dark" @click="controlStage('finish')" :disabled="controlLoading">
                            <span v-if="controlLoading" class="spinner-border spinner-border-sm me-1"></span>
                            {{ $t('events.manage.menu.stages.manage.manage_view.confirm_finish_btn') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete confirm overlay -->
        <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
            <div class="modal-card">
                <h5 class="mb-2">{{ $t('events.manage.menu.stages.manage.delete.title') }}</h5>
                <p class="text-muted mb-4">{{ $t('events.manage.menu.stages.manage.delete.confirm', { name: deleteTarget.name }) }}</p>
                <div class="d-flex gap-2 justify-content-end">
                    <button class="btn btn-outline-secondary btn-sm" @click="deleteTarget = null">
                        {{ $t('events.manage.menu.stages.manage.delete.cancel') }}
                    </button>
                    <button class="btn btn-danger btn-sm" @click="doDelete" :disabled="deleting">
                        <span v-if="deleting" class="spinner-border spinner-border-sm me-1"></span>
                        {{ $t('events.manage.menu.stages.manage.delete.btn') }}
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLiveSSE } from '@/helpers/communication/useLiveSSE.js'
import OrganizationEventStage from '@/helpers/communication/OrganizationEventStage.js'
import OrganizationEventRegistration from '@/helpers/communication/OrganizationEventRegistration.js'
import SystemVars from '@/helpers/General/SystemVars'
import { toast } from '@/helpers/toast.js'

const route = useRoute()
const { t } = useI18n()

const props = defineProps({
    event:    { type: Object, default: () => ({}) },
    orgRoute: { type: String, required: true },
})

// ── State ──────────────────────────────────────────────────────────
const eventData    = ref({ ...props.event })
const view         = ref('list')
const saving       = ref(false)
const deleting     = ref(false)
const editingStage = ref(null)
const deleteTarget = ref(null)
const jsonInput        = ref(null)
const imageInput       = ref(null)
const jsonAlert        = ref({ message: '', success: true })

// ── Manage view state ──────────────────────────────────────────────
const managingStage    = ref(null)
const manageParticipants = ref([])
const manageResults    = ref([])
const loadingManage    = ref(false)
const savingResults    = ref(false)
const controlLoading   = ref(false)
const showFinishConfirm    = ref(false)
const routeManuallyEdited  = ref(false)

const form = ref(emptyForm())

// ── Computed ───────────────────────────────────────────────────────
const stages           = computed(() => eventData.value?.stages ?? [])
const eventInitialized = computed(() => !!eventData.value?.initialized)
const eventRoute       = computed(() => route.params.eventRoute)

const pointsStages = computed(() =>
    stages.value.filter(s => s.stage_type === 'points' && s.id !== editingStage.value?.id)
)

// ── Helpers ────────────────────────────────────────────────────────
function emptyForm() {
    return {
        name: '',
        route: '',
        description: '',
        start_at: '',
        stage_type: 'points',
        preview_image: null,
        preview_image_preview: null,
        config: {
            points: defaultPoints(),
            extra_points: [],
            variant: 'random',
            reference_stage_id: null,
        },
    }
}

function slugify(str) {
    return str.toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

function defaultPoints() {
    return Array.from({ length: 21 }, (_, i) => ({ position: i + 1, value: 0 }))
}

function stageStatusBadge(stage) {
    if (stage.finished)    return { label: t('events.manage.menu.stages.manage.status.finished'),    class: 'bg-success' }
    if (stage.in_progress) return { label: t('events.manage.menu.stages.manage.status.in_progress'), class: 'bg-warning text-dark' }
    if (stage.initialized) return { label: t('events.manage.menu.stages.manage.status.started'),     class: 'bg-info text-dark' }
    return                        { label: t('events.manage.menu.stages.manage.status.pending'),      class: 'bg-secondary' }
}

function stageTypeBadge(stage) {
    if (stage.stage_type === 'points')  return { label: t('events.manage.menu.stages.manage.type.points'),  class: 'bg-primary' }
    if (stage.stage_type === 'bracket') return { label: t('events.manage.menu.stages.manage.type.bracket'), class: 'bg-info text-dark' }
    return                                     { label: stage.stage_type, class: 'bg-secondary' }
}

function canEdit(stage)   { return !eventInitialized.value && !stage.initialized }
function canDelete(stage) { return !eventInitialized.value && !stage.initialized }
function canManage(index) {
    if (!eventInitialized.value) return false
    const stage = stages.value[index]
    if (!stage || stage.finished) return false
    if (index === 0) return true
    return !!stages.value[index - 1]?.finished
}

function formatDate(dateStr) {
    if (!dateStr) return '–'
    return new Date(dateStr).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

function toDatetimeLocal(dateStr) {
    if (!dateStr) return ''
    const d   = new Date(dateStr)
    const pad = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ── Form actions ───────────────────────────────────────────────────
function openCreate() {
    editingStage.value = null
    routeManuallyEdited.value = false
    form.value = emptyForm()
    jsonAlert.value = { message: '', success: true }
    view.value = 'form'
}

function openEdit(stage) {
    editingStage.value = stage
    const cfg = JSON.parse(JSON.stringify(stage.config ?? {}))
    form.value = {
        name:                  stage.name ?? '',
        route:                 stage.route || slugify(stage.name ?? ''),
        description:           stage.description ?? '',
        start_at:              toDatetimeLocal(stage.start_at),
        stage_type:            ['points', 'bracket'].includes(stage.stage_type) ? stage.stage_type : 'points',
        preview_image:         null,
        preview_image_preview: stage.preview_image
            ? SystemVars.baseUrl + 'storage/' + stage.preview_image
            : null,
        config: {
            points:             cfg.points?.length ? cfg.points : defaultPoints(),
            extra_points:       cfg.extra_points ?? [],
            variant:            cfg.variant ?? 'random',
            reference_stage_id: cfg.reference_stage_id ?? null,
        },
    }
    routeManuallyEdited.value = !!stage.route
    jsonAlert.value = { message: '', success: true }
    view.value = 'form'
}

async function save() {
    if (!form.value.name?.trim()) {
        toast.error(t('events.manage.menu.stages.manage.form.name_required'))
        return
    }
    if (!form.value.route?.trim()) {
        toast.error(t('events.manage.menu.stages.manage.form.route_required'))
        return
    }
    if (!/^[a-z0-9-]+$/.test(form.value.route.trim())) {
        toast.error(t('events.manage.menu.stages.manage.form.route_invalid'))
        return
    }
    saving.value = true

    const config = form.value.stage_type === 'points'
        ? { points: form.value.config.points, extra_points: form.value.config.extra_points }
        : {
            variant: form.value.config.variant,
            reference_stage_id: form.value.config.variant.startsWith('top')
                ? form.value.config.reference_stage_id
                : null,
        }

    const payload = {
        name:        form.value.name.trim(),
        route:       form.value.route.trim(),
        description: form.value.description?.trim() || null,
        start_at:    form.value.start_at || null,
        stage_type:  form.value.stage_type,
        config,
    }

    if (form.value.preview_image) {
        payload.preview_image = form.value.preview_image
    }

    let result
    if (editingStage.value) {
        result = await OrganizationEventStage.update(props.orgRoute, eventRoute.value, editingStage.value.route ?? editingStage.value.id, payload)
    } else {
        result = await OrganizationEventStage.create(props.orgRoute, eventRoute.value, payload)
    }

    saving.value = false

    if (result.code === 200 || result.code === 201) {
        if (editingStage.value) {
            eventData.value.stages = eventData.value.stages.map(s =>
                s.id === editingStage.value.id ? { ...s, ...result.data } : s
            )
        } else {
            eventData.value.stages = [...(eventData.value.stages ?? []), result.data]
        }
        view.value = 'list'
    } else if (result.code === 409) {
        toast.error(t('events.manage.menu.stages.manage.form.route_in_use'))
    } else {
        toast.error(t('events.manage.menu.stages.manage.form.save_error'))
    }
}

function confirmDelete(stage) { deleteTarget.value = stage }

async function doDelete() {
    deleting.value = true
    const result = await OrganizationEventStage.remove(props.orgRoute, eventRoute.value, deleteTarget.value.route)
    deleting.value = false
    if (result.code === 200) {
        eventData.value.stages = eventData.value.stages.filter(s => s.id !== deleteTarget.value.id)
        deleteTarget.value = null
    }
}

// ── Points helpers ─────────────────────────────────────────────────
function addExtraPoint() {
    form.value.config.extra_points.push({ name: '', value: 0 })
}
function removeExtraPoint(index) {
    form.value.config.extra_points.splice(index, 1)
}
function downloadPointsJson() {
    const data = {
        points:       form.value.config.points,
        extra_points: form.value.config.extra_points,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${eventRoute.value}-stage-points.json`
    a.click()
    URL.revokeObjectURL(url)
}
function openJsonUpload() { jsonInput.value?.click() }
function onJsonUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
        try {
            const parsed = JSON.parse(ev.target.result)
            if (Array.isArray(parsed.points))       form.value.config.points       = parsed.points
            if (Array.isArray(parsed.extra_points)) form.value.config.extra_points = parsed.extra_points
            jsonAlert.value = { message: t('events.manage.menu.stages.manage.form.json_success'), success: true }
        } catch (err) {
            jsonAlert.value = { message: t('events.manage.menu.stages.manage.form.json_error', { error: err.message }), success: false }
        }
    }
    reader.readAsText(file)
    e.target.value = ''
}

// ── Manage view ────────────────────────────────────────────────────
async function openManage(stage) {
    managingStage.value = stage
    showFinishConfirm.value = false
    view.value = 'manage'
    loadingManage.value = true

    const result = await OrganizationEventRegistration.manage(props.orgRoute, eventRoute.value)
    loadingManage.value = false

    if (result.code === 200 && Array.isArray(result.data)) {
        const confirmed = result.data.filter(p => ['confirmed', 'free'].includes(p.payment_status))
        manageParticipants.value = confirmed
        manageResults.value = confirmed.map((p, idx) => {
            const existing = stage.results?.find(r => r.registration_id === p.id)
            return {
                registration_id: p.id,
                userName: p.user?.name || p.user?.username || '—',
                position: existing?.position ?? (idx + 1),
                score:    existing ? (existing.score ?? null) : null,
                qualified: existing?.qualified ?? false,
            }
        })
    } else {
        toast.error(t('events.manage.menu.stages.manage.manage_view.load_error'))
    }
}

async function controlStage(action) {
    controlLoading.value = true
    showFinishConfirm.value = false

    const result = await OrganizationEventStage.control(props.orgRoute, eventRoute.value, managingStage.value.route, action)
    controlLoading.value = false

    if (result.code === 200 && result.data) {
        managingStage.value = result.data
        eventData.value.stages = eventData.value.stages.map(s =>
            s.route === managingStage.value.route ? { ...s, ...result.data } : s
        )
        if (action === 'start')  toast.success(t('events.manage.menu.stages.manage.manage_view.start_success'))
        if (action === 'finish') toast.success(t('events.manage.menu.stages.manage.manage_view.finish_success'))
    } else {
        toast.error(t(`events.manage.menu.stages.manage.manage_view.${action}_error`))
    }
}

async function saveManageResults() {
    savingResults.value = true

    const results = manageResults.value.map(r => ({
        registration_id: r.registration_id,
        position:        r.position,
        score:           r.score ?? null,
        qualified:       r.qualified ?? false,
    }))

    const result = await OrganizationEventStage.setResults(props.orgRoute, eventRoute.value, managingStage.value.route, results)
    savingResults.value = false

    if (result.code === 200) {
        toast.success(t('events.manage.menu.stages.manage.manage_view.save_success'))
    } else {
        toast.error(t('events.manage.menu.stages.manage.manage_view.save_error'))
    }
}

// ── Image upload ───────────────────────────────────────────────────
function onImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
        form.value.preview_image         = ev.target.result
        form.value.preview_image_preview = ev.target.result
    }
    reader.readAsDataURL(file)
    e.target.value = ''
}

// auto-slug name → route when creating, stop if user manually edited route
watch(() => form.value.name, (newName) => {
    if (!editingStage.value && !routeManuallyEdited.value) {
        form.value.route = slugify(newName)
    }
})

// ── SSE ────────────────────────────────────────────────────────────
useLiveSSE(
    'event-stages',
    { orgRoute: props.orgRoute, eventRoute: route.params.eventRoute },
    (payload) => {
        if (!payload) return

        // Merge SSE status fields into full stage objects — never replace entire array
        const updatedStages = eventData.value.stages?.map(local => {
            const fresh = payload.stages?.find(s => s.id === local.id)
            if (!fresh) return local
            return { ...local, initialized: fresh.initialized, in_progress: fresh.in_progress, finished: fresh.finished, start_at: fresh.start_at }
        }) ?? eventData.value.stages

        if (managingStage.value) {
            const freshManaging = updatedStages?.find(s => s.id === managingStage.value.id)
            if (freshManaging) managingStage.value = freshManaging
        }

        eventData.value = { ...eventData.value, initialized: payload.initialized, finished: payload.finished, stages: updatedStages }
    }
)

watch(() => props.event, (newEvent) => {
    eventData.value = { ...newEvent }
}, { immediate: true })
</script>

<style scoped>
.stages-manage { position: relative; }

/* ── Stage list ── */
.stage-list  { display: flex; flex-direction: column; gap: 0.75rem; }
.stage-row   { display: flex; align-items: center; gap: 1rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 0.85rem 1rem; transition: background 0.15s; }
.stage-row:hover { background: rgba(255,255,255,0.07); }
.stage-row__order { flex-shrink: 0; width: 28px; height: 28px; background: rgba(255,255,255,0.08); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: rgba(255,255,255,0.5); }
.stage-row__body  { flex: 1; min-width: 0; }
.stage-row__name  { font-size: 0.95rem; font-weight: 600; color: rgba(255,255,255,0.9); }
.stage-row__desc  { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stage-row__actions { display: flex; gap: 0.4rem; flex-shrink: 0; }
.stage-row__thumb   { flex-shrink: 0; width: 60px; height: 34px; border-radius: 5px; overflow: hidden; background: rgba(255,255,255,0.06); }
.stage-row__thumb img { width: 100%; height: 100%; object-fit: cover; }

/* ── Form sections ── */
.gen-section        { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 1.25rem 1.4rem; }
.gen-section__label { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 1rem; }

/* ── Dark inputs ── */
.form-control-dark {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.88);
    border-radius: 6px;
}
.form-control-dark:focus {
    background: rgba(255,255,255,0.09);
    border-color: rgba(255,255,255,0.3);
    color: rgba(255,255,255,0.95);
    box-shadow: none;
}
.form-control-dark::placeholder { color: rgba(255,255,255,0.25); }

/* Fix: prevent select arrow SVG from tiling */
.form-select.form-control-dark {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='rgba(255,255,255,0.4)' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 16px 12px;
}

/* ── Type buttons ── */
.type-btn { flex: 1; max-width: 160px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.5); border-radius: 8px; padding: 0.65rem 1rem; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.15s; }
.type-btn:hover  { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); }
.type-btn.active { background: rgba(78,139,255,0.18); border-color: #4e8bff; color: #7eabff; }

/* ── Points table ── */
.points-table    { display: flex; flex-direction: column; gap: 0.3rem; max-height: 380px; overflow-y: auto; padding-right: 0.25rem; }
.points-row      { display: flex; align-items: center; gap: 0.5rem; }
.points-row__pos { width: 36px; text-align: right; font-size: 0.8rem; color: rgba(255,255,255,0.45); flex-shrink: 0; }
.points-row__val { flex: 1; }
.extra-point-row { display: flex; align-items: center; }

/* ── Form hints ── */
.form-hint { font-size: 0.7rem; color: rgba(255,255,255,0.3); margin-top: 0.3rem; margin-bottom: 0; }

/* ── Cover upload ── */
.cover-upload { position: relative; width: 100%; aspect-ratio: 16/9; border: 2px dashed rgba(255,255,255,0.15); border-radius: 8px; overflow: hidden; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: border-color 0.15s; max-height: 140px; }
.cover-upload:hover { border-color: rgba(255,255,255,0.35); }
.cover-upload__img { width: 100%; height: 100%; object-fit: cover; }
.cover-upload__placeholder { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; color: rgba(255,255,255,0.3); font-size: 0.75rem; }

/* ── Manage table ── */
.manage-table { width: 100%; border-collapse: collapse; }
.manage-table th { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: rgba(255,255,255,0.35); padding: 0.4rem 0.6rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
.manage-table td { padding: 0.45rem 0.6rem; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: middle; }
.manage-table tr:last-child td { border-bottom: none; }
.manage-table .pos-input   { width: 64px; text-align: center; }
.manage-table .score-input { width: 96px; }
.participant-name { color: rgba(255,255,255,0.85); font-size: 0.88rem; }

/* ── Delete overlay ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1050; }
.modal-card    { background: #1a1a2e; border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 1.75rem; max-width: 400px; width: 90%; color: rgba(255,255,255,0.88); }
</style>
