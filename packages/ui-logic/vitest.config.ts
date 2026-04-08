import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      threshold: { global: { lines: 80, functions: 80, branches: 80 } },
    },
  },
});
