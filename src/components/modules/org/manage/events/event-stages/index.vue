<script setup>
import eventStagesList from './list.vue';
</script>

<template>
    <div class="row" v-if="show">
        <div class="col-12">
            <eventStagesList :event="event" :orgRoute="$route.params.orgRoute" />
        </div>
    </div>
</template>

<script>
export default {
    props: {
        event: { type: Object, default: () => ({}) },
        show:  { type: Boolean, required: true },
    },
}
</script>

<style scoped></style>
