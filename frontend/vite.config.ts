import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // react(): JSX/TSX-käännös ja Fast Refresh kehityksessä.
  // tailwindcss(): käsittelee Tailwind v4 -direktiivit (@theme, @source, @plugin jne.).
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          if (id.includes('node_modules/motion')) {
            return 'motion';
          }
          if (
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react/')
          ) {
            return 'react';
          }
        },
      },
    },
  },
});
