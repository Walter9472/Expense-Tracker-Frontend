import { createRouter, createWebHistory } from 'vue-router'
import { navigationGuard } from '@okta/okta-vue'
import HomeView from '../views/HomeView.vue'
import CallbackView from '../views/CallbackView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true } },
    { path: '/callback', component: CallbackView },
  ],
})

router.beforeEach(navigationGuard)
export default router
