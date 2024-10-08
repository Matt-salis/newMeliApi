import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/busqueda-productos',
      name: 'busqueda-productos',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/busqueda-productos.vue')
    },
    {
      path: '/busqueda-usuarios',
      name: 'busqueda-usuarios',
      component: () => import('../views/busqueda-usuarios.vue')
    },
    {
      path: '/cambios-precios',
      name: 'cambios-precios',
      component: () => import('../views/cambios-precios.vue')
    },
    {
      path: '/competencia',
      name: 'competencia',
      component: () => import('../views/competencia.vue')
    }
  ]
})

export default router
