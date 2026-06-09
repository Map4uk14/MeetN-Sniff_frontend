import { createRouter, createWebHistory } from 'vue-router'

// Route components
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'

const routes = [
  {
    path: '/',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/register',
    component: Register,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token')

  if (to.meta.requiresAuth && !isAuthenticated) {
    // If the route requires auth and user is logged out force them to the login view
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    // If the user is already logged in don't let them go back to auth pages
    next('/')
  } else {
    // Otherwise carry on
    next()
  }
})

export default router
