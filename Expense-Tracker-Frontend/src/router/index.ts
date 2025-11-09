import { createRouter, createWebHistory } from 'vue-router'
import { navigationGuard } from '@okta/okta-vue'
import HomeView from '../views/HomeView.vue'
import CallbackView from '../views/CallbackView.vue'
import { isOktaConfigured } from '@/okta'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: isOktaConfigured ? { requiresAuth: true } : {},
    },
    { path: '/callback', component: CallbackView },
  ],
})

if (isOktaConfigured) {
  router.beforeEach(navigationGuard)
} else {
  console.info('Okta navigation guard disabled; routes accessible without authentication.')
}
export default router
