<script setup>
import { computed } from 'vue'
import { watchUrl } from '@/helpers/General/liveStream.js'

/**
 * Broadcast link field (Twitch or YouTube) used for stages, sessions and matches.
 * Shows which platform was recognized and warns when the link is not one of them.
 */
const props = defineProps({
  modelValue: { type: String, default: '' },
  id: { type: String, required: true },
  label: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const value = computed({ get: () => props.modelValue || '', set: (v) => emit('update:modelValue', v) })
const kind = computed(() => (/twitch\.tv/i.test(value.value) ? 'twitch' : /youtu(\.be|be\.com)/i.test(value.value) ? 'youtube' : null))
const valid = computed(() => !value.value.trim() || (kind.value && !!watchUrl(kind.value, value.value)))
</script>

<template>
  <div class="esu">
    <label class="form-label" :for="id">{{ label || $t('stream_input.label') }}</label>
    <div class="input-group">
      <span class="input-group-text" aria-hidden="true"><font-awesome-icon :icon="kind ? ['fab', kind] : ['fas', 'tower-broadcast']" /></span>
      <input :id="id" v-model.trim="value" type="url" class="form-control" :class="{ 'is-invalid': !valid }" maxlength="255" placeholder="https://www.youtube.com/watch?v=… · https://twitch.tv/…" :aria-describedby="id + '-hint'" />
    </div>
    <div :id="id + '-hint'" class="form-text" :class="{ 'text-danger': !valid }">{{ $t(valid ? 'stream_input.hint' : 'stream_input.invalid') }}</div>
  </div>
</template>
