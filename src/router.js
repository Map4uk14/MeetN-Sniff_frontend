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

router.beforeEach((to) => {
  const isAuthenticated = !!localStorage.getItem('token')

  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/login'
  }

  if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    return '/'
  }
})

export default router
