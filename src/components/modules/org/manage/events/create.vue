<script setup>
import { ref, shallowRef, computed, watch, onMounted, onBeforeUnmount, nextTick, useTemplateRef } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import TiptapImage from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { i18n } from '@/helpers/i18n';
import Api from '@/helpers/communication/Connection.js';
import OrganizationEvent from '@/helpers/communication/OrganizationEvent.js';
import ehubInput from '@/components/inputs/ehub-input.vue';
import ehubMultiInputs from '@/components/inputs/ehub-multi-inputs.vue';

const route  = useRoute();
const router = useRouter();

const props = defineProps({
    forceOption: { type: Object, default: () => ({}) },
    show:        { type: Boolean, default: false },
});

// ─── Step ────────────────────────────────────────────────────────
const step = ref(1);

// ─── Step 1 ─ Category / Subcategory / Runmode ───────────────────
const categories         = ref([]);
const subcategories      = ref([]);
const loadingCategories  = ref(false);
const loadingSubcats     = ref(false);
const step1Error         = ref('');
const sel = ref({ category: '', subcategory: '', runmode: '' });

const availableRunmodes = computed(() => {
    if (!sel.value.category) return [];
    const cat = categories.value.find(c => c.route === sel.value.category);
    return cat?.runmodes ?? [];
});

const CATEGORY_ICONS = {
    'simracing':        ['fas', 'flag-checkered'],
    'esports-fps':      ['fas', 'crosshairs'],
    'esports-moba':     ['fas', 'dragon'],
    'esports-fighting': ['fas', 'hand-fist'],
    'esports-strategy': ['fas', 'chess-pawn'],
    'esports-sports':   ['fas', 'futbol'],
    'motorsport':       ['fas', 'car'],
    'motorbike':        ['fas', 'motorcycle'],
    'cycling':          ['fas', 'bicycle'],
    'running':          ['fas', 'person-running'],
    'swimming':         ['fas', 'person-swimming'],
    'triathlon':        ['fas', 'trophy'],
    'hiking':           ['fas', 'mountain-sun'],
    'crossfit':         ['fas', 'dumbbell'],
    'rowing':           ['fas', 'water'],
    'archery':          ['fas', 'bullseye'],
    'chess':            ['fas', 'chess-knight'],
    'drone-racing':     ['fas', 'helicopter'],
};

function categoryIcon(routeKey) {
    return CATEGORY_ICONS[routeKey] ?? ['fas', 'trophy'];
}

watch(() => sel.value.category, async (val) => {
    sel.value.subcategory = '';
    sel.value.runmode     = '';
    subcategories.value   = [];
    if (!val) return;

    const cat = categories.value.find(c => c.route === val);
    if (cat?.runmodes?.length === 1) {
        sel.value.runmode = cat.runmodes[0].key;
    }

    loadingSubcats.value  = true;
    const r = await Api.getAsync(`/category/${val}/subcategories`);
    loadingSubcats.value  = false;
    if (r.code === 200 && Array.isArray(r.response?.message))
        subcategories.value = r.response.message;
});

onMounted(async () => {
    loadingCategories.value = true;
    const r = await Api.getAsync('/category');
    loadingCategories.value = false;
    if (r.code === 200 && Array.isArray(r.response?.message))
        categories.value = r.response.message;
});

// ─── Step 2 ─ Basic fields ───────────────────────────────────────
const basic = ref({
    name:              '',
    route:             '',
    short_description: '',
    currency:          'free',
    fee:               '',
    max_registrations: '',
    start_at:          '',
    logo_preview:      null,
    logo_base64:       null,
    cover_preview:     null,
    cover_base64:      null,
});
const basicErrors   = ref({});
const nameAutoSlug  = ref(true);
const logoInput     = ref(null);
const coverInput    = ref(null);
const editor        = shallowRef(null);

watch(() => basic.value.name, (val) => {
    if (!nameAutoSlug.value) return;
    basic.value.route = val
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 60);
});

function initEditor(content = '') {
    editor.value?.destroy();
    editor.value = new Editor({
        content,
        extensions: [
            StarterKit,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TiptapImage,
            Youtube.configure({ controls: true }),
        ],
    });
}

onBeforeUnmount(() => editor.value?.destroy());

function pickLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        basic.value.logo_base64  = ev.target.result;
        basic.value.logo_preview = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
}

function pickCover(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        basic.value.cover_base64  = ev.target.result;
        basic.value.cover_preview = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
}

function validateBasic() {
    const e = {};
    if (!basic.value.name.trim() || basic.value.name.trim().length < 5) e.name = true;
    if (!/^[a-z0-9][a-z0-9\-]{2,59}$/.test(basic.value.route))         e.route = true;
    if (basic.value.currency !== 'free') {
        const f = parseFloat(basic.value.fee);
        if (isNaN(f) || f < 0) e.fee = true;
    }
    basicErrors.value = e;
    return Object.keys(e).length === 0;
}

// ─── Step 3 ─ Dynamic category form ─────────────────────────────
const formSchemaId      = ref(null);
const formSchemaDate    = ref(null);
const advancedForm      = ref({ form: [[]], data: [[]] });
const advancedPage      = ref(0);
const loadingForm       = ref(false);
const formLoadError     = ref('');
const advancedRefs      = useTemplateRef('advancedRef');

function hydrateRegex(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(hydrateRegex);
    const r = {};
    for (const k in obj) {
        if (k === 'regex' && typeof obj[k] === 'string') {
            try { r[k] = new RegExp(obj[k]); } catch { r[k] = /[\s\S]*/; }
        } else {
            r[k] = hydrateRegex(obj[k]);
        }
    }
    return r;
}

async function loadAdvancedForm() {
    loadingForm.value  = true;
    formLoadError.value = '';
    const sub = sel.value.subcategory ? `?subcategory=${sel.value.subcategory}` : '';
    const result = await Api.getAsync(
        `/category/${sel.value.category}/event-form/${sel.value.runmode}${sub}`
    );
    loadingForm.value = false;
    if (result.code !== 200) {
        formLoadError.value = i18n.t('events.manage.create.step3.load_error');
        return false;
    }
    const { advanced, schema_id, schema_updated_at } = result.response.message;
    formSchemaId.value   = schema_id ?? null;
    formSchemaDate.value = schema_updated_at ?? null;
    const hydrated = hydrateRegex(advanced);
    advancedForm.value = { ...hydrated, data: [...hydrated.form] };
    return true;
}

const advancedI18nPath = computed(() =>
    `categories.${sel.value.category}.${sel.value.runmode}.form`
);

function containerClass(sizes, offsets) {
    const c = [];
    if (sizes)   Object.entries(sizes).forEach(([k, v])   => c.push(k === 'xs' ? `col-${v}`    : `col-${k}-${v}`));
    if (offsets) Object.entries(offsets).forEach(([k, v]) => c.push(k === 'xs' ? `offset-${v}` : `offset-${k}-${v}`));
    return c.join(' ');
}

function extractAdvancedValues() {
    const values = {};
    (advancedForm.value.data ?? []).forEach(page => {
        (page ?? []).forEach(container => {
            (container.inputs ?? []).forEach(input => {
                if (input.name && input.eventValue !== undefined)
                    values[input.name] = input.eventValue;
            });
        });
    });
    return values;
}

// ─── Step 4 ─ Registration form builder ─────────────────────────
const regFields       = ref([]);
const addingField     = ref(false);
const editingIndex    = ref(null);
const fieldDraft      = ref({ type: 'text', label: '', required: false, values: '' });
const fieldDraftError = ref('');

const fieldTypes = ['text', 'number', 'select', 'switch', 'checkbox'];

function openAddField() {
    fieldDraft.value      = { type: 'text', label: '', required: false, values: '' };
    fieldDraftError.value = '';
    editingIndex.value    = null;
    addingField.value     = true;
}

function openEditField(index) {
    const f = regFields.value[index];
    fieldDraft.value      = { type: f.type, label: f.label, required: f.required, values: f.values.join(', ') };
    fieldDraftError.value = '';
    editingIndex.value    = index;
    addingField.value     = true;
}

function cancelField() {
    addingField.value  = false;
    editingIndex.value = null;
}

function commitField() {
    if (!fieldDraft.value.label?.trim()) {
        fieldDraftError.value = i18n.t('events.manage.create.step4.field.label_required');
        return;
    }
    const slug = fieldDraft.value.label
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const field = {
        type:     fieldDraft.value.type,
        name:     slug,
        label:    fieldDraft.value.label.trim(),
        required: fieldDraft.value.required,
        values:   fieldDraft.value.type === 'select'
            ? fieldDraft.value.values.split(',').map(v => v.trim()).filter(Boolean)
            : [],
    };

    if (editingIndex.value !== null) {
        regFields.value[editingIndex.value] = field;
    } else {
        regFields.value.push(field);
    }
    addingField.value  = false;
    editingIndex.value = null;
}

function removeField(index) {
    regFields.value.splice(index, 1);
}

function moveField(index, dir) {
    const target = index + dir;
    if (target < 0 || target >= regFields.value.length) return;
    [regFields.value[index], regFields.value[target]] = [regFields.value[target], regFields.value[index]];
}

// ─── Navigation ──────────────────────────────────────────────────
const publishing   = ref(false);
const publishError = ref('');

async function goNext() {
    publishError.value = '';

    if (step.value === 1) {
        step1Error.value = '';
        if (!sel.value.category || !sel.value.runmode) {
            step1Error.value = i18n.t('events.manage.create.step1.error_required');
            return;
        }
        const ok = await loadAdvancedForm();
        if (!ok) return;
        step.value = 2;
        nextTick(() => initEditor(''));

    } else if (step.value === 2) {
        if (!validateBasic()) return;
        step.value   = 3;
        advancedPage.value = 0;

    } else if (step.value === 3) {
        let valid = true;
        advancedRefs.value?.forEach(ref => {
            if (ref?.forceValidate && !ref.forceValidate()) valid = false;
        });
        if (!valid) return;

        const pages = advancedForm.value.data?.length ?? 0;
        if (advancedPage.value < pages - 1) {
            advancedPage.value++;
        } else {
            step.value = 4;
        }
    }
}

function goBack() {
    publishError.value = '';
    if (step.value === 3 && advancedPage.value > 0) {
        advancedPage.value--;
        return;
    }
    if (step.value > 1) step.value--;
}

async function publishEvent() {
    publishError.value = '';
    publishing.value   = true;

    const payload = {
        name:              basic.value.name.trim(),
        route:             basic.value.route.trim(),
        short_description: basic.value.short_description.trim(),
        description:       editor.value?.getHTML() ?? '',
        currency:          basic.value.currency === 'free' ? 'brl' : basic.value.currency,
        fee:               basic.value.currency === 'free' ? 0 : (parseFloat(basic.value.fee) || 0),
        max_registrations: basic.value.max_registrations ? parseInt(basic.value.max_registrations) : null,
        start_at:          basic.value.start_at || null,
        category:          sel.value.category,
        subcategory:       sel.value.subcategory || null,
        runmode:           sel.value.runmode,
        form_schema_id:    formSchemaId.value,
        event_data:        extractAdvancedValues(),
        registration_form_template: regFields.value,
    };

    if (basic.value.logo_base64)  payload.logo_image  = basic.value.logo_base64;
    if (basic.value.cover_base64) payload.cover_image = basic.value.cover_base64;

    const result = await OrganizationEvent.store(route.params.orgRoute, payload);
    publishing.value = false;

    if (result.created) {
        router.push({ name: 'manage-organization-events', params: { orgRoute: route.params.orgRoute } });
    } else {
        publishError.value = result.message ?? i18n.t('events.manage.create.publish_error');
    }
}
</script>

<template>
    <div v-if="show" class="event-create">

        <!-- Header -->
        <div class="gen-header mb-4">
            <button class="gen-back" @click="router.push({ name: 'manage-organization-events', params: { orgRoute: route.params.orgRoute } })">
                <font-awesome-icon :icon="['fas', 'arrow-left']" />
                {{ i18n.t('events.manage.menu.title') }}
            </button>
            <h2 class="gen-title">{{ i18n.t('events.manage.create.title') }}</h2>
            <div></div>
        </div>

        <!-- Breadcrumb -->
        <div class="step-breadcrumb mb-5">
            <div v-for="n in 4" :key="n" class="step-item" :class="{ active: step === n, done: step > n }">
                <div class="step-dot">
                    <font-awesome-icon v-if="step > n" :icon="['fas', 'check']" style="font-size:0.65rem" />
                    <span v-else>{{ n }}</span>
                </div>
                <span class="step-label">{{ i18n.t(`events.manage.create.breadcrumb.step${n}`) }}</span>
                <div v-if="n < 4" class="step-line"></div>
            </div>
        </div>

        <!-- ═══════════════════ STEP 1 ═══════════════════ -->
        <div v-if="step === 1" class="gen-section">
            <p class="step-description mb-4">{{ i18n.t('events.manage.create.step1.description') }}</p>

            <!-- Category grid -->
            <div class="field-group">
                <label class="field-label">{{ i18n.t('events.manage.create.step1.form.category.label') }}</label>
                <div v-if="loadingCategories" class="loading-row">
                    <span class="spinner-border spinner-border-sm"></span>
                    <span class="text-muted small ms-2">Carregando...</span>
                </div>
                <div v-else class="category-grid">
                    <div v-for="cat in categories" :key="cat.id"
                        class="category-card"
                        :class="{ 'category-card--selected': sel.category === cat.route }"
                        @click="sel.category = cat.route">
                        <font-awesome-icon :icon="categoryIcon(cat.route)" class="category-card__icon" />
                        <span class="category-card__name">{{ i18n.te(`categories.names.${cat.route}`) ? i18n.t(`categories.names.${cat.route}`) : cat.name }}</span>
                        <span class="category-card__tags">
                            <span v-for="rm in cat.runmodes" :key="rm.id"
                                class="category-tag"
                                :class="rm.key === 'online' ? 'category-tag--online' : 'category-tag--irl'">
                                {{ rm.key === 'online' ? 'Online' : 'IRL' }}
                            </span>
                        </span>
                    </div>
                </div>
            </div>

            <!-- Subcategory (when category selected) -->
            <div class="field-group" v-if="sel.category">
                <label class="field-label">{{ i18n.t('events.manage.create.step1.form.subcategory.label') }}</label>
                <div v-if="loadingSubcats" class="loading-row">
                    <span class="spinner-border spinner-border-sm"></span>
                    <span class="text-muted small ms-2">Carregando...</span>
                </div>
                <select v-else class="form-select ehub-select" v-model="sel.subcategory"
                    :disabled="subcategories.length === 0">
                    <option value="">
                        {{ subcategories.length === 0
                            ? i18n.t('events.manage.create.step1.form.subcategory.none')
                            : i18n.t('events.manage.create.step1.form.subcategory.placeholder') }}
                    </option>
                    <option v-for="sub in subcategories" :key="sub.id" :value="sub.route">
                        {{ i18n.te(`categories.subcategories.${sub.route}`) ? i18n.t(`categories.subcategories.${sub.route}`) : sub.name }}
                    </option>
                </select>
            </div>

            <!-- Runmode toggle — only shown when category has both IRL and Online -->
            <div class="field-group" v-if="sel.category && availableRunmodes.length > 1">
                <label class="field-label">{{ i18n.t('events.manage.create.step1.form.runmode.label') }}</label>
                <div class="runmode-toggle">
                    <button v-for="rm in availableRunmodes" :key="rm.id"
                        type="button"
                        class="runmode-btn"
                        :class="{
                            'runmode-btn--active': sel.runmode === rm.key,
                            'runmode-btn--irl':    rm.key === 'irl',
                            'runmode-btn--online': rm.key === 'online',
                        }"
                        @click="sel.runmode = rm.key">
                        <font-awesome-icon :icon="rm.key === 'irl' ? ['fas', 'location-dot'] : ['fas', 'globe']" class="me-2" />
                        {{ i18n.te(`categories.runmode.${rm.key}`) ? i18n.t(`categories.runmode.${rm.key}`) : rm.key }}
                    </button>
                </div>
            </div>

            <p v-if="step1Error" class="text-danger small mt-2 mb-0">{{ step1Error }}</p>
            <p v-if="formLoadError" class="text-danger small mt-2 mb-0">{{ formLoadError }}</p>

            <div class="d-flex justify-content-end mt-4">
                <button class="btn btn-primary px-5"
                    :disabled="!sel.category || !sel.runmode || loadingForm"
                    @click="goNext">
                    <span v-if="loadingForm" class="spinner-border spinner-border-sm me-2"></span>
                    {{ i18n.t('events.manage.create.step1.next') }}
                </button>
            </div>
        </div>

        <!-- ═══════════════════ STEP 2 ═══════════════════ -->
        <div v-else-if="step === 2">

            <div class="alert alert-help mb-4">
                <font-awesome-icon :icon="['fas', 'circle-info']" class="me-2" />
                {{ i18n.t('events.manage.create.step2.help') }}
            </div>

            <!-- Identidade -->
            <div class="gen-section mb-3">
                <p class="section-title">{{ i18n.t('events.manage.create.step2.sections.identity') }}</p>

                <div class="field-group">
                    <label class="field-label">{{ i18n.t('events.manage.create.step2.form.name.label') }}</label>
                    <input type="text" class="form-control ehub-input" v-model="basic.name"
                        :class="{ 'is-invalid': basicErrors.name }" maxlength="100" />
                    <div v-if="basicErrors.name" class="invalid-feedback">
                        {{ i18n.t('events.manage.create.step2.form.name.error') }}
                    </div>
                </div>

                <div class="field-group">
                    <label class="field-label">
                        {{ i18n.t('events.manage.create.step2.form.route.label') }}
                        <span v-if="nameAutoSlug" class="badge-auto ms-2">auto</span>
                    </label>
                    <div class="input-prefix-wrap">
                        <span class="input-prefix">/evento/</span>
                        <input type="text" class="form-control ehub-input with-prefix"
                            v-model="basic.route"
                            :class="{ 'is-invalid': basicErrors.route }"
                            @input="nameAutoSlug = false"
                            maxlength="60" />
                    </div>
                    <p class="field-hint">{{ i18n.t('events.manage.create.step2.form.route.help') }}</p>
                    <div v-if="basicErrors.route" class="text-danger small mt-1">
                        {{ i18n.t('events.manage.create.step2.form.route.error') }}
                    </div>
                </div>

                <div class="field-group">
                    <label class="field-label">{{ i18n.t('events.manage.create.step2.form.short_description.label') }}</label>
                    <p class="field-hint mb-1">{{ i18n.t('events.manage.create.step2.form.short_description.help') }}</p>
                    <textarea class="form-control ehub-input" v-model="basic.short_description"
                        rows="2" maxlength="180"></textarea>
                    <div class="text-end text-muted small mt-1">{{ (basic.short_description || '').length }}/180</div>
                </div>
            </div>

            <!-- Descrição -->
            <div class="gen-section mb-3">
                <p class="section-title">{{ i18n.t('events.manage.create.step2.sections.description') }}</p>
                <label class="field-label mb-2">{{ i18n.t('events.manage.create.step2.form.description.label') }}</label>

                <div class="editor-toolbar mb-1" v-if="editor">
                    <div class="toolbar-group">
                        <button :class="{ active: editor.isActive('bold') }"      @click="editor.chain().focus().toggleBold().run()"><b>B</b></button>
                        <button :class="{ active: editor.isActive('italic') }"    @click="editor.chain().focus().toggleItalic().run()"><i>I</i></button>
                        <button :class="{ active: editor.isActive('strike') }"    @click="editor.chain().focus().toggleStrike().run()"><s>S</s></button>
                    </div>
                    <div class="toolbar-sep"></div>
                    <div class="toolbar-group">
                        <button :class="{ active: editor.isActive('heading', { level: 2 }) }" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">H2</button>
                        <button :class="{ active: editor.isActive('heading', { level: 3 }) }" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">H3</button>
                    </div>
                    <div class="toolbar-sep"></div>
                    <div class="toolbar-group">
                        <button :class="{ active: editor.isActive({ textAlign: 'left' }) }"   @click="editor.chain().focus().setTextAlign('left').run()"><font-awesome-icon :icon="['fas', 'align-left']" /></button>
                        <button :class="{ active: editor.isActive({ textAlign: 'center' }) }" @click="editor.chain().focus().setTextAlign('center').run()"><font-awesome-icon :icon="['fas', 'align-center']" /></button>
                        <button :class="{ active: editor.isActive({ textAlign: 'right' }) }"  @click="editor.chain().focus().setTextAlign('right').run()"><font-awesome-icon :icon="['fas', 'align-right']" /></button>
                    </div>
                    <div class="toolbar-sep"></div>
                    <div class="toolbar-group">
                        <button :class="{ active: editor.isActive('bulletList') }"  @click="editor.chain().focus().toggleBulletList().run()"><font-awesome-icon :icon="['fas', 'list-ul']" /></button>
                        <button :class="{ active: editor.isActive('orderedList') }" @click="editor.chain().focus().toggleOrderedList().run()"><font-awesome-icon :icon="['fas', 'list-ol']" /></button>
                        <button :class="{ active: editor.isActive('blockquote') }"  @click="editor.chain().focus().toggleBlockquote().run()"><font-awesome-icon :icon="['fas', 'quote-left']" /></button>
                    </div>
                    <div class="toolbar-sep"></div>
                    <div class="toolbar-group">
                        <button @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()"><font-awesome-icon :icon="['fas', 'rotate-left']" /></button>
                        <button @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()"><font-awesome-icon :icon="['fas', 'rotate-right']" /></button>
                    </div>
                </div>
                <div class="editor-wrap">
                    <editor-content :editor="editor" />
                </div>
            </div>

            <!-- Inscrições -->
            <div class="gen-section mb-3">
                <p class="section-title">{{ i18n.t('events.manage.create.step2.sections.registrations') }}</p>

                <div class="row g-3">
                    <div class="col-12 col-md-4">
                        <div class="field-group mb-0">
                            <label class="field-label">{{ i18n.t('events.manage.create.step2.form.currency.label') }}</label>
                            <select class="form-select ehub-select" v-model="basic.currency">
                                <option v-for="(label, key) in { free: i18n.t('events.manage.create.step2.form.currency.options.free'), brl: i18n.t('events.manage.create.step2.form.currency.options.brl'), usd: i18n.t('events.manage.create.step2.form.currency.options.usd'), eur: i18n.t('events.manage.create.step2.form.currency.options.eur') }" :key="key" :value="key">
                                    {{ label }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <div class="col-12 col-md-4" v-if="basic.currency !== 'free'">
                        <div class="field-group mb-0">
                            <label class="field-label">{{ i18n.t('events.manage.create.step2.form.fee.label') }}</label>
                            <input type="number" class="form-control ehub-input"
                                :class="{ 'is-invalid': basicErrors.fee }"
                                v-model="basic.fee" min="0" step="0.01" />
                            <div v-if="basicErrors.fee" class="invalid-feedback">
                                {{ i18n.t('events.manage.create.step2.form.fee.error') }}
                            </div>
                        </div>
                    </div>

                    <div class="col-12 col-md-4">
                        <div class="field-group mb-0">
                            <label class="field-label">{{ i18n.t('events.manage.create.step2.form.max_registrations.label') }}</label>
                            <p class="field-hint mb-1">{{ i18n.t('events.manage.create.step2.form.max_registrations.help') }}</p>
                            <input type="number" class="form-control ehub-input" v-model="basic.max_registrations" min="1" />
                        </div>
                    </div>

                    <div class="col-12 col-md-6">
                        <div class="field-group mb-0">
                            <label class="field-label">{{ i18n.t('events.manage.create.step2.form.start_at.label') }}</label>
                            <input type="datetime-local" class="form-control ehub-input" v-model="basic.start_at" />
                            <small class="text-muted d-block mt-1">{{ i18n.t('events.manage.create.step2.form.start_at.help') }}</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Imagens -->
            <div class="gen-section mb-4">
                <p class="section-title">{{ i18n.t('events.manage.create.step2.sections.images') }}</p>

                <div class="row g-4">
                    <!-- Logo 1:1 -->
                    <div class="col-12 col-md-4">
                        <label class="field-label">{{ i18n.t('events.manage.create.step2.form.logo.label') }}</label>
                        <p class="field-hint mb-2">{{ i18n.t('events.manage.create.step2.form.logo.help') }}</p>
                        <div class="img-upload img-upload--square" @click="logoInput.click()">
                            <img v-if="basic.logo_preview" :src="basic.logo_preview" class="img-upload__preview" />
                            <div v-else class="img-upload__empty">
                                <font-awesome-icon :icon="['fas', 'image']" class="mb-1" />
                                <span>logo.webp</span>
                            </div>
                        </div>
                        <input ref="logoInput" type="file" accept="image/*" class="d-none" @change="pickLogo" />
                    </div>

                    <!-- Cover 16:9 -->
                    <div class="col-12 col-md-8">
                        <label class="field-label">{{ i18n.t('events.manage.create.step2.form.cover.label') }}</label>
                        <p class="field-hint mb-2">{{ i18n.t('events.manage.create.step2.form.cover.help') }}</p>
                        <div class="img-upload img-upload--cover" @click="coverInput.click()">
                            <img v-if="basic.cover_preview" :src="basic.cover_preview" class="img-upload__preview" />
                            <div v-else class="img-upload__empty">
                                <font-awesome-icon :icon="['fas', 'image']" class="mb-1" />
                                <span>preview.webp · 16:9</span>
                            </div>
                        </div>
                        <input ref="coverInput" type="file" accept="image/*" class="d-none" @change="pickCover" />
                    </div>
                </div>
            </div>

            <div class="nav-row">
                <button class="btn btn-outline-secondary" @click="goBack">
                    <font-awesome-icon :icon="['fas', 'arrow-left']" class="me-1" />
                    {{ i18n.t('events.manage.create.step2.back') }}
                </button>
                <button class="btn btn-primary px-5" @click="goNext">
                    {{ i18n.t('events.manage.create.step2.next') }}
                    <font-awesome-icon :icon="['fas', 'arrow-right']" class="ms-1" />
                </button>
            </div>
        </div>

        <!-- ═══════════════════ STEP 3 ═══════════════════ -->
        <div v-else-if="step === 3">

            <div class="gen-section mb-3">
                <p class="step-description mb-0">{{ i18n.t('events.manage.create.step3.description') }}</p>
            </div>

            <!-- Schema update date badge -->
            <div v-if="formSchemaDate" class="schema-date-badge mb-3">
                <font-awesome-icon :icon="['fas', 'clock-rotate-left']" class="me-2" style="opacity:0.6" />
                {{ i18n.t('events.manage.create.step3.advice', { date: i18n.d(formSchemaDate, 'dateOnly') }) }}
            </div>
            <div v-else-if="!formSchemaId" class="schema-date-badge schema-date-badge--warn mb-3">
                <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="me-2" />
                {{ i18n.t('events.manage.create.step3.no_schema') }}
            </div>

            <div class="gen-section mb-4">
                <div class="row text-start" v-if="advancedForm.data?.[advancedPage]?.length">
                    <template v-for="(container, ci) in advancedForm.data[advancedPage]" :key="ci">
                        <div class="w-100 mb-3" v-if="container.independentRow"></div>
                        <div :class="containerClass(container.sizes, container.offsets)">
                            <template v-for="(input, ii) in container.inputs" :key="ii">

                                <h2 class="display-5" v-if="input.type === 'title'">
                                    {{ i18n.te(`${advancedI18nPath}.${input.name}.title`) ? i18n.t(`${advancedI18nPath}.${input.name}.title`) : input.name }}
                                </h2>
                                <p class="text-muted" v-else-if="input.type === 'description'">
                                    {{ i18n.te(`${advancedI18nPath}.${input.name}.description`) ? i18n.t(`${advancedI18nPath}.${input.name}.description`) : '' }}
                                </p>
                                <hr class="mt-0 mb-3" v-else-if="input.type === 'separator'" />

                                <template v-else>
                                    <label class="field-label">
                                        {{ i18n.te(`${advancedI18nPath}.${input.name}.label`) ? i18n.t(`${advancedI18nPath}.${input.name}.label`) : input.name }}
                                    </label>

                                    <ehubInput v-if="input.type === 'list'" class="w-100 mb-3"
                                        :name="input.name"
                                        :option="{ ...input.inputValue, i18nPath: `${advancedI18nPath}.${input.name}.values` }"
                                        type="select"
                                        v-model="input.eventValue"
                                        :validation="{ ...input.validate, i18nPath: `${advancedI18nPath}.${input.name}.validation` }"
                                        ref="advancedRef" />

                                    <ehubInput v-else-if="['text','number','textarea'].includes(input.type)" class="w-100 mb-3"
                                        :name="input.name"
                                        :type="input.type"
                                        v-model="input.eventValue"
                                        :validation="{ ...input.validate, i18nPath: `${advancedI18nPath}.${input.name}.validation` }"
                                        ref="advancedRef" />

                                    <ehubInput v-else-if="input.type === 'switch'" class="w-100 mb-3"
                                        :name="input.name"
                                        type="switch"
                                        :checkedLabel="i18n.te(`${advancedI18nPath}.${input.name}.checked`) ? i18n.t(`${advancedI18nPath}.${input.name}.checked`) : 'Sim'"
                                        :uncheckedLabel="i18n.te(`${advancedI18nPath}.${input.name}.unchecked`) ? i18n.t(`${advancedI18nPath}.${input.name}.unchecked`) : 'Não'"
                                        v-model="input.eventValue"
                                        ref="advancedRef" />

                                    <ehubInput v-else-if="input.type === 'checkbox'" class="w-100 mb-3"
                                        :name="input.name"
                                        type="checkbox"
                                        :label="i18n.te(`${advancedI18nPath}.${input.name}.label`) ? i18n.t(`${advancedI18nPath}.${input.name}.label`) : input.name"
                                        v-model="input.eventValue"
                                        ref="advancedRef" />
                                </template>

                            </template>
                        </div>
                    </template>
                </div>

            </div>

            <div class="nav-row">
                <button class="btn btn-outline-secondary" @click="goBack">
                    <font-awesome-icon :icon="['fas', 'arrow-left']" class="me-1" />
                    {{ i18n.t('events.manage.create.step3.back') }}
                </button>

                <button v-if="advancedPage < (advancedForm.data?.length ?? 0) - 1"
                    class="btn btn-primary px-5" @click="goNext">
                    {{ i18n.t('events.manage.create.step3.next') }}
                    <font-awesome-icon :icon="['fas', 'arrow-right']" class="ms-1" />
                </button>
                <button v-else class="btn btn-primary px-5" @click="goNext">
                    {{ i18n.t('events.manage.create.step3.next') }}
                    <font-awesome-icon :icon="['fas', 'arrow-right']" class="ms-1" />
                </button>
            </div>
        </div>

        <!-- ═══════════════════ STEP 4 ═══════════════════ -->
        <div v-else-if="step === 4">

            <div class="alert alert-help mb-4">
                <font-awesome-icon :icon="['fas', 'circle-info']" class="me-2" />
                {{ i18n.t('events.manage.create.step4.description') }}
            </div>

            <!-- Field list -->
            <div class="gen-section mb-3">
                <div v-if="regFields.length === 0 && !addingField" class="empty-fields">
                    <font-awesome-icon :icon="['fas', 'clipboard-list']" class="mb-2" style="font-size:1.6rem;opacity:0.25" />
                    <p class="text-muted small mb-0">{{ i18n.t('events.manage.create.step4.empty') }}</p>
                </div>

                <div v-for="(field, index) in regFields" :key="index" class="field-card">
                    <div class="field-card__info">
                        <span class="field-card__type">{{ i18n.t(`events.manage.create.step4.types.${field.type}`) }}</span>
                        <span class="field-card__label">{{ field.label }}</span>
                        <span v-if="field.required" class="badge bg-danger ms-2" style="font-size:0.6rem">obrigatório</span>
                        <span v-if="field.values?.length" class="field-card__values">
                            {{ field.values.join(' · ') }}
                        </span>
                    </div>
                    <div class="field-card__actions">
                        <button class="btn-icon" @click="moveField(index, -1)" :disabled="index === 0" title="Mover acima">
                            <font-awesome-icon :icon="['fas', 'chevron-up']" />
                        </button>
                        <button class="btn-icon" @click="moveField(index, 1)" :disabled="index === regFields.length - 1" title="Mover abaixo">
                            <font-awesome-icon :icon="['fas', 'chevron-down']" />
                        </button>
                        <button class="btn-icon" @click="openEditField(index)" title="Editar">
                            <font-awesome-icon :icon="['fas', 'pen']" />
                        </button>
                        <button class="btn-icon btn-icon--danger" @click="removeField(index)" title="Remover">
                            <font-awesome-icon :icon="['fas', 'trash']" />
                        </button>
                    </div>
                </div>

                <!-- Add/edit field inline form -->
                <div v-if="addingField" class="field-form mt-3">
                    <p class="section-title mb-3">
                        {{ editingIndex !== null ? i18n.t('events.manage.create.step4.edit_field') : i18n.t('events.manage.create.step4.add_field') }}
                    </p>

                    <div class="row g-3">
                        <div class="col-12 col-md-4">
                            <label class="field-label">{{ i18n.t('events.manage.create.step4.field.type') }}</label>
                            <select class="form-select ehub-select" v-model="fieldDraft.type">
                                <option v-for="t in fieldTypes" :key="t" :value="t">
                                    {{ i18n.t(`events.manage.create.step4.types.${t}`) }}
                                </option>
                            </select>
                        </div>
                        <div class="col-12 col-md-8">
                            <label class="field-label">{{ i18n.t('events.manage.create.step4.field.label') }}</label>
                            <input type="text" class="form-control ehub-input" v-model="fieldDraft.label"
                                :class="{ 'is-invalid': fieldDraftError }" maxlength="120" />
                            <div v-if="fieldDraftError" class="invalid-feedback">{{ fieldDraftError }}</div>
                        </div>
                        <div class="col-12" v-if="fieldDraft.type === 'select'">
                            <label class="field-label">{{ i18n.t('events.manage.create.step4.field.values') }}</label>
                            <input type="text" class="form-control ehub-input" v-model="fieldDraft.values"
                                placeholder="Opção 1, Opção 2, Opção 3" />
                        </div>
                        <div class="col-12 d-flex align-items-center gap-3">
                            <div class="form-check form-switch mb-0">
                                <input class="form-check-input" type="checkbox" v-model="fieldDraft.required"
                                    :id="`req-toggle`" />
                                <label class="form-check-label small" :for="`req-toggle`">
                                    {{ i18n.t('events.manage.create.step4.field.required') }}
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="d-flex gap-2 mt-3">
                        <button class="btn btn-primary btn-sm" @click="commitField">
                            {{ i18n.t('events.manage.create.step4.save_field') }}
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" @click="cancelField">
                            {{ i18n.t('events.manage.create.step4.cancel') }}
                        </button>
                    </div>
                </div>

                <button v-if="!addingField" class="btn btn-outline-light btn-sm mt-3" @click="openAddField">
                    <font-awesome-icon :icon="['fas', 'plus']" class="me-1" />
                    {{ i18n.t('events.manage.create.step4.add_field') }}
                </button>
            </div>

            <p v-if="publishError" class="text-danger small mb-3">{{ publishError }}</p>

            <div class="nav-row">
                <button class="btn btn-outline-secondary" @click="goBack" :disabled="publishing">
                    <font-awesome-icon :icon="['fas', 'arrow-left']" class="me-1" />
                    {{ i18n.t('events.manage.create.step4.back') }}
                </button>
                <button class="btn btn-primary px-5" @click="publishEvent" :disabled="publishing">
                    <span v-if="publishing" class="spinner-border spinner-border-sm me-2"></span>
                    <font-awesome-icon v-else :icon="['fas', 'rocket']" class="me-2" />
                    {{ i18n.t('events.manage.create.step4.publish') }}
                </button>
            </div>
        </div>

    </div>
</template>

<style scoped>
.event-create { position: relative; }

/* ─── Header ─────────────────────────────── */
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

/* ─── Breadcrumb ─────────────────────────── */
.step-breadcrumb {
    display: flex;
    align-items: center;
}
.step-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
}
.step-item:last-child { flex: none; }
.step-dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255,255,255,0.35);
    flex-shrink: 0;
    transition: all 0.2s;
}
.step-item.active .step-dot {
    border-color: #6ea8fe;
    color: #6ea8fe;
    box-shadow: 0 0 0 3px rgba(110,168,254,0.15);
}
.step-item.done .step-dot {
    background: #6ea8fe;
    border-color: #6ea8fe;
    color: #fff;
}
.step-label {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    white-space: nowrap;
}
.step-item.active .step-label { color: rgba(255,255,255,0.85); }
.step-item.done .step-label   { color: rgba(255,255,255,0.5); }
.step-line {
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.1);
    margin: 0 0.5rem;
}

/* ─── Sections ───────────────────────────── */
.gen-section {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 1.4rem 1.6rem;
}
.section-title {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin-bottom: 1rem;
}
.step-description {
    color: rgba(255,255,255,0.55);
    font-size: 0.9rem;
}

/* ─── Fields ─────────────────────────────── */
.field-group { margin-bottom: 1.2rem; }
.field-group:last-child { margin-bottom: 0; }
.field-label {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    color: rgba(255,255,255,0.7);
    margin-bottom: 0.35rem;
}
.field-hint {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.35);
    margin-bottom: 0.35rem;
}
.badge-auto {
    font-size: 0.6rem;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    background: rgba(110,168,254,0.15);
    color: #6ea8fe;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    vertical-align: middle;
}

/* ─── Inputs ─────────────────────────────── */
.ehub-input, .ehub-select {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.88);
    border-radius: 8px;
}
.ehub-input:focus, .ehub-select:focus {
    background: rgba(255,255,255,0.07);
    border-color: rgba(255,255,255,0.3);
    box-shadow: none;
    color: rgba(255,255,255,0.95);
}
.ehub-select option { background: #1a1a2e; }
.ehub-input::placeholder { color: rgba(255,255,255,0.2); }
textarea.ehub-input { resize: vertical; }

.input-prefix-wrap {
    display: flex;
    align-items: center;
    gap: 0;
}
.input-prefix {
    padding: 0.375rem 0.75rem;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    border-right: none;
    border-radius: 8px 0 0 8px;
    color: rgba(255,255,255,0.35);
    font-size: 0.85rem;
    white-space: nowrap;
}
.with-prefix {
    border-radius: 0 8px 8px 0 !important;
}

/* ─── Help alert ─────────────────────────── */
.alert-help {
    background: rgba(110,168,254,0.08);
    border: 1px solid rgba(110,168,254,0.2);
    color: rgba(110,168,254,0.9);
    border-radius: 10px;
    font-size: 0.85rem;
    padding: 0.85rem 1rem;
}

/* ─── Image uploads ──────────────────────── */
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

/* ─── TipTap editor ──────────────────────── */
.editor-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.2rem;
    align-items: center;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-bottom: none;
    border-radius: 8px 8px 0 0;
    padding: 0.4rem 0.5rem;
}
.toolbar-group { display: flex; gap: 0.15rem; }
.toolbar-sep { width: 1px; height: 18px; background: rgba(255,255,255,0.1); margin: 0 0.2rem; }
.editor-toolbar button {
    background: none;
    border: none;
    color: rgba(255,255,255,0.5);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.78rem;
    font-weight: 700;
    line-height: 1;
    transition: background 0.12s, color 0.12s;
}
.editor-toolbar button:hover:not(:disabled) { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.9); }
.editor-toolbar button.active { background: rgba(255,255,255,0.14); color: #fff; }
.editor-toolbar button:disabled { opacity: 0.25; cursor: default; }

.editor-wrap {
    min-height: 280px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 0 0 8px 8px;
    padding: 0.9rem 1.1rem;
    color: rgba(255,255,255,0.88);
    font-size: 0.92rem;
    line-height: 1.7;
}
.editor-wrap:deep(.ProseMirror) { outline: none; min-height: 260px; }
.editor-wrap:deep(.ProseMirror p.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    color: rgba(255,255,255,0.2);
    pointer-events: none;
    float: left;
    height: 0;
}
.editor-wrap:deep(h2) { font-size: 1.4rem; font-weight: 600; margin: 0.9rem 0 0.35rem; }
.editor-wrap:deep(h3) { font-size: 1.1rem; font-weight: 600; margin: 0.7rem 0 0.3rem; }
.editor-wrap:deep(blockquote) {
    border-left: 3px solid rgba(255,255,255,0.25);
    padding-left: 0.9rem;
    color: rgba(255,255,255,0.5);
    margin: 0.6rem 0;
}
.editor-wrap:deep(ul), .editor-wrap:deep(ol) { padding-left: 1.4rem; }
.editor-wrap:deep(a) { color: #7eabff; }

/* ─── Navigation ─────────────────────────── */
.nav-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1.5rem;
}

/* ─── Loading row ────────────────────────── */
.loading-row { display: flex; align-items: center; min-height: 38px; }

/* ─── Schema date badge ──────────────────── */
.schema-date-badge {
    display: flex;
    align-items: center;
    background: rgba(110,168,254,0.07);
    border: 1px solid rgba(110,168,254,0.18);
    border-radius: 8px;
    padding: 0.55rem 0.9rem;
    font-size: 0.8rem;
    color: rgba(110,168,254,0.85);
}
.schema-date-badge--warn {
    background: rgba(255,193,7,0.07);
    border-color: rgba(255,193,7,0.2);
    color: rgba(255,193,7,0.85);
}

/* ─── Field builder ──────────────────────── */
.empty-fields {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 1rem;
    gap: 0.5rem;
}
.field-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    padding: 0.7rem 0.9rem;
    margin-bottom: 0.5rem;
}
.field-card__info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    min-width: 0;
}
.field-card__type {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgba(110,168,254,0.8);
    background: rgba(110,168,254,0.1);
    padding: 0.15rem 0.45rem;
    border-radius: 4px;
    white-space: nowrap;
}
.field-card__label {
    font-size: 0.88rem;
    font-weight: 500;
    color: rgba(255,255,255,0.85);
}
.field-card__values {
    font-size: 0.72rem;
    color: rgba(255,255,255,0.3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
}
.field-card__actions {
    display: flex;
    gap: 0.25rem;
    flex-shrink: 0;
    margin-left: 0.5rem;
}
.btn-icon {
    background: none;
    border: none;
    color: rgba(255,255,255,0.4);
    padding: 0.25rem 0.4rem;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.75rem;
    transition: background 0.12s, color 0.12s;
}
.btn-icon:hover:not(:disabled) { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.85); }
.btn-icon:disabled { opacity: 0.2; cursor: default; }
.btn-icon--danger:hover:not(:disabled) { background: rgba(220,53,69,0.15); color: #f1aeb5; }

.field-form {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 1.1rem 1.2rem;
}

/* ─── Category grid ──────────────────────── */
.category-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
}
@media (max-width: 767px) {
    .category-grid { grid-template-columns: repeat(2, 1fr); }
}
.category-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.9rem 0.4rem 0.7rem;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    cursor: pointer;
    text-align: center;
    user-select: none;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
}
.category-card:hover {
    border-color: rgba(110,168,254,0.35);
    background: rgba(110,168,254,0.06);
}
.category-card--selected {
    border-color: #6ea8fe;
    background: rgba(110,168,254,0.12);
    box-shadow: 0 0 0 3px rgba(110,168,254,0.12);
}
.category-card__icon {
    font-size: 1.65rem;
    color: rgba(255,255,255,0.4);
    transition: color 0.15s;
}
.category-card:hover .category-card__icon { color: rgba(255,255,255,0.7); }
.category-card--selected .category-card__icon { color: #6ea8fe; }
.category-card__name {
    font-size: 0.68rem;
    font-weight: 600;
    color: rgba(255,255,255,0.6);
    line-height: 1.25;
    transition: color 0.15s;
}
.category-card--selected .category-card__name { color: #fff; }
.category-card__tags {
    display: flex;
    gap: 0.2rem;
    flex-wrap: wrap;
    justify-content: center;
}
.category-tag {
    font-size: 0.52rem;
    padding: 0.1rem 0.38rem;
    border-radius: 999px;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}
.category-tag--online { background: rgba(78,139,255,0.18); color: #6ea8fe; }
.category-tag--irl    { background: rgba(25,200,100,0.14); color: #3dd68c; }

/* ─── Runmode toggle ─────────────────────── */
.runmode-toggle { display: flex; gap: 0.6rem; }
.runmode-btn {
    flex: 1;
    padding: 0.65rem 1rem;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.04);
    color: rgba(255,255,255,0.5);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
}
.runmode-btn:hover {
    border-color: rgba(255,255,255,0.22);
    background: rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.85);
}
.runmode-btn--active.runmode-btn--online {
    border-color: #6ea8fe;
    background: rgba(110,168,254,0.12);
    color: #6ea8fe;
    box-shadow: 0 0 0 3px rgba(110,168,254,0.1);
}
.runmode-btn--active.runmode-btn--irl {
    border-color: #3dd68c;
    background: rgba(61,214,140,0.1);
    color: #3dd68c;
    box-shadow: 0 0 0 3px rgba(61,214,140,0.08);
}
</style>
