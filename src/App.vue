<script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import navbar from './components/general/navbar/navbar.vue'
</script>

<template>
<navbar/>

<div class="container">
    <div class="row justify-content-center">
        <RouterView/>
    </div>
</div>

</template>

<style>
body {
    min-height: 100vh;
    background-image: url('https://cdn.pixabay.com/photo/2014/11/15/13/13/sports-ground-531919_960_720.jpg') !important;
    background-size: cover;
    backdrop-filter: blur(20px) saturate(0%);
}

.container {
    display: flex;
}

.row {
    display: flex;
    flex-grow: 1;
}

.container > .row {
    min-height: calc(100vh + -91px);
}
</style>