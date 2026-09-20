import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'www',
    emptyOutDir: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/firebase/')) {
            return 'vendor-firebase';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'vendor-icons';
          }
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    open: false,
    watch: {
      ignored: ['**/android/**', '**/www/**', '**/downloads/**', '**/dist/**']
    }
  },
  preview: {
    port: 3000,
    host: true,
    open: false,
  }
});
