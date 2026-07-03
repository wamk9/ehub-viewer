<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { categoryGradient } from '@/helpers/General/CategoryConfig.js'
import { slugify } from '../wizardState.js'

const props = defineProps({
  form: { type: Object, required: true },
  org: { type: Object, required: true },
})

const route = useRoute()

function onSlugInput() {
  props.form.route_manually_edited = true
  props.form.route = slugify(props.form.route)
}

const urlFull = computed(() => `https://ehubapp.com/org/${route.params.orgRoute}/event/${props.form.route || '…'}`)

const previewTitle = computed(() => props.form.meta_title.trim() || props.form.name || '—')
const previewDesc = computed(() => props.form.meta_description.trim() || props.form.description || '—')
const previewCoverStyle = computed(() => props.form.cover_image
  ? { backgroundImage: `url(${props.form.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  : { background: categoryGradient(props.form.category) })
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
    </div>

    <div class="form-section">
      <label class="form-label">{{ $t('pages.organization.manage.eventWizard.s6.metaTitle') }}</label>
      <input type="text" class="form-control" v-model="form.meta_title" maxlength="60" :placeholder="$t('pages.organization.manage.eventWizard.s6.metaTitlePh')" />
      <div class="seo-char-row">
        <p class="field-hint">{{ $t('pages.organization.manage.eventWizard.s6.metaTitleHint') }}</p>
        <span class="char-count">{{ form.meta_title.length }}/60</span>
      </div>
    </div>

    <div class="form-section">
      <label class="form-label">{{ $t('pages.organization.manage.eventWizard.s6.metaDesc') }}</label>
      <textarea class="form-control" rows="3" maxlength="155" style="resize:vertical" v-model="form.meta_description" :placeholder="$t('pages.organization.manage.eventWizard.s6.metaDescPh')"></textarea>
      <div class="seo-char-row">
        <p class="field-hint">{{ $t('pages.organization.manage.eventWizard.s6.metaDescHint') }}</p>
        <span class="char-count">{{ form.meta_description.length }}/155</span>
      </div>
    </div>

    <div class="form-section">
      <div class="form-section-label">{{ $t('pages.organization.manage.eventWizard.s6.socialPreview') }}</div>
      <div class="social-preview-card">
        <div class="spc-cover" :style="previewCoverStyle"></div>
        <div class="spc-body">
          <div class="spc-domain">EHUBAPP.COM</div>
          <div class="spc-title">{{ previewTitle }}</div>
          <div class="spc-desc">{{ previewDesc }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-title { font-size: 1.3rem; font-weight: 800; color: var(--ehub-ink); margin: 0 0 4px; letter-spacing: -.02em; }
.step-sub { font-size: .88rem; color: var(--ehub-muted); margin: 0 0 28px; }
.form-section { margin-bottom: 26px; }
.form-label { font-size: .85rem; font-weight: 600; color: var(--ehub-ink); }
.req-mark { color: #e23b3b; }
.form-section-label { font-size: .7rem; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--ehub-muted); margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.form-section-label::after { content: ''; flex: 1; height: 1px; background: var(--ehub-line); }
.field-hint { font-size: .78rem; color: var(--ehub-muted); margin: 0; }
.seo-prefix { font-size: .78rem; white-space: nowrap; }
.url-preview-bar { display: flex; align-items: center; gap: 9px; margin-top: 8px; padding: 9px 13px; background: var(--ehub-field-bg); border: 1px solid var(--ehub-line); border-radius: 8px; font-size: .82rem; color: var(--ehub-ink); word-break: break-all; }
.url-preview-bar svg { color: var(--ehub-primary); flex-shrink: 0; }
.seo-char-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-top: 5px; }
.char-count { font-size: .73rem; color: var(--ehub-muted); flex-shrink: 0; }

.social-preview-card { border: 1px solid var(--ehub-line); border-radius: 12px; overflow: hidden; max-width: 460px; background: var(--ehub-card); }
.spc-cover { height: 90px; }
.spc-body { padding: 11px 15px 15px; }
.spc-domain { font-size: .67rem; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--ehub-muted); margin-bottom: 4px; }
.spc-title { font-size: .92rem; font-weight: 700; color: var(--ehub-ink); margin-bottom: 4px; line-height: 1.3; }
.spc-desc { font-size: .78rem; color: var(--ehub-muted); line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
