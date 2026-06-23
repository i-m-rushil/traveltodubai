import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Split long-lived third-party code into its own cached chunk so app
    // updates don't force users to re-download React / Router / Supabase.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
            return 'react-vendor';
          }
          if (id.includes('@supabase')) return 'supabase';
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
})
