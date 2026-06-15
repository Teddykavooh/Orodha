import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


/**
 * Vite configuration for Orodha frontend.
 * 
 * Includes:
 * - React plugin with JSX transformation
 * - CSS processing with PostCSS (Tailwind)
 * - Dev server proxy to Django backend
 * - Build optimizations
 */
export default defineConfig({
  plugins: [react(),],

  server: {
    /**
     * Proxy API requests to Django backend.
     * Frontend requests to /api/ are forwarded to http://localhost:8000/api/
     * Update target URL if Django runs on a different port.
     */
    proxy: {
      '/api/': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      '/ws/': {
        target: 'ws://localhost:8000',
        ws: true,
        rewrite: (path) => path.replace(/^\/ws/, '/ws'),
      },
    },
    port: 5173,
    strictPort: false,
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  },

  /**
   * CSS processing configuration.
   * PostCSS handles Tailwind CSS v4 directives (@import "tailwindcss").
   */
  css: {
    postcss: './postcss.config.cjs',
  },
})
