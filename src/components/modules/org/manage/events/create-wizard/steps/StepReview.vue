<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { categoryIcon } from '@/helpers/General/CategoryConfig.js'

const props = defineProps({
  form: { type: Object, required: true },
})

const { t, te, locale } = useI18n()

const categoryLabel = computed(() => {
  const key = `categories.names.${props.form.category}`
  return props.form.category ? (te(key) ? t(key) : props.form.category) : '—'
})
const runmodeLabel = computed(() => {
  const key = `categories.runmode.${props.form.runmode}`
  return props.form.runmode ? (te(key) ? t(key) : props.form.runmode) : '—'
})
function fmtDate(v) {
  if (!v) return '—'
  const [y, m, d] = String(v).slice(0, 10).split('-').map(Number)
  return new Intl.DateTimeFormat(locale.value, { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(y, m - 1, d))
}
function money(v, cur) {
  try { return new Intl.NumberFormat(locale.value, { style: 'currency', currency: (cur || 'BRL').toUpperCase() }).format(+v || 0) }
  catch { return `${cur} ${v}` }
}

const coverUrl = computed(() => props.form.cover_image || props.form._existing_cover_url || '')
const logoUrl = computed(() => props.form.logo_image || props.form._existing_logo_url || '')
const accent = computed(() => props.form.color || '#0098D8')
const coverStyle = computed(() => coverUrl.value
  ? { backgroundImage: `url(${coverUrl.value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  : { background: `linear-gradient(135deg, ${accent.value}, color-mix(in srgb, ${accent.value}, #000 30%))` })
const initials = computed(() => (props.form.name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase())

const summary = computed(() => {
  const wz = 'pages.organization.manage.eventWizard.rev.'
  return [
    { k: t(wz + 'name'), v: props.form.name || '—' },
    { k: t(wz + 'category'), v: categoryLabel.value },
    { k: t(wz + 'mode'), v: runmodeLabel.value },
    { k: t(wz + 'format'), v: props.form.format ? t(`pages.organization.manage.eventWizard.fmt.${props.form.format}`) : '—' },
    { k: t(wz + 'start'), v: fmtDate(props.form.start_at) },
    { k: t(wz + 'slots'), v: props.form.max_registrations || t(wz + 'unlimited') },
    { k: t(wz + 'fee'), v: (+props.form.fee > 0) ? money(props.form.fee, props.form.currency) : t(wz + 'free') },
    { k: t(wz + 'url'), v: props.form.route || '—' },
  ]
})

</script>

<template>
  <div>
    <h2 class="step-title">{{ $t('pages.organization.manage.eventWizard.s7.title') }}</h2>
    <p class="step-sub">{{ $t('pages.organization.manage.eventWizard.s7.sub') }}</p>

    <div class="row g-4">
      <div class="col-md-5">
        <div class="form-section-label">{{ $t('pages.organization.manage.eventWizard.s7.preview') }}</div>
        <div class="review-event-card">
          <div class="rev-cover" :style="coverStyle">
            <font-awesome-icon v-if="!coverUrl" :icon="['fas', categoryIcon(form.category)]" />
          </div>
          <div class="rev-body">
            <div class="rev-logo" :style="{ background: accent }">
              <img v-if="logoUrl" :src="logoUrl" alt="" />
              <span v-else>{{ initials }}</span>
            </div>
            <div class="rev-title">{{ form.name || '—' }}</div>
            <div class="rev-chips">
              <span v-if="form.category" class="rev-chip primary" :style="{ color: accent, borderColor: accent, background: `color-mix(in srgb, ${accent} 14%, transparent)` }">{{ categoryLabel }}</span>
              <span v-if="form.format" class="rev-chip">{{ $t(`pages.organization.manage.eventWizard.fmt.${form.format}`) }}</span>
              <span v-if="form.runmode" class="rev-chip">{{ runmodeLabel }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-7">
        <div class="form-section-label">{{ $t('pages.organization.manage.eventWizard.s7.summary') }}</div>
        <div class="review-fields">
          <div v-for="row in summary" :key="row.k" class="rf">
            <div class="rf-k">{{ row.k }}</div>
            <div class="rf-v">{{ row.v }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="form-section mt-4">
      <div class="form-section-label">{{ $t('pages.organization.manage.eventWizard.s7.pubLabel') }}</div>
      <div class="pub-cards">
        <button type="button" class="pub-card" :class="{ sel: form.publication === 'published' }" @click="form.publication = 'published'">
          <div class="pi"><font-awesome-icon :icon="['fas', 'circle-dot']" /></div>
          <div class="pn">{{ $t('pages.organization.manage.eventWizard.pub.publish') }}</div>
          <div class="pd">{{ $t('pages.organization.manage.eventWizard.pub.publishSub') }}</div>
        </button>
        <button type="button" class="pub-card" :class="{ sel: form.publication === 'draft' }" @click="form.publication = 'draft'">
          <div class="pi"><font-awesome-icon :icon="['fas', 'file-pen']" /></div>
          <div class="pn">{{ $t('pages.organization.manage.eventWizard.pub.draft') }}</div>
          <div class="pd">{{ $t('pages.organization.manage.eventWizard.pub.draftSub') }}</div>
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.step-title { font-size: 1.3rem; font-weight: 800; color: var(--ehub-ink); margin: 0 0 4px; letter-spacing: -.02em; }
.step-sub { font-size: .88rem; color: var(--ehub-muted); margin: 0 0 28px; }
.form-section-label { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--ehub-muted); margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.form-section-label::after { content: ''; flex: 1; height: 1px; background: var(--ehub-line); }

.review-event-card { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); overflow: hidden; max-width: 360px; }
.rev-cover { height: 90px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: rgba(255,255,255,.9); }
.rev-body { padding: 0 16px 14px; }
.rev-logo { width: 52px; height: 52px; border-radius: 13px; margin-top: -26px; margin-bottom: 8px; border: 3px solid var(--ehub-card); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; overflow: hidden; position: relative; }
.rev-logo img { width: 100%; height: 100%; object-fit: cover; }
.rev-title { font-size: 1rem; font-weight: 700; color: var(--ehub-ink); margin: 0 0 6px; }
.rev-chips { display: flex; flex-wrap: wrap; gap: 5px; }
.rev-chip { font-size: .7rem; font-weight: 600; padding: 3px 9px; border-radius: 50rem; background: var(--ehub-field-bg); color: var(--ehub-muted); border: 1px solid var(--ehub-line); }
.rev-chip.primary { background: var(--ehub-primary-tint); color: var(--ehub-primary); border-color: var(--ehub-primary-border); }

.review-fields { background: var(--ehub-card); border: 1px solid var(--ehub-line); border-radius: var(--ehub-radius-card); overflow: hidden; }
.rf { display: flex; padding: 12px 16px; border-bottom: 1px solid var(--ehub-line); gap: 12px; align-items: flex-start; }
.rf:last-child { border-bottom: 0; }
.rf-k { font-size: .73rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--ehub-muted); width: 120px; flex-shrink: 0; padding-top: 2px; }
.rf-v { font-size: .88rem; font-weight: 600; color: var(--ehub-ink); flex: 1; }

.pub-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.pub-card { border: 2px solid var(--ehub-line); border-radius: 12px; padding: 16px; cursor: pointer; transition: all .15s; background: var(--ehub-card); text-align: left; }
.pub-card:hover { border-color: var(--ehub-primary); }
.pub-card.sel { border-color: var(--ehub-primary); background: var(--ehub-primary-tint); }
.pub-card .pi { font-size: 1.1rem; color: var(--ehub-muted); margin-bottom: 6px; }
.pub-card.sel .pi { color: var(--ehub-primary); }
.pub-card .pn { font-size: .88rem; font-weight: 700; color: var(--ehub-ink); margin-bottom: 2px; }
.pub-card .pd { font-size: .76rem; color: var(--ehub-muted); line-height: 1.4; }


@media (max-width: 640px) { .pub-cards { grid-template-columns: 1fr; } }
</style>
