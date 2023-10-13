import { createRouter, createWebHistory } from 'vue-router'
import API from '../helpers/ApiConnection.js';
import store from '@/store';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home.vue')
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/views/auth/auth.vue')
    },
    {
      path: '/league/:leagueRoute',
      name: 'show-especific-league-info',
      component: () => import('@/views/league/show.vue')
    },
    {
      path: '/league/:leagueRoute/tournament/create',
      name: 'create-tournament',
      component: () => import('@/views/tournament/create.vue')
    },
    {
      path: '/league/:leagueRoute/tournament/:tournamentRoute',
      name: 'show-especific-tournament-info',
      component: () => import('@/views/tournament/show.vue')
    },
    {
      path: '/league/create',
      name: 'create-league',
      component: () => import('@/views/league/create.vue'),
      meta: {
        requiresAuth: true
      }
    },
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
