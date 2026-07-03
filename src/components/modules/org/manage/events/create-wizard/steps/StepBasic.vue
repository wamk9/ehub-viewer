<script setup>
import EhubMediaUpload from '@/components/EhubMediaUpload.vue'

defineProps({
  form: { type: Object, required: true },
})
</script>

<template>
  <div>
    <h2 class="step-title">{{ $t('pages.organization.manage.eventWizard.s1.title') }}</h2>
    <p class="step-sub">{{ $t('pages.organization.manage.eventWizard.s1.sub') }}</p>

    <div class="form-section">
      <label class="form-label">{{ $t('pages.organization.manage.eventWizard.s1.name') }} <span class="req-mark">*</span></label>
      <input type="text" class="form-control" v-model="form.name" maxlength="80" :placeholder="$t('pages.organization.manage.eventWizard.s1.namePh')" />
      <div class="char-count">{{ form.name.length }}/80</div>
    </div>

    <div class="form-section">
      <label class="form-label">{{ $t('pages.organization.manage.eventWizard.s1.desc') }}</label>
      <textarea class="form-control" rows="4" maxlength="400" style="resize:vertical" v-model="form.description" :placeholder="$t('pages.organization.manage.eventWizard.s1.descPh')"></textarea>
      <div class="char-count">{{ form.description.length }}/400</div>
    </div>

    <div class="form-section">
      <label class="form-label">{{ $t('pages.organization.manage.eventWizard.s1.cover') }}</label>
      <EhubMediaUpload v-model="form.cover_image" v-model:gradient-index="form.cover_gradient_index" variant="cover" />
    </div>

    <div class="form-section">
      <label class="form-label">{{ $t('pages.organization.manage.eventWizard.s1.logo') }}</label>
      <EhubMediaUpload v-model="form.logo_image" variant="logo" />
    </div>
  </div>
</template>

<style scoped>
.step-title { font-size: 1.3rem; font-weight: 800; color: var(--ehub-ink); margin: 0 0 4px; letter-spacing: -.02em; }
.step-sub { font-size: .88rem; color: var(--ehub-muted); margin: 0 0 28px; }
.form-section { margin-bottom: 26px; }
.form-label { font-size: .85rem; font-weight: 600; color: var(--ehub-ink); }
.req-mark { color: #e23b3b; }
.char-count { font-size: .73rem; color: var(--ehub-muted); text-align: right; margin-top: 3px; }
</style>
