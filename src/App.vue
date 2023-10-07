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
    background-color: #949fa4;
    min-height: 100vh;
}

.container {
    display: flex;
}

.row {
    min-height: calc(100vh + -91px);
    display: flex;
    flex-grow: 1;
}
</style>