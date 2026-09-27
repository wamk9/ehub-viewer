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
    _existing_logo_url: '',
    _existing_cover_url: '',

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

// Visible-text limit for the rich-text description (markup doesn't count).
export const DESCRIPTION_MAX = 5000

function toDateInput(v) {
  if (!v) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  const d = new Date(v)
  if (isNaN(d)) return ''
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/**
 * Edit mode: only send what changed since the event was loaded, so untouched
 * fields keep their stored value (e.g. start_at time) and started events can
 * still save the few fields the API allows after start (rules, streaming...).
 */
export function diffPayload(initial, current) {
  const out = {}
  for (const [k, v] of Object.entries(current)) {
    if (v === undefined) continue
    if (JSON.stringify(v) !== JSON.stringify(initial[k])) out[k] = v
  }
  return out
}

export function populateFormFromEvent(form, event, baseUrl) {
  const fields = [
    'name', 'description', 'cover_type', 'cover_gradient_index', 'color',
    'category', 'subcategory', 'runmode', 'format', 'location',
    'form_schema_id', 'event_data', 'event_fields', 'stage_fields', 'registration_form_template',
    'entry_type', 'team_size', 'max_registrations', 'min_registrations',
    'fee', 'currency', 'prize_pool_amount', 'prize_pool_currency', 'requirements',
    'registration_deadline', 'start_at', 'end_at', 'timezone',
    'rules', 'tech_requirements', 'streaming_twitch', 'streaming_youtube',
    'route', 'meta_title', 'meta_description', 'publication',
  ]
  for (const key of fields) {
    if (event[key] !== undefined && event[key] !== null) form[key] = event[key]
  }
  // Currency selects use upper-case codes; the API stores lower-case ("brl").
  if (form.currency) form.currency = String(form.currency).toUpperCase()
  if (form.prize_pool_currency) form.prize_pool_currency = String(form.prize_pool_currency).toUpperCase()
  // The wizard uses <input type="date">: API timestamps must become YYYY-MM-DD.
  for (const key of ['start_at', 'end_at', 'registration_deadline']) {
    form[key] = toDateInput(form[key])
  }
  form.route_manually_edited = true
  if (event.logo_image) form._existing_logo_url = baseUrl + 'storage/' + event.logo_image
  if (event.cover_image) form._existing_cover_url = baseUrl + 'storage/' + event.cover_image
  if (Array.isArray(event.stages)) {
    form.stages = event.stages.map(s => ({
      id: s.id, name: s.name, route: s.route, stage_type: s.stage_type,
      start_at: toDateInput(s.start_at), config: s.config || {}, _persisted: true,
      _initial: { name: s.name, start_at: toDateInput(s.start_at), config: JSON.stringify(s.config || {}) },
    }))
  }
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
