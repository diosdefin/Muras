import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  define: { __MURAS_LOCAL_ADMIN__: 'false' },
})
