<template>
  <div class="color-picker">
    <div class="cp-swatches">
      <button
        v-for="sw in swatches"
        :key="sw"
        type="button"
        class="cp-swatch"
        :class="{ 'cp-swatch--sel': internalColor.toLowerCase() === sw.toLowerCase() }"
        :style="{ background: sw }"
        :title="sw"
        @click="pick(sw)"
      />
      <label class="cp-native-wrap" :title="$t('pages.teams.manage.settings.color')">
        <input type="color" :value="internalColor" class="cp-native" @input="onNative" />
        <font-awesome-icon :icon="['fas', 'palette']" />
      </label>
    </div>

    <div class="cp-hex-row">
      <span class="cp-hex-prefix">#</span>
      <input
        type="text"
        class="form-control cp-hex-input"
        :class="{ 'is-invalid': hexError }"
        maxlength="6"
        :value="hexRaw"
        placeholder="0098D8"
        @input="onHexInput"
        @blur="onHexBlur"
      />
    </div>
  </div>
</template>

<script>
const HEX_RE = /^#?([0-9a-fA-F]{6})$/;

export default {
  props: {
    modelValue: { type: String, default: '#0098D8' },
    swatches:   { type: Array,  default: () => ['#0098D8', '#e23b3b', '#7C3AED', '#d6336c', '#f08c00', '#1f8a5b', '#495057', '#0f172a'] },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      internalColor: this.modelValue || '#0098D8',
      hexError: false,
    };
  },
  computed: {
    hexRaw() {
      return this.internalColor.replace('#', '');
    },
  },
  watch: {
    modelValue(val) {
      if (val && HEX_RE.test(val)) {
        this.internalColor = val.startsWith('#') ? val : `#${val}`;
      }
    },
  },
  methods: {
    pick(hex) {
      this.hexError = false;
      this.internalColor = hex;
      this.$emit('update:modelValue', hex);
    },
    onNative(e) {
      this.pick(e.target.value);
    },
    onHexInput(e) {
      const raw = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
      e.target.value = raw;
      this.hexError = false;
      if (raw.length === 6) {
        this.internalColor = `#${raw}`;
        this.$emit('update:modelValue', `#${raw}`);
      }
    },
    onHexBlur(e) {
      const raw = e.target.value.replace(/[^0-9a-fA-F]/g, '');
      if (raw.length > 0 && raw.length < 6) {
        this.hexError = true;
      }
    },
  },
};
</script>

<style scoped>
.color-picker {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: fit-content;
}

.cp-swatches {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cp-swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2.5px solid transparent;
  cursor: pointer;
  padding: 0;
  transition: transform .15s, border-color .15s;
  flex-shrink: 0;
}

.cp-swatch:hover {
  transform: scale(1.15);
}

.cp-swatch--sel {
  border-color: var(--ehub-primary, #0098D8);
  transform: scale(1.15);
}

.cp-native-wrap {
  position: relative;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px dashed var(--ehub-line);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--ehub-muted);
  font-size: 12px;
  flex-shrink: 0;
  transition: border-color .15s, color .15s;
}

.cp-native-wrap:hover {
  border-color: var(--ehub-primary, #0098D8);
  color: var(--ehub-primary, #0098D8);
}

.cp-native {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  border: none;
  padding: 0;
}

.cp-hex-row {
  display: flex;
  align-items: center;
  width: 100%;
}

.cp-hex-prefix {
  background: var(--ehub-field-bg, var(--ehub-bg));
  border: 1px solid var(--ehub-line);
  border-right: none;
  height: 36px;
  line-height: 36px;
  padding: 0 8px;
  border-radius: 8px 0 0 8px;
  color: var(--ehub-muted);
  font-size: 13px;
  font-weight: 600;
  user-select: none;
  flex-shrink: 0;
}

.cp-hex-input {
  border-radius: 0 8px 8px 0 !important;
  height: 36px;
  font-family: monospace;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: .5px;
  flex: 1;
}
</style>
