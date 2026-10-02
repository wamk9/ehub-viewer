<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { categoryConfig, categoryIcon } from '@/helpers/General/CategoryConfig.js'
import { slugify } from '../wizardState.js'

const props = defineProps({
  form: { type: Object, required: true },
  org: { type: Object, required: true },
})

const route = useRoute()
const { locale } = useI18n()

function onSlugInput() {
  props.form.route_manually_edited = true
  props.form.route = slugify(props.form.route)
}

const routeChanged = computed(() => !!props.form._original_route && props.form.route !== props.form._original_route)

const urlFull = computed(() => `https://ehubapp.com/org/${route.params.orgRoute}/event/${props.form.route || '…'}`)

// Mirrors the share image eHub generates: event colour, logo, name, organization and start date.
const ogColor = computed(() => props.form.color || props.org.color || categoryConfig(props.form.category).grad[0])
const ogStyle = computed(() => ({ background: `linear-gradient(135deg, ${ogColor.value}, color-mix(in srgb, ${ogColor.value}, #000 38%))` }))
const logoUrl = computed(() => props.form.logo_image || props.form._existing_logo_url || '')
const startLabel = computed(() => {
  if (!props.form.start_at) return ''
  const d = new Date(props.form.start_at + 'T12:00:00')
  return isNaN(d) ? '' : d.toLocaleDateString(locale.value, { day: '2-digit', month: 'short', year: 'numeric' })
})
</script>

<template>
  <div>
    <h2 class="step-title">{{ $t('pages.organization.manage.eventWizard.s6.title') }}</h2>
    <p class="step-sub">{{ $t('pages.organization.manage.eventWizard.s6.sub') }}</p>

    <div class="form-section">
      <label class="form-label">{{ $t('pages.organization.manage.eventWizard.s6.slugLabel') }} <span class="req-mark">*</span></label>
      <div class="input-group">
        <span class="input-group-text seo-prefix">ehubapp.com/org/{{ route.params.orgRoute }}/event/</span>
        <input type="text" class="form-control" v-model="form.route" @input="onSlugInput" />
      </div>
      <div class="url-preview-bar">
        <font-awesome-icon :icon="['fas', 'link']" />
        <span>{{ urlFull }}</span>
      </div>
      <p class="field-hint mt-2">{{ $t('pages.organization.manage.eventWizard.s6.slugHint') }}</p>
      <div v-if="routeChanged" class="route-warning" role="alert">
        <font-awesome-icon :icon="['fas', 'triangle-exclamation']" />
        <span>{{ $t('pages.organization.manage.eventWizard.s6.routeChanged') }}</span>
        <button type="button" class="btn btn-link btn-sm p-0" @click="form.route = form._original_route">{{ $t('pages.organization.manage.eventWizard.s6.routeRestore') }}</button>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-label">{{ $t('pages.organization.manage.eventWizard.s6.socialPreview') }}</div>
      <div class="auto-note">
        <font-awesome-icon :icon="['fas', 'wand-magic-sparkles']" />
        <div>
          <strong>{{ $t('pages.organization.manage.eventWizard.s6.autoTitle') }}</strong>
          <p>{{ $t('pages.organization.manage.eventWizard.s6.autoHint') }}</p>
        </div>
      </div>
      <div class="og-preview" :style="ogStyle" aria-hidden="true">
        <div class="og-stripes"></div>
        <div class="og-tile">
          <img v-if="logoUrl" :src="logoUrl" alt="" />
          <font-awesome-icon v-else :icon="categoryIcon(form.category)" />
        </div>
        <div class="og-name">{{ form.name || '—' }}</div>
        <div class="og-org">{{ org.name }}</div>
        <div v-if="startLabel" class="og-chip"><font-awesome-icon :icon="['fas', 'calendar-days']" /> {{ startLabel }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-title { font-size: 1.3rem; font-weight: 800; color: var(--ehub-ink); margin: 0 0 4px; letter-spacing: -.02em; }
.step-sub { font-size: .88rem; color: var(--ehub-muted); margin: 0 0 28px; }
.form-section { margin-bottom: 26px; }
.form-label { font-size: .85rem; font-weight: 600; color: var(--ehub-ink); }
.req-mark { color: var(--ehub-danger-text); }
.form-section-label { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--ehub-muted); margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.form-section-label::after { content: ''; flex: 1; height: 1px; background: var(--ehub-line); }
.field-hint { font-size: .78rem; color: var(--ehub-muted); margin: 0; }
.seo-prefix { font-size: .78rem; white-space: nowrap; }
.url-preview-bar { display: flex; align-items: center; gap: 9px; margin-top: 8px; padding: 9px 13px; background: var(--ehub-field-bg); border: 1px solid var(--ehub-line); border-radius: 8px; font-size: .82rem; color: var(--ehub-ink); word-break: break-all; }
.url-preview-bar svg { color: var(--ehub-primary-text); flex-shrink: 0; }

.route-warning { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 10px; padding: 10px 13px; border-radius: 8px; background: var(--ehub-warning-bg, rgba(251, 191, 17, .12)); border: 1px solid var(--ehub-warning-border, rgba(251, 191, 17, .45)); font-size: .8rem; color: var(--ehub-ink); }
.route-warning svg { color: var(--ehub-warning-text, #b7791f); }
.route-warning span { flex: 1; min-width: 200px; }
.auto-note { display: flex; gap: 12px; align-items: flex-start; padding: 12px 14px; border: 1px solid var(--ehub-line); border-radius: 10px; background: var(--ehub-field-bg); margin-bottom: 14px; }
.auto-note svg { color: var(--ehub-primary-text); margin-top: 3px; flex-shrink: 0; }
.auto-note strong { font-size: .86rem; color: var(--ehub-ink); }
.auto-note p { font-size: .78rem; color: var(--ehub-muted); margin: 2px 0 0; }

/* 1200x630 share image, scaled down */
.og-preview { position: relative; overflow: hidden; max-width: 460px; aspect-ratio: 1200 / 630; border-radius: 12px; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 24px; }
.og-stripes { position: absolute; inset: 0; background-image: repeating-linear-gradient(118deg, transparent 0 16px, rgba(255, 255, 255, .07) 16px 17px); }
.og-tile { position: relative; width: 58px; height: 58px; border-radius: 13px; background: rgba(255, 255, 255, .16); border: 2px solid rgba(255, 255, 255, .9); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; overflow: hidden; }
.og-tile img { width: 100%; height: 100%; object-fit: cover; }
.og-name { position: relative; font-size: 1.25rem; font-weight: 800; letter-spacing: -.02em; line-height: 1.1; margin: 10px 0 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.og-org { position: relative; font-size: .8rem; font-weight: 600; opacity: .92; }
.og-chip { position: relative; margin-top: 10px; background: #fff; color: #1a1d24; font-size: .74rem; font-weight: 700; padding: 4px 10px; border-radius: 999px; display: inline-flex; gap: 6px; align-items: center; }
</style>
