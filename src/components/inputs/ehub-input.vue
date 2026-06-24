<script setup>
import { HueSlider } from 'vue-color';
import { i18n } from '@/helpers/i18n';
import demo from '@/helpers/frontend/demo'
</script>

<template>
  <div class="form-check" v-if="type == 'checkbox'">
    <input class="form-check-input" type="checkbox" :id="id" :checked="actualValue" @change="onChange" @input="onInput"
      @blur="onBlur">
    <label class="form-check-label text-ellipsis" :for="id">
      {{ label }}
    </label>
  </div>

  <div v-else-if="type == 'color'" class="mb-4">
    <label class="form-label" :for="id">
      {{ label }}
    </label>
    <span clas="my-4">
      <HueSlider :for="id" v-model="actualValue" @input="onInput" />
    </span>
  </div>

  <div class="form-check form-switch" v-else-if="type == 'switch'">
    <input class="form-check-input" type="checkbox" role="switch" :id="id" :checked="actualValue" @change="onChange"
      @input="onInput" @blur="onBlur">
    <label class="form-check-label text-ellipsis" :for="id">{{ actualValue ? checkedLabel : uncheckedLabel }}</label>
  </div>

  <template v-else>
    <label v-if="!!label" class="form-label" :for="id">
      {{ label }}
    </label>
    <div class="mb-3" :class="[!!icon ? 'input-group' : '', haveFeedback ? 'has-validation' : '']">
      <span class="input-group-text" v-if="!!icon">
        <font-awesome-icon class="fa-fw" :icon="icon" />
      </span>
      <div class="text-ellipsis" :class="floatingClass">

        <textarea v-if="type == 'textarea'" :id="id" class="form-control" :disabled="disabled" :name="name"
          :class="inputClass" :placeholder="placeholder" :aria-label="placeholder" :value="actualValue"
          @change="onChange" @input="onInput" @blur="onBlur"></textarea>

        <select v-else-if="type == 'select'" :id="id" class="form-select form-select" :disabled="disabled" :name="name"
          :class="inputClass" :value="actualValue" @change="onChange" @input="onInput" @blur="onBlur">
          <option value="" disabled selected hidden></option>
          <option v-for="(opt, index) in convertListValueToOption" :key="index" :value="opt.value">{{ opt.text }}
          </option>
        </select>

        <input v-else class="form-control" :id="id" :disabled="disabled" :type="type" :name="name" :class="inputClass"
          :placeholder="placeholder" :aria-label="placeholder" :value="actualValue" @change="onChange" @input="onInput"
          @blur="onBlur" />

        <label v-if="floating && !!placeholder" :for="id" class="form-label">
          {{ placeholder }}
        </label>

        <div v-if="haveFeedback && validationReturn.value" :class="feedbackClass">
          {{ i18n.t(validationReturn.value, validationReturn.variables) }}
        </div>
      </div>
    </div>
  </template>
</template>

<script>
export default {
  expose: ['forceValidate'],
  props: {
    // force execution of validation independent of input change
    // forceValidate: {
    //   type: Boolean,
    //   default: false
    // },
    maxLength: { // deprecated
      type: Number,
      default: 0
    },
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: null
    },
    checkedLabel: {
      type: String,
      default: null
    },
    uncheckedLabel: {
      type: String,
      default: null
    },
    option: {
      type: Array,
      default: []
    },
    name: {
      type: String,
    },
    icon: {
      type: [String, Array],
      default: null
    },
    placeholder: {
      type: String
    },
    modelValue: {
      type: null,
      default: null
    },
    type: {
      type: String,
      default: 'text'
    },
    floating: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    apiExternalValidation: { // deprecated, don't use it!
      type: Object,
      default: {
        type: null,
        text: ''
      }
    },
    validation: {
      type: Object,
      default: () => ({
        rewrite: false, // rewrite v-model (only regex)
        regex: /[\s\S]*/, // enable all characters, including new lines,
        apiEndpoint: null, // if setted, will check in API the value
        onBlur: false, // Validate if blur
        onInput: false, // Validate if input
        onChange: false, // Validate if changed
        i18nPath: null // if use i18n, set the path on validate object
      })
    }
  },
  data() {
    return {
      checkInputs: [
        'switch',
        'checkbox'
      ],
      actualValue: null,
      validationReturn: {
        value: null,
        variables: null,
        success: null
      },
      needsValidate: false,
    }
  },
  computed: {
    convertListValueToOption() {
      // Static values array in option.values
      if (Array.isArray(this.option?.values) && this.option.values.length > 0) {
        return this.option.values.map(item => ({
          value: item,
          text: this.option.i18nPath && i18n.te(`${this.option.i18nPath}.${item}`)
            ? i18n.t(`${this.option.i18nPath}.${item}`)
            : item
        }));
      }

      return [
        {
          value: '',
          text: this.option?.i18nPath ? i18n.t(`${this.option.i18nPath}.no-option`) : '-'
        }
      ];
    },
    floatingClass() {
      return (this.floating && !!this.placeholder) ? 'form-floating' : 'flex-grow-1';
    },
    iconClass() {
      if (Array.isArray(this.icon))
        return this.icon;
      else if (typeof this.icon == 'string')
        return 'fa-regular fa-' + this.icon;

      return '';
    },
    inputClass() {
      const base = 'form-control '
      if (this.validationReturn.success != null && !this.needsValidate)
        return `${base} ${this.validationReturn.success ? 'is-valid' : 'is-invalid'}`;
      else
        return base;
    },
    feedbackClass() {
      const base = 'order-last '
      if (this.validationReturn.success != null && !this.needsValidate)
        return `${base} ${this.validationReturn.success ? 'valid-feedback' : 'invalid-feedback'}`;
      else
        return base;
    },
    haveFeedback() {
      return this.validationReturn.success != null && !this.needsValidate ? true : false;
    }
  },
  methods: {
    onInput(event) {
      const valueToSend = this.getEventValue(event);
      this.$emit('update:modelValue', this.validation.onInput ? this.validateValue(valueToSend) : valueToSend);
    },
    onChange(event) {
      const valueToSend = this.getEventValue(event);
      this.$emit('change', this.validation.onChange ? this.validateValue(valueToSend) : valueToSend);
    },
    onBlur(event) {
      const valueToSend = this.getEventValue(event);
      this.$emit('blur', this.validation.onBlur ? this.validateValue(valueToSend) : valueToSend);
    },
    getEventValue(event) {
      if (this.checkInputs.includes(this.type)) {
        return event.target.checked;
      } else if (this.type == 'color') {
        return event;
      } else {
        return event.target.value;
      }
    },
    parseQuantifier(regex) {
      const quantifierMatch = regex.source.match(/\{(\d*),?(\d*)\}/);

      if (!quantifierMatch) return { min: null, max: null };

      const min = quantifierMatch[1] ? parseInt(quantifierMatch[1], 10) : null;
      const max = quantifierMatch[2] ? parseInt(quantifierMatch[2], 10) : null;

      return { min, max };
    },
    buildCleanFromValidation(validationRegex) {
      const source = validationRegex.source;

      let charClass = "";

      // Check if regex has a character class
      const charClassMatch = source.match(/\[.*?\]/);
      if (charClassMatch) {
        charClass = charClassMatch[0].slice(1, -1);
      } else {
        // Handle common shorthand classes
        if (source.includes("\\d")) charClass += "0-9";
        if (source.includes("\\.")) charClass += "\\."; // allow decimal point
      }

      if (!charClass) throw new Error("No character class found");

      const { min, max } = this.parseQuantifier(validationRegex);

      return {
        cleanRegex: new RegExp(`[^${charClass}]+`, "g"),
        min,
        max
      };
    },
    forceValidate() {
      this.validateValue(this.actualValue ?? '', true);
      return this.validationReturn.success;
    },
    validateValue(value, force = false) {
      if (value == this.actualValue && !force) return value;

      // reset validationReturn attribs
      this.validationReturn.value = null
      this.validationReturn.success = null;

      // Used to call both API and Regex check
      let newValue = value;

      // 0. Check by type
      if (this.type == 'checkbox') {
        // Simple check, only convert to true/false
        newValue = !!value;
      } else if (this.type == 'color') {
        // Need do it because when change page and don't have a value, we need one to color...
        let valueConv = parseInt(newValue, 10);
        if (isNaN(valueConv)) {
          valueConv = Math.round(Math.random() * 360);
        }
        newValue = Math.max(0, Math.min(360, valueConv));
      }

      // 1. Regex check (only if string/number)
      if (this.validation.regex && (typeof newValue === "string" || typeof newValue === "number")) {
        const regex = this.validation.regex; // e.g. /^[a-zA-Z0-9_-]{1,180}$/
        const { cleanRegex, min, max } = this.buildCleanFromValidation(regex);
        const regexValue = String(newValue).replace(cleanRegex, '');

        if (this.validation.rewrite) {
          newValue = (max !== null && !isNaN(max) && regexValue.length > max) ? regexValue.replace(new RegExp(`^(.{0,${max ?? ''}}).*`), '$1') : regexValue;
        } else if (regexValue != newValue) {
          this.validationReturn.value = `${this.validation.i18nPath}.regex`;
          this.validationReturn.success = false;

        } else if (max !== null && !isNaN(max) && regexValue.length > max) {
          this.validationReturn.value = `${this.validation.i18nPath}.max-length`;
          this.validationReturn.variables = { length: max };
          this.validationReturn.success = false;
        }

        if (min !== null && !isNaN(min) && newValue.length < min) {
          this.validationReturn.value = `${this.validation.i18nPath}.min-length`;
          this.validationReturn.variables = { length: min };
          this.validationReturn.success = false;
        }
      }

      if (this.validationReturn.success != null) {
        this.needsValidate = false;
        this.$emit('valid', this.validationReturn.success);
        return newValue;
      }


      // 2. API check (if apiEndpoint is provided)
      if (this.validation.apiEndpoint) {
        // try {
        //   const res = await fetch(this.validation.apiEndpoint, {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ value: newValue }),
        //   });
        //   const data = await res.json();

        //   if (!data.valid) {
        //      this.validationReturn.value = `${this.validation.i18nPath}.${data.reference}`;
        //      this.validationReturn.success = false;
        //   }
        // } catch (err) {
        //   this.validationReturn.value = "API request failed.";
        // }
      }

      this.needsValidate = false;
      this.validationReturn.success = true;
      this.$emit('valid', this.validationReturn.success);
      return newValue;
    }
  },
  mounted() {
    if (this.modelValue != null) this.actualValue = this.modelValue;
  },
  beforeUpdate() {
    this.$emit('update:modelValue', this.needsValidate ? this.validateValue(this.actualValue) : this.actualValue);
  },
  watch: {
    modelValue: {
      handler(newUpdates, oldUpdates) {
        this.needsValidate = oldUpdates != newUpdates;
        this.actualValue = this.validateValue(newUpdates);
      },
      deep: true
    },
  }
}
</script>

<style scoped>
.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.input-group-text {
  background: var(--ehub-field-bg);
  color: var(--ehub-muted);
  border-color: var(--ehub-line);
  border-right: 0;
  transition: border-color .15s, color .15s;
}

/* Bootstrap input-group não alcança .form-control dentro do wrapper div */
.input-group .flex-grow-1>.form-control,
.input-group .flex-grow-1>.form-select {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-left: 0;
}

.input-group>.input-group-text {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.input-group:focus-within .input-group-text {
  border-color: var(--ehub-primary);
  color: var(--ehub-primary);
}

.input-group:has(.form-control.is-valid) .input-group-text {
  border-color: var(--bs-success);
  color: var(--bs-success);
}

.form-control.is-valid,
.was-validated .form-control:valid {
  border-color: var(--bs-success);
}

.input-group:has(.form-control.is-invalid) .input-group-text {
  border-color: var(--bs-danger);
  color: var(--bs-danger);
}

.form-control.is-invalid,
.was-validated .form-control:invalid {
  border-color: var(--bs-danger);
}
</style>