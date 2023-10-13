<template>
    <button v-if="route == '#'" @onClick="onClick" :class="className">
        <span v-if="disabled">
            <font-awesome-icon class="me-3" :icon="['fas', 'spinner']" spin /> Aguarde um momento...
        </span>
        <span v-else>
            {{ text }}
        </span>
    </button>
    
    <a v-else :href="route" @onClick="onClick" :class="className">
        <span v-if="disabled">
            <font-awesome-icon class="me-3" :icon="['fas', 'spinner']" spin /> Aguarde um momento...
        </span>
        <span v-else>
            {{ text }}
        </span>
    </a>
</template>
  
<script>
export default {
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
    },
    mounted() {

    },
    computed: {
        className() {
            return (this.disabled ? "disabled " : "") + "round btn btn-primary px-4";
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
        onClick(event) {
            this.$emit('click', event.target.value);
        },
    },
  }
</script>

<style scoped>
</style>