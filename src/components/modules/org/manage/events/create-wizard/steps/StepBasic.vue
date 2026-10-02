<script setup>
import { computed } from 'vue'
import EhubVisualFields from '@/components/inputs/EhubVisualFields.vue'
import EhubRichTextEditor from '@/components/inputs/EhubRichTextEditor.vue'
import { DESCRIPTION_MAX } from '../wizardState.js'

const props = defineProps({
  form: { type: Object, required: true },
})

const initials = computed(() => (props.form.name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase())

// The API receives images as data URLs; an empty selection keeps the stored image.
function readFile(file, key) {
  if (!file) { props.form[key] = ''; return }
  const reader = new FileReader()
  reader.onload = (e) => { props.form[key] = e.target.result }
  reader.readAsDataURL(file)
}
</script>

<template>
  <div>
    <h2 class="step-title">{{ $t('pages.organization.manage.eventWizard.s1.title') }}</h2>
    <p class="step-sub">{{ $t('pages.organization.manage.eventWizard.s1.sub') }}</p>

    <div class="form-section">
      <label class="form-label" for="wz-basic-1">{{ $t('pages.organization.manage.eventWizard.s1.name') }} <span class="req-mark">*</span></label>
      <input id="wz-basic-1" type="text" class="form-control" v-model="form.name" maxlength="80" :placeholder="$t('pages.organization.manage.eventWizard.s1.namePh')" />
      <div class="char-count">{{ form.name.length }}/80</div>
    </div>

    <div class="form-section">
      <label class="form-label">{{ $t('pages.organization.manage.eventWizard.s1.desc') }}</label>
      <EhubRichTextEditor v-model="form.description" :max-chars="DESCRIPTION_MAX" :min-height="140"
        :placeholder="$t('pages.organization.manage.eventWizard.s1.descPh')" />
    </div>

    <div class="form-section">
      <EhubVisualFields
        v-model:color="form.color"
        :logo-url="form.logo_image || form._existing_logo_url"
        :cover-url="form.cover_image || form._existing_cover_url"
        :initials="initials"
        @logo-change="(f) => readFile(f, 'logo_image')"
        @cover-change="(f) => readFile(f, 'cover_image')"
        @remove-logo="form.logo_image = ''; form._existing_logo_url = ''"
        @remove-cover="form.cover_image = ''; form._existing_cover_url = ''"
      />
    </div>
  </div>
</template>

<style scoped>
.step-title { font-size: 1.3rem; font-weight: 800; color: var(--ehub-ink); margin: 0 0 4px; letter-spacing: -.02em; }
.step-sub { font-size: .88rem; color: var(--ehub-muted); margin: 0 0 28px; }
.form-section { margin-bottom: 26px; }
.form-label { font-size: .85rem; font-weight: 600; color: var(--ehub-ink); }
.req-mark { color: var(--ehub-danger-text); }
.char-count { font-size: .73rem; color: var(--ehub-muted); text-align: right; margin-top: 3px; }
</style>
