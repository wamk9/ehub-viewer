<script setup>
import { ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import navbar from './components/general/navbar/navbar.vue'
import customFooter from './components/general/footer.vue'
import AppToast from './components/AppToast.vue'
import TopLoadingBar from './components/TopLoadingBar.vue'
import { useI18n } from 'vue-i18n'
const { locale, t } = useI18n()

const router = useRouter()
const pageLoading = ref(false)
let doneTimer = null

router.beforeEach(() => {
  clearTimeout(doneTimer)
  pageLoading.value = true
})
router.afterEach(() => {
  doneTimer = setTimeout(() => { pageLoading.value = false }, 350)
})
</script>

<template>
  <TopLoadingBar :active="pageLoading" />
  <template v-if="$route.meta.authPage">
    <RouterView :key="$route.path" />
    <AppToast />
  </template>
  <template v-else>
    <navbar />
    <div class="page-content">
      <RouterView :key="$route.path" />
    </div>
    <customFooter />
    <AppToast />
  </template>
</template>

<style>
html {
  overflow-x: clip;
}
body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: clip;
}
#app {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}
</style>
