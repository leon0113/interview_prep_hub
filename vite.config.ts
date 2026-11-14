import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { generateOutlines } from './scripts/generate-outlines.ts';

const alias = { '@': fileURLToPath(new URL('./src', import.meta.url)) };

/**
 * Keeps `src/content/<track>/outline.generated.json` in sync with the content: regenerated before
 * every dev session and production build, and again whenever a content file is saved in dev.
 * Skipped under Vitest, where tests/outline.test.ts checks the committed files instead.
 */
function contentOutlines(): Plugin {
  // e.g. D:\app\src\content\python\sections\basics.ts -> "python" (either path separator)
  const contentFile = /[\\/]src[\\/]content[\\/]([^\\/]+)[\\/].*\.ts$/;
  return {
    name: 'content-outlines',
    async buildStart() {
      if (process.env.VITEST) return;
      const changed = await generateOutlines();
      if (changed.length) this.info(`updated ${changed.length} content outline(s)`);
    },
    configureServer(server) {
      if (process.env.VITEST) return;
      server.watcher.on('change', (file) => {
        const track = contentFile.exec(file)?.[1];
        if (!track) return;
        generateOutlines([track]).catch((error: unknown) =>
          server.config.logger.error(`[content-outlines] ${String(error)}`),
        );
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), contentOutlines()],
  resolve: { alias },
  // PGlite loads its WebAssembly with new URL(..., import.meta.url); pre-bundling breaks that.
  optimizeDeps: { exclude: ['@electric-sql/pglite'] },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // PGlite ships Node-only code paths (direct eval, node:module) that never run in the
        // browser; its own warnings are noise. Everything else is still reported.
        const fromPglite = (warning.id ?? warning.message).includes('@electric-sql/pglite');
        if (fromPglite && (warning.code === 'EVAL' || /node:module/.test(warning.message))) return;
        warn(warning);
      },
    },
  },
  test: {
    projects: [
      {
        // `npm run test`: unit, component and content-validation tests. Needs nothing installed.
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          setupFiles: ['./tests/setup.ts'],
          include: ['tests/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
          css: false,
          // App tests render full pages, including the lazy markdown/Prism chunk; jsdom can be
          // slow to evaluate it on a busy machine.
          testTimeout: 15_000,
        },
      },
      {
        // `npm run verify:outputs`: runs every code example through a real interpreter
        // and compares it with the written output. Needs `python` (and node) on PATH.
        resolve: { alias },
        test: {
          name: 'verify',
          environment: 'node',
          include: ['tests/verify/**/*.verify.ts'],
          testTimeout: 30_000,
        },
      },
    ],
  },
});
