// samples/vue3-vuetify-msal/src/router/index.ts

import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import(/* webpackChunkName: "profile" */ '@/views/Profile.vue'),
        meta: {
          requiresAuth: true,
          //popupLogoutFallback: '/',
        },
      },
      {
        path: 'profile-no-guard',
        name: 'ProfileNoGuard',
        component: () => import(/* webpackChunkName: "profile-no-guard" */ '@/views/ProfileNoGuard.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

export default router
