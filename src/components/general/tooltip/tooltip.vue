<template>
  <span ref="button" id="button" aria-describedby="tooltip" :class="containerClass" :style="containerStyle" @click="onClick">
    <slot></slot>
  </span>
  <span v-if="title.length" ref="tooltip" id="tooltip" role="tooltip" :data-pooper-placement="placement">
    {{ title }}
    <div id="arrow" data-popper-arrow></div>
  </span>
</template>
    
  <script>
  import { createPopper } from '@popperjs/core';
  
  export default {
    emits: ["click"],
    props: {
      title: {
        type: String,
        default: '',
        required: false,
      },
      placement: {
        type: String,
        default: 'bottom',
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
    },
    data() {
      return {
        pooperInstance: {},
      };
    },
    mounted() {

      if (!!this.title.length) {
        const showEvents = ['mouseenter', 'focus'];
        const hideEvents = ['mouseleave', 'blur'];

        this.popperInstance = createPopper(this.$refs.button, this.$refs.tooltip, {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, 12],
              },
            },
          ],
        });

        showEvents.forEach((event) => {
          this.$refs.button.addEventListener(event, this.show);
        });

        hideEvents.forEach((event) => {
          this.$refs.button.addEventListener(event, this.hide);
        });
      }
    },
    computed: {
      className() {
        return (this.disabled || this.loading ? "disabled " : "") + "round btn btn-primary px-4";
      }
    },
    methods: {
      onClick(event) {
        this.$emit('click', event);
      },
      show() {
        this.$refs.tooltip.setAttribute('data-show', '');
        this.popperInstance.update();
      },
      hide() {
        this.$refs.tooltip.removeAttribute('data-show', '');
      },
    }
  }
  </script>
  
<style scoped>
  #tooltip {
    background: #333;
    color: white;
    font-weight: bold;
    padding: 4px 8px;
    font-size: 13px;
    border-radius: 4px;
    display: none;
  }

  #tooltip[data-show] {
    display: block;
  }

  #arrow,
  #arrow::before {
    position: absolute;
    width: 8px;
    height: 8px;
    background: inherit;
  }

  #arrow {
    visibility: hidden;
  }

  #arrow::before {
    visibility: visible;
    content: '';
    transform: rotate(45deg);
  }

  #tooltip[data-popper-placement^='top'] > #arrow {
    bottom: -4px;
  }

  #tooltip[data-popper-placement^='bottom'] > #arrow {
    top: -4px;
  }

  #tooltip[data-popper-placement^='left'] > #arrow {
    right: -4px;
  }

  #tooltip[data-popper-placement^='right'] > #arrow {
    left: -4px;
  }
</style>