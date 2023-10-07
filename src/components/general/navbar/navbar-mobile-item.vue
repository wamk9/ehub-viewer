<template>
  <a :href="route" class="text-decoration-none textColor  text-center">
    <font-awesome-icon class="iconHeight mb-1" :icon="icon"/>
    <div class="extraSmallFont pb-1">{{ name }}</div>
  </a>
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
</style>