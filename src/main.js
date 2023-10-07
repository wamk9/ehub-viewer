import '@/assets/main.css'

import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import FontAwesomeIcon from '@/helpers/General/FontAwesomeIcons.js'
import store from '@/store';
import VueCookies from 'vue-cookies'

const app = createApp(App)
  .component("font-awesome-icon", FontAwesomeIcon)
  .use(router)
  .use(store)
  .use(VueCookies, { expires: '7d'})
  .mount('#app');