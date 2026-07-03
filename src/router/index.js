import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store';
const eventManageRoutes = [
  'general',
  'stages',
  'participants',
  'remove',
  'notifications',
  'news'
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'presentation',
      component: () => import('@/views/presentation.vue')
    },
    {
      path: '/events',
      name: 'events',
      component: () => import('@/views/home.vue')
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/search.vue')
    },
    {
      path: '/pricing',
      name: 'pricing',
      component: () => import('@/views/pricing.vue')
    },
    {
      path: '/auth/return',
      name: 'auth-return',
      component: () => import('@/views/auth/return.vue'),
      meta: { authPage: true }
    },
    {
      path: '/register',
      name: 'user-register',
      component: () => import('@/views/user/register.vue'),
      meta: { authPage: true }
    },
    {
      path: '/login',
      name: 'user-login',
      component: () => import('@/views/user/login.vue'),
      meta: { authPage: true }
    },
    {
      path: '/profile',
      name: 'user-profile',
      component: () => import('@/views/user/profile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/profile/:username',
      name: 'public-profile',
      component: () => import('@/views/user/public-profile.vue')
    },
    {
      path: '/orgs',
      name: 'organizations',
      component: () => import('@/views/org/index.vue')
    },
    {
      path: '/teams',
      name: 'teams',
      component: () => import('@/views/teams/index.vue')
    },
    {
      path: '/my-teams',
      name: 'my-teams',
      component: () => import('@/views/teams/mine.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/create-team',
      name: 'create-team',
      component: () => import('@/views/teams/create.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/team/:teamRoute',
      name: 'team-show',
      component: () => import('@/views/teams/show.vue')
    },
    {
      path: '/team/:teamRoute/manage/:tab?',
      name: 'team-manage',
      component: () => import('@/views/teams/manage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/my-orgs',
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
      path: '/org/:orgRoute/:tab?',
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
      component: () => import('@/views/org/manage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/org/:orgRoute/manage/members',
      name: 'manage-organization-members',
      component: () => import('@/views/org/manage.vue'),
      props: () => ({ forceOption: ['members'] }),
      meta: { requiresAuth: true }
    },
    {
      path: '/org/:orgRoute/manage/finances',
      name: 'manage-organization-finances',
      component: () => import('@/views/org/manage.vue'),
      props: () => ({ forceOption: ['finances'] }),
      meta: { requiresAuth: true }
    },
    {
      path: '/org/:orgRoute/manage/reports',
      name: 'manage-organization-reports',
      component: () => import('@/views/org/manage.vue'),
      props: () => ({ forceOption: ['reports'] }),
      meta: { requiresAuth: true }
    },
    {
      path: '/org/:orgRoute/manage/settings',
      name: 'manage-organization-settings',
      component: () => import('@/views/org/manage.vue'),
      props: () => ({ forceOption: ['settings'] }),
      meta: { requiresAuth: true }
    },
    {
      path: '/invite/accept/:token',
      name: 'invite-accept',
      component: () => import('@/views/invite/accept.vue')
    },
    {
      path: '/payment/gateway/error',
      name: 'payment-gateway-error',
      component: () => import('@/views/payment/gateway-error.vue')
    },
    {
      path: '/org/:orgRoute/manage/events/:eventRoute?/:eventRouteMenu?',
      name: 'manage-organization-events',
      component: () => import('@/views/org/manage.vue'),
      props: route => ({ forceOption: ['events'] }),
      meta: { requiresAuth: true }
    },
    {
      path: '/org/:orgRoute/manage/events/:eventRoute/:eventRouteMenu?',
      name: 'manage-organization-events-stages',
      component: () => import('@/views/org/manage.vue'),
      props: route => ({ forceOption: ['events'] }),
      meta: { requiresAuth: true }
    },
    {
      path: '/org/:orgRoute/manage/create-event/:eventRoute?',
      name: 'manage-organization-events-create',
      component: () => import('@/views/org/manage.vue'),
      props: route => ({ forceOption: ['events'] }),
      meta: { requiresAuth: true }
    },
    {
      path: '/org/:orgRoute/event/:eventRoute',
      name: 'show-event-info',
      component: () => import('@/views/event/show.vue')
    },
    {
      path: '/org/:orgRoute/event/:eventRoute/news/:articleSlug',
      name: 'show-event-article',
      component: () => import('@/views/event/article.vue')
    },
...eventManageRoutes.map(menu => ({
    path: `/org/:orgRoute/manage/events/:eventRoute/${menu}`,
    name: `manage-organization-events-${menu}`,
    component: () => import("@/views/org/manage.vue"),
    props: route => ({ forceOption: ['events'] }),
    meta: { requiresAuth: true }
  })),
  {
    path: '/error',
    name: 'error-page',
    component: () => import('@/views/error.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/error.vue')
  }
  ]
})

window.addEventListener('ehub:unauthorized', () => {
  store.dispatch('removeToken');
  const current = router.currentRoute.value;
  if (current.matched.some(r => r.meta.requiresAuth)) {
    localStorage.setItem('lastKnowRoute', JSON.stringify({ name: current.name, params: current.params, query: current.query }));
    router.push({ name: 'user-login' });
  }
});

router.beforeEach((to, from, next) => {
  const authRoutes = ['user-login', 'user-register', 'auth-return']

  // Save last know route to redirect case user don't have a token.
  if (!to.matched.some(record => authRoutes.includes(record.name)))
    localStorage.setItem("lastKnowRoute", JSON.stringify({ name: to.name, params: to.params, query: to.query }));

  // If user don't have a token and page requires.
  if (to.matched.some(record => record.meta.requiresAuth) && !store.getters.getToken) {
    next({ name: 'user-login' });
    return;
  }

  // Used after login or on access auth page with an token, send user to last know page.
  if (to.matched.some(record => authRoutes.includes(record.name)) && !!store.getters.getToken) {
    if (to.name === 'auth-return' && to.query.remember === 'prompt') {
      next()
      return
    }
    next(localStorage.getItem("lastKnowRoute") != null ? JSON.parse(localStorage.getItem("lastKnowRoute")) : { name: 'events' })
    return;
  }

  next();
})



export default router
