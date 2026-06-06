<template>
<div id="timeline-wrap">
  <div id="timeline"></div>  
  <div :class="markerActive(index)" :style="markerStylePos(index)" v-for="(item, index) in items" :key="item.name">
    <font-awesome-icon :icon="item.icon"></font-awesome-icon>
  </div>
</div>
</template>
    <script>
    export default {
    props: {
        items: {
            type: Array,
            required: true,
        },
        modelValue: {
          type: Number,
        },
    },
    data() {
        return {
            pooperInstance: {},
        };
    },
    mounted() {
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
        markerStylePos(index) {
            const totalItems = this.items.length;
            return {
                top: '-25px',
                left: (100 / (totalItems - 1) * index) + '%'
            };
        },
        markerActive(index) {
          const defaultClass = 'marker timeline-icon ';
          if (index < this.modelValue)
            return defaultClass + ' finished'
          else if (index == this.modelValue)
            return defaultClass + ' on-this'
          else
            return defaultClass;
        },
        onClick(value) {
      // Can add validation here
      this.$emit('update:modelValue', value);
    },
    },
}
    </script>
  
<style scoped>
#timeline-wrap{
  margin-bottom:5rem;
  margin-top: 3rem;
  position:relative;
}

#timeline{
  height:1px;
  width: 100%;
  background-color:#aabbc4;
  position:relative;
 
}

 .marker{
   z-index:1000;
   color: #fff;
  width: 50px;
  height: 50px;
  line-height: 50px;
  font-size: 1.4em;
  text-align: center;
  position: absolute;
  margin-left: -25px;
  background-color: #999999;
  border-radius: 50%;
        }

 .marker:hover{
   -moz-transform: scale(1.2);
-webkit-transform: scale(1.2);
-o-transform: scale(1.2);
-ms-transform: scale(1.2);
transform: scale(1.2);
   
   -webkit-transition: all 300ms ease;
-moz-transition: all 300ms ease;
-ms-transition: all 300ms ease;
-o-transition: all 300ms ease;
transition: all 300ms ease;
 }


 .timeline-icon.finished {
    background-color: #0099DA !important;
}
.timeline-icon.on-this {
    background-color: #0099DA !important;
}
</style>