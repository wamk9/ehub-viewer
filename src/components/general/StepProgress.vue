<template>
  <div class="d-flex align-items-flex-start">
    <template v-for="s in steps" :key="s">
      <div class="d-flex flex-column align-items-center step-item">
        <div class="step-bubble" :class="{ 'step-active': current === s, 'step-done': current > s }">
          <font-awesome-icon v-if="current > s" icon="check" class="small" />
          <span v-else>{{ s }}</span>
        </div>
        <small class="text-muted text-center mt-1 step-label">{{ labels[s - 1] }}</small>
      </div>
      <div v-if="s < steps" class="step-line flex-grow-1 mt-4"
        :class="{ 'step-line-done': current > s }"></div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  steps:   { type: Number, required: true },
  current: { type: Number, required: true },
  labels:  { type: Array,  required: true },
})
</script>

<style scoped>
.step-item { min-width: 60px; }
.step-label { font-size: 0.7rem; white-space: nowrap; }

.step-bubble {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--bs-border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
  flex-shrink: 0;
  color: var(--bs-secondary-color);
  transition: all 0.3s;
}
.step-active { border-color: var(--bs-primary);  background: var(--bs-primary);  color: #fff; }
.step-done   { border-color: var(--bs-success);  background: var(--bs-success);  color: #fff; }

.step-line {
  height: 2px;
  background: var(--bs-border-color);
  transition: background 0.3s;
}
.step-line-done { background: var(--bs-success); }
</style>
