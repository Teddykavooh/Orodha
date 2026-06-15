import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite configuration for Orodha frontend.
 * 
 * Includes:
 * - React plugin with JSX transformation
 * - CSS processing with PostCSS (Tailwind)
 * - Dev server proxy to Django backend
 * - Build optimizations
 * - Environment variable configuration via .env
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:8000'
  const wsTarget = env.VITE_WS_TARGET || 'ws://localhost:8000'
  const apiPrefix = env.VITE_API_PREFIX || '/api'
  const wsPrefix = env.VITE_WS_PREFIX || '/ws'
  const appPort = Number(env.VITE_APP_PORT || 5173)

  return {
    plugins: [react()],

    server: {
      /**
       * Proxy API requests to backend.
       * Values are set in frontend/.env and default to local Django targets.
       */
      proxy: {
        [`${apiPrefix}/`]: {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^${apiPrefix}`), apiPrefix),
        },
        [`${wsPrefix}/`]: {
          target: wsTarget,
          ws: true,
          rewrite: (path) => path.replace(new RegExp(`^${wsPrefix}`), wsPrefix),
        },
      },
      port: appPort,
      strictPort: false,
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      // Use esbuild minifier by default to avoid requiring terser as an extra dep on Vercel
      // If you need terser-specific options, install terser and change this to 'terser'.
      minify: 'esbuild',
    },

    /**
     * CSS processing configuration.
     * PostCSS handles Tailwind CSS v4 directives (@import "tailwindcss").
     */
    css: {
      postcss: './postcss.config.cjs',
    },
  }
})
