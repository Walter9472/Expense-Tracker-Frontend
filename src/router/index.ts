import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { isAuthenticated } from '../service/authService'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true } // Hinzufügen!

    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true } // Nur für nicht-angemeldete Benutzer
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresGuest: true }
    }

  ],
})

router.beforeEach((to, from, next) =>{
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  const authenticated = isAuthenticated()

  if(requiresAuth && !authenticated){
    // Geschützte Route, aber nicht angemeldet → Login
    next('/login')
  }else if(requiresGuest && authenticated){
    // Login/Register, aber bereits angemeldet → Home
    next('/')
  }else {
    next()
  }
})
export default router
