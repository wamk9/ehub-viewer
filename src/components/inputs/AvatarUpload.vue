<template>
  <div class="avatar-col flex-shrink-0 mx-auto mx-md-0">
    <div class="avatar-size">
      <ehubProfileImage
        :modelValue="modelValue"
        @update:modelValue="emit('update:modelValue', $event)"
        :buttonLabel="buttonLabel"
        :dropLabel="dropLabel"
        :fallbackName="fallbackName"
        :fallbackType="fallbackType"
        :initialsSize="initialsSize"
      />
    </div>
  </div>
</template>

<script setup>
import ehubProfileImage from '@/components/inputs/ehub-profile-image.vue'

defineProps({
  modelValue:   { type: String,  default: '' },
  buttonLabel:  { type: String,  default: 'Upload' },
  dropLabel:    { type: String,  default: 'Drop here' },
  fallbackName: { type: String,  default: '' },
  fallbackType: { type: String,  default: 'user' },
  initialsSize: { type: Number,  default: 120 },
})
const emit = defineEmits(['update:modelValue'])
</script>

<style scoped>
.avatar-col {
  width: 130px;
  text-align: center;
}
.avatar-size {
  width: 120px;
  margin: 0 auto;
}
.avatar-size :deep(.preview-wrapper) {
  width: 120px !important;
  height: 120px !important;
  padding: 0 !important;
  margin-bottom: 0.5rem !important;
  border-radius: 50% !important;
  overflow: hidden !important;
  border: 3px solid var(--bs-border-color);
}
.avatar-size :deep(.preview-wrapper::before) { display: none !important; }
.avatar-size :deep(.preview-image) {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  border-radius: 50% !important;
  border: none !important;
  margin: 0 !important;
}

@media (max-width: 767px) {
  .avatar-col { width: 100%; }
}
</style>
