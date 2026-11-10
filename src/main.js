import { createApp, defineAsyncComponent } from 'vue'
import './style.css'

const base = import.meta.env.BASE_URL.replace(/\/$/, '')
const isAdmin = window.location.pathname.replace(/\/$/, '') === `${base}/admin`
// Separate loaders let Vite preload each route's own CSS dependencies.
const loadAdmin = import.meta.env.DEV && __MURAS_LOCAL_ADMIN__
  ? () => import('./admin/AdminApp.vue')
  : () => import('./admin/Unavailable.vue')
const loadPublic = () => import('./App.vue')
const Root = defineAsyncComponent(isAdmin ? loadAdmin : loadPublic)
createApp(Root).mount('#app')
// Offline support: the worker only exists in production builds and never covers the admin page.
if (import.meta.env.PROD && !isAdmin && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` }).catch(() => {}) })
}
// The public app hides the splash once its catalog is in; the editor has nothing to wait for.
if (isAdmin) window.murasHideSplash?.()
