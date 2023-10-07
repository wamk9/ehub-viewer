<template>
  <li class="nav-item iconChange me-4 pt-2" :style="hoverVarStyle">
      <a :href="route" class="nav-link text-center  p-0">
          <div class=" d-flex align-items-center overflow-hidden changeWidth mx-auto">
            <font-awesome-icon class="iconHeight mx-2" :icon="icon"/>
          </div>
          <div class="smallFont textColor">{{ name }}</div>
      </a>
  </li>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  hoverColor: {
    type: String,
    required: true
  },
  icon: {
    type: [String, Array],
    required: true
  },
  route: {
    type: String,
    default: "#"
  },
});
</script>

<script>
 export default {
  data() {
    return {

    }
  },
  computed: {
    hoverVarStyle() {
      return {'--hover-color' : this.hoverColor};
    }
  }
 }
</script>

<style scoped>
  .nav-item {
    color: #fafafa !important;
  }
  
  .nav-item:hover {
    color: var(--hover-color) !important;
  }

  .iconChange:after {
    content: "";
    display: block;
    margin: auto;
    height: 3px;
    width: 0px;
    background: transparent;
    transition: all 0.5s ease;
  }

  .iconChange:hover::after {
    width: 100%;
    background: var(--hover-color);
  }

  .iconHeight {
      height: 22px;
      width: 22px;
  }

  .iconChange:hover a {
      color: var(--hover-color);
  }
</style>