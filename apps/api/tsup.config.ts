import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  outDir: 'dist',
  noExternal: ['@paceplan/db', '@paceplan/types'],
  clean: true,
});
