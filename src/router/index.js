import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import AboutMe from '../components/AboutMe.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: AboutMe
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
