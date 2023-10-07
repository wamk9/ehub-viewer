<template>
  <div class="input-group mb-3">
    <span class="input-group-text" v-if="icon"><font-awesome-icon class="fa-fw" :icon="icon"/></span>
    <input
      :type="type"
      :name="name"
      class="form-control"
      :placeholder="placeholder"
      :aria-label="placeholder"
      :value="modelValue"
      @input="onInput"
      @change="onChange"
    >
  </div>
</template>

<script>
export default {
  props: {
    name: {
      type: String,
    },
    icon: {
      type: [String, Array]
    },
    placeholder: {
      type: String
    },
    modelValue: {
      type: String,
    },
    type: {
      type: String,
      default: 'text'
    }
  },
  computed: {
    iconClass() {
      if (Array.isArray(this.icon))
        return this.icon;
      else if (typeof this.icon == 'string')
        return 'fa-regular fa-' + this.icon;
      
      return '';
    }
  },
  /* Can add validation here
  watch: {
    value: {
      handler(newValue, oldValue) {

      },
    },
  }, */
  methods: {
    onInput(event) {
      // Can add validation here
      this.$emit('update:modelValue', event.target.value);
    },
    onChange(event) { // Supports .lazy
      // Can add validation here
      this.$emit('change', event.target.value);
    },
  },
}
</script>