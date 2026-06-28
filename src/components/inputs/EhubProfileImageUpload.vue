<template>
  <div class="eiu">
    <div :class="['eiu-preview', `eiu-preview--${type}`]" :style="containerStyle">
      <img v-if="previewSrc" :src="previewSrc" class="eiu-img" alt="" />
      <slot v-else name="fallback" />
    </div>
    <div class="eiu-actions">
      <label class="btn btn-outline-secondary round btn-sm eiu-select">
        <font-awesome-icon icon="image" class="me-1" />
        {{ $t('common.image_upload.select') }}
        <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFile" />
      </label>
      <button v-if="localPreview" class="btn btn-outline-secondary round btn-sm" type="button" @click="clearFile">
        {{ $t('common.image_upload.cancel') }}
      </button>
      <button v-if="currentUrl && !localPreview" class="btn btn-outline-danger round btn-sm" type="button" @click="$emit('remove')">
        {{ $t('common.image_upload.remove') }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EhubProfileImageUpload',
  props: {
    currentUrl: { type: String, default: null },
    fallbackStyle: { type: Object, default: () => ({}) },
    type: { type: String, default: 'logo' },
  },
  emits: ['change', 'remove'],
  data() {
    return { localPreview: null }
  },
  computed: {
    previewSrc() { return this.localPreview || this.currentUrl },
    containerStyle() { return this.fallbackStyle },
  },
  methods: {
    onFile(e) {
      const file = e.target.files[0]
      if (!file) return
      if (this.localPreview) URL.revokeObjectURL(this.localPreview)
      this.localPreview = URL.createObjectURL(file)
      this.$emit('change', file)
    },
    clearFile() {
      if (this.localPreview) URL.revokeObjectURL(this.localPreview)
      this.localPreview = null
      if (this.$refs.fileInput) this.$refs.fileInput.value = ''
      this.$emit('change', null)
    },
    reset() { this.clearFile() },
  },
  beforeUnmount() {
    if (this.localPreview) URL.revokeObjectURL(this.localPreview)
  },
}
</script>

<style scoped>
.eiu { display: flex; flex-direction: column; gap: 10px; }
.eiu-preview { overflow: hidden; flex-shrink: 0; }
.eiu-preview--logo {
  width: 64px; height: 64px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; font-weight: 800; color: #fff;
}
.eiu-preview--cover {
  width: 100%; height: 100px; border-radius: 12px;
}
.eiu-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.eiu-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.eiu-select { cursor: pointer; }
</style>
