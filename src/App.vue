<script setup>
import { RouterView } from 'vue-router'
import navbar from './components/general/navbar/navbar.vue'
import customFooter from './components/general/footer.vue'
import AppToast from './components/AppToast.vue'
import { useI18n } from 'vue-i18n'
const { locale, t } = useI18n()
</script>

<template>
    <navbar />
    <div class="page-content">
      <RouterView :key="$route.fullPath" />
    </div>
    <customFooter />
    <AppToast />
</template>

<style>
.page-content {
    padding-top: 80px;
}

@media (max-width: 991.98px) {
    .page-content {
        padding-top: 0;
        padding-bottom: 72px;
    }
}

main.container {
    margin-top: 50px;
    margin-bottom: 50px;
    min-height: calc(100vh - 100px - 75px);
}
</style>