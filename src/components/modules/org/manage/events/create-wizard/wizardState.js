import { reactive } from 'vue'

export function slugify(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export const DEFAULT_POINTS = Array.from({ length: 21 }, (_, i) => ({ position: i + 1, value: [25, 18, 15, 12, 10, 8, 6, 4][i] ?? 0 }))

export function createWizardForm() {
  return reactive({
    // Step 1 — Básico
    name: '',
    description: '',
    logo_image: '',
    cover_image: '',
    cover_type: 'gradient',
    cover_gradient_index: 0,
    color: '#0098D8',

    // Step 2 — Categoria & Formato
    category: '',
    subcategory: '',
    runmode: '',
    format: '',
    location: '',

    // Step 3 — Específicas (form_schema dinâmico)
    form_schema_id: null,
    event_data: {},

    // Step 4 — Campos do Formulário
    event_fields: [],
    stage_fields: [],
    registration_form_template: [],

    // Step 5 — Participantes
    entry_type: 'individual',
    team_size: 5,
    max_registrations: null,
    min_registrations: null,
    fee: 0,
    currency: 'BRL',
    prize_pool_amount: null,
    prize_pool_currency: 'BRL',
    requirements: '',

    // Step 6 — Cronograma
    registration_deadline: '',
    start_at: '',
    end_at: '',
    timezone: 'BRT',
    stages: [], // local only — [{ id, name, route, stage_type, start_at, config }]

    // Step 7 — Regulamento
    rules: '',
    tech_requirements: '',
    streaming_twitch: '',
    streaming_youtube: '',
    default_points: DEFAULT_POINTS.map(p => ({ ...p })),
    default_extra_points: [],

    // Step 8 — SEO & URL
    route: '',
    route_manually_edited: false,
    meta_title: '',
    meta_description: '',

    // Step 9 — Revisão
    publication: 'published',
  })
}

export function buildEventPayload(form) {
  return {
    name: form.name.trim(),
    route: form.route.trim(),
    description: form.description.trim() || null,
    meta_title: form.meta_title.trim() || null,
    meta_description: form.meta_description.trim() || null,
    color: form.color || null,
    cover_type: form.cover_image ? 'image' : 'gradient',
    cover_gradient_index: form.cover_image ? null : form.cover_gradient_index,
    logo_image: form.logo_image || undefined,
    cover_image: form.cover_image || undefined,
    category: form.category,
    subcategory: form.subcategory || null,
    runmode: form.runmode,
    format: form.format || null,
    location: form.runmode === 'irl' ? (form.location.trim() || null) : null,
    form_schema_id: form.form_schema_id,
    event_data: form.event_data,
    event_fields: form.event_fields,
    stage_fields: form.stage_fields,
    registration_form_template: form.registration_form_template,
    entry_type: form.entry_type,
    team_size: form.entry_type === 'team' ? form.team_size : null,
    max_registrations: form.max_registrations ? +form.max_registrations : null,
    min_registrations: form.min_registrations ? +form.min_registrations : null,
    fee: form.fee ? +form.fee : 0,
    currency: form.currency,
    prize_pool_amount: form.prize_pool_amount ? +form.prize_pool_amount : null,
    prize_pool_currency: form.prize_pool_amount ? form.prize_pool_currency : null,
    requirements: form.requirements.trim() || null,
    registration_deadline: form.registration_deadline || null,
    start_at: form.start_at || null,
    end_at: form.end_at || null,
    timezone: form.timezone,
    rules: form.rules.trim() || null,
    tech_requirements: form.tech_requirements.trim() || null,
    streaming_twitch: form.streaming_twitch.trim() || null,
    streaming_youtube: form.streaming_youtube.trim() || null,
    publication: form.publication,
  }
}
