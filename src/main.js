import '@/assets/main.css'

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from '@/App.vue'
import router from '@/router'
import FontAwesomeIcon from '@/helpers/General/FontAwesomeIcons.js'
import store from '@/store';
import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';
import i18n from '@/helpers/i18n/init.js'
import 'vue-color/style.css';
import hueColor from '@/helpers/General/hueColor';

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})
const app = createApp(App)
  .component("font-awesome-icon", FontAwesomeIcon)
  .component('loading', Loading, { props: { "background-color": '#000000', opacity: 0.5, color: '#ffffff', "lock-scroll": true } })
  .use(router)
  .use(store)
  .use(i18n)
  .use(hueColor)
  .mount('#app');