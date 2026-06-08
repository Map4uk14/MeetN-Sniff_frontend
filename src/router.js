import { createRouter, createWebHistory } from 'vue-router'

// Route components
import Home from './views/Home.vue'
import Login from './views/Login.vue'

const routes = [
  {
    path: '/',
    component: Home,
    meta: { requiresAuth: true}
  },
  {
    path: '/login',
    component: Login,
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
  } else if (to.path === '/login' && isAuthenticated) {
    // If the user is already logged in dont let them go back to the login page
    next('/')
  } else {
    // Otherwise carry on
    next()
  }
})

export default router
