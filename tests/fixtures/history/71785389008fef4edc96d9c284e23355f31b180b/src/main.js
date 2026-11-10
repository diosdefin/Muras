import { createApp, defineAsyncComponent } from 'vue'
import './style.css'

const base = import.meta.env.BASE_URL.replace(/\/$/, '')
const isAdmin = window.location.pathname.replace(/\/$/, '') === `${base}/admin`
// Separate loaders let Vite preload each route's own CSS dependencies.
const loadAdmin = () => import('./admin/AdminApp.vue')
const loadPublic = () => import('./App.vue')
const Root = defineAsyncComponent(isAdmin ? loadAdmin : loadPublic)
createApp(Root).mount('#app')
