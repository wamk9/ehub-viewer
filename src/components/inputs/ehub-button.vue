<template>
  <tooltip v-if="route == '#'" :title="title" :containerClass="containerClass" :containerStyle="containerStyle"
    @click="onClick">
    <button :disabled="disabled || loading" @onClick="onClick" :class="buttonClassComputed" :style="buttonStyle">
      <template v-if="loading">
        <font-awesome-icon class="me-3" :icon="['fas', 'spinner']" spin /> Aguarde um momento...
      </template>
      <template v-else>
        {{ text }}
      </template>
    </button>
  </tooltip>

  <tooltip v-else :title="title" :containerClass="containerClass" :containerStyle="containerStyle" @click="onClick">
    <a :href="route" :disabled="disabled || loading" @onClick="onClick" :class="buttonClassComputed"
      :style="buttonStyle">
      <template v-if="loading">
        <font-awesome-icon class="me-3" :icon="['fas', 'spinner']" spin /> Aguarde um momento...
      </template>
      <template v-else>
        {{ text }}
      </template>
    </a>
  </tooltip>
</template>

<script>
import tooltip from '@/components/general/tooltip/tooltip.vue'

export default {
  emits: ["click"],
  components: {
    tooltip
  },
  props: {
    route: {
      type: String,
      default: "#"
    },
    text: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
      required: false,
    },
    containerStyle: {
      type: String,
      default: "",
      required: false,
    },
    containerClass: {
      type: String,
      default: "",
      required: false,
    },
    buttonStyle: {
      type: String,
      default: "",
      required: false,
    },
    buttonClass: {
      type: String,
      default: "",
      required: false,
    },
  },
  mounted() {

  },
  computed: {
    buttonClassComputed() {
      return (this.disabled || this.loading ? "disabled " : "") + "round btn btn-primary px-4 " + this.buttonClass;
    },
  },
  methods: {
    onClick(event) {
      this.$emit('click', event.target.value);
    },
  },
}
</script>

<style scoped></style>