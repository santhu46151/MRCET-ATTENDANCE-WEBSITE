import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'www',
    emptyOutDir: true,
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
