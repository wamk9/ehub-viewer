import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  // OneDrive locks node_modules/.vite while syncing; VITE_CACHE_DIR moves the cache out of it.
  cacheDir: process.env.VITE_CACHE_DIR || 'node_modules/.vite',
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: '../ehub-api/public',
    emptyOutDir: false,
  },
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
