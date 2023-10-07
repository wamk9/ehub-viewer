import { createRouter, createWebHistory } from 'vue-router'
import API from '../helpers/ApiConnection.js';
import store from '@/store';

import HomeView from '../views/HomeView.vue'
import AuthView from '../views/auth/AuthView.vue'
import LoginView from '../views/auth/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthView
    },
    {
      path: '/auth/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/league/create',
      name: 'create-league',
      component: HomeView,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  // Save last know route to redirect case user don't have a token.
  if (!to.matched.some(record => record.name == 'auth'))
    localStorage.setItem("lastKnowRoute", JSON.stringify(to));

  // If user don't have a token and page requires.
  if (to.matched.some(record => record.meta.requiresAuth) && !store.getters.getToken) {
    next({ name: 'auth' });
    return;
  }
  
  // Used after login or on access auth page with an token, send user to last know page.
  if (to.matched.some(record => record.name == 'auth') && !!store.getters.getToken) {
    next(localStorage.getItem("lastKnowRoute") != null ? JSON.parse(localStorage.getItem("lastKnowRoute")) : { name: 'home' })
    return;
  }

  next();
})



export default router
