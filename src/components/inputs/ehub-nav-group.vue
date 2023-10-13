<script setup>
// import ehubButton from '@/components/inputs/ehub-button.vue';
// import router from '@/router';
</script>

<template>
<nav v-if="hasHref" :id="id" :class="className">
    <a v-for="button in buttons" :id="button.id" :href="button.href" class="nav-link">{{ button.title}}</a>
</nav>

<nav v-else :id="id" :class="className">
    <button v-for="button in buttons" :id="button.id" type="button" class="nav-link" @click="executeAction(button.id)">{{ button.title}}</button>
</nav>
</template>

<script>
export default {
    props: {
      id: {
        type: String,
      },
      buttons: {
          type: Array,
          required:true,
      },
      stickyNav: {
        type: Boolean,
        default: false,
      },
      columnNav: {
        type: Boolean,
        default: false,
      },
      navType: {
        type: String,
        default: 'pills',
      }
    },
  data() {
    return {
      activeId : "",
      hasHref: false,
    }
  },
  computed: {
    className() {
      let className = 'nav nav-' + this.navType + ' nav-justified';
      className += this.stickyNav ? ' sticky-nav' : '';
      className += this.columnNav ? ' flex-column' : '';
        return className;
    },
  },

  mounted() {
    this.buttons.forEach((button) => {
      this.hasHref = button.href ? true : false;

      if (button.active)
        this.executeAction(button.id);

      if (button.disabled)
        document.getElementById(button.id).classList.add('disabled');
    });
  },
  methods: {
    executeAction(elementId) {
        if (this.scrollSpy)
          return;

        if (!elementId) {
            console.error('Insert ID of nav on ehub-list-group.');
            return;
        }

        if (!!this.activeId)
            document.getElementById(this.activeId).classList.remove('active');
        
        this.activeId = elementId;
        document.getElementById(this.activeId).classList.add('active');
        this.$emit('update:activeId', this.activeId);
        this.$emit(this.activeId + '_btn')
    },
  },
}
</script>

<style scoped>
</style>

<style scoped>
.sticky-nav {
  position: sticky;
  top: 10px;
}
</style>

<style>

</style>