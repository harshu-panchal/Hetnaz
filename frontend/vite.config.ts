import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@module': path.resolve(__dirname, './src/module'),
    },
  },
  optimizeDeps: {
    include: ['agora-rtc-sdk-ng'],
  },
  build: {
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return;

          // Core React - rarely changes, cache separately
          if (id.includes('/react@') ||
            id.includes('/react-dom@') ||
            id.includes('/react-router-dom@') ||
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/react-router')) {
            return 'vendor-react';
          }
          // Socket.IO - loaded for real-time features
          if (id.includes('/socket.io-client') || id.includes('/engine.io')) {
            return 'vendor-socket';
          }
          // Agora - only loaded when needed for video calls (lazy)
          if (id.includes('/agora-rtc-sdk-ng')) {
            return 'vendor-agora';
          }
          // REMOVED: i18n chunk causes initialization errors
          // i18next depends on React, must be in main bundle
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,
    // Use esbuild for faster, smaller builds (default)
    minify: 'esbuild',
    // Target modern browsers for smaller bundle
    target: 'es2020',
  },
  // Keep console logs for debugging (remove this later for production)
  esbuild: {
    // drop: ['console', 'debugger'], // Temporarily disabled for video call debugging
    drop: ['debugger'],
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
