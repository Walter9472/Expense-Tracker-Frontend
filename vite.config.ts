import { fileURLToPath, URL } from 'node:url'
import { createRequire } from 'node:module'

import { defineConfig, type PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'

const require = createRequire(import.meta.url)

// https://vite.dev/config/
export default defineConfig(() => {
  const plugins: PluginOption[] = [vue()]

  if (process.env.NODE_ENV === 'development') {
    const { default: vueDevTools } = require('vite-plugin-vue-devtools')
    plugins.push(vueDevTools as PluginOption)
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
