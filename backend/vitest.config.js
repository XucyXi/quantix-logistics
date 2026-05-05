import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.js'],
    clearMocks: true,
    include: ['tests/**/*.test.js'],
  },
});

