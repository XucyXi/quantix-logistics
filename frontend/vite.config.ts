import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // react(): JSX/TSX-käännös ja Fast Refresh kehityksessä.
  // tailwindcss(): käsittelee Tailwind v4 -direktiivit (@theme, @source, @plugin jne.).
  plugins: [react(), tailwindcss()],
});
