import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store';
const eventManageRoutes = [
  'general',
  'stages',
  'participants',
  'remove',
  'notifications'
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home.vue')
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/search.vue')
    },
    {
      path: '/register',
      name: 'user-register',
      component: () => import('@/views/user/register.vue')
    },
    {
      path: '/login',
      name: 'user-login',
      component: () => import('@/views/user/login.vue')
    },
    {
      path: '/profile',
      name: 'user-profile',
      component: () => import('@/views/user/profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/organizations/mine',
      name: 'my-organizations',
      component: () => import('@/views/org/mine.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/create-org',
      name: 'create-organization-info',
      component: () => import('@/views/org/create.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/org/:orgRoute',
      name: 'show-organization-info',
      component: () => import('@/views/org/show.vue')
    },
    {
      path: '/org/:orgRoute/news/:newsRoute',
      name: 'news-organization-info',
      component: () => import('@/views/org/news.vue')
    },
    {
      path: '/org/:orgRoute/manage/',
      name: 'manage-organization',
      component: () => import('@/views/org/manage.vue')
    },
    {
      path: '/org/:orgRoute/manage/events/:eventRoute?/:eventRouteMenu?',
      name: 'manage-organization-events',
      component: () => import('@/views/org/manage.vue'),
      props: route => ({
        forceOption: ['events']
      })
    },
    {
      path: '/org/:orgRoute/manage/events/:eventRoute/:eventRouteMenu?',
      name: 'manage-organization-events-stages',
      component: () => import('@/views/org/manage.vue'),
      props: route => ({
        forceOption: ['events']
      })
    },
    {
      path: '/org/:orgRoute/manage/create-event',
      name: 'manage-organization-events-create',
      component: () => import('@/views/org/manage.vue'),
      props: route => ({
        forceOption: ['events']
      })
    },
    {
      path: '/org/:orgRoute/event/:eventRoute',
      name: 'show-event-info',
      component: () => import('@/views/event/show.vue')
    },
    {
      path: '/org/:orgRoute/event/:eventRoute/manage',
      name: 'manage-event-info',
      component: () => import('@/views/event/manage.vue')
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
    // {
    //   path: '/league/:leagueRoute/tournament/:tournamentRoute',
    //   name: 'show-especific-tournament-info',
    //   component: () => import('@/views/tournament/show.vue')
    // },
    {
      path: '/league/create',
      name: 'create-league',
      component: () => import('@/views/league/create.vue'),
      meta: {
        requiresAuth: true
      }
    },
    ...eventManageRoutes.map(menu => ({
    path: `/org/:orgRoute/manage/events/:eventRoute/${menu}`,
    name: `manage-organization-events-${menu}`,
    component: () => import("@/views/org/manage.vue"),
    props: route => ({
        forceOption: ['events']
      })
  }))
  ]
})

router.beforeEach((to, from, next) => {
  // Save last know route to redirect case user don't have a token.
  if (!to.matched.some(record => record.name == 'auth'))
    localStorage.setItem("lastKnowRoute", JSON.stringify(to));

  // If user don't have a token and page requires.
  if (to.matched.some(record => record.meta.requiresAuth) && !store.getters.getToken) {
    next({ name: 'user-login' });
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
