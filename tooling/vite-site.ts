import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { defineConfig, type Plugin, type UserConfig } from 'vite'
import type { ViteSSGOptions } from 'vite-ssg'

// vite-ssg reads its options from the `ssgOptions` key of the Vite configuration.
type SiteConfig = UserConfig & {
  ssgOptions?: Partial<ViteSSGOptions>
  test?: Record<string, unknown>
}

/**
 * Puts the theme script of `@levix/ui` inline at the top of every page's head, so a stored theme
 * is applied before the first paint (FEAT-007, ADR-0012). The Content Security Policy allows it
 * by its hash, computed from the same file (`scripts/lib/security-headers.mjs`).
 */
function themeInit(): Plugin {
  const file = createRequire(import.meta.url).resolve('@levix/ui/theme-init.js')
  const script = readFileSync(file, 'utf8').trim()
  return {
    name: 'levix-theme-init',
    transformIndexHtml: () => [{ tag: 'script', children: script, injectTo: 'head-prepend' }],
  }
}

/** The Vite configuration shared by every site: Vue, Tailwind, prerendering and tests. */
export function defineSiteConfig(): UserConfig {
  const config: SiteConfig = {
    plugins: [vue(), tailwindcss(), themeInit()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      // Fonts stay files: the Content Security Policy allows fonts only from the site's origin
      // (`font-src 'self'`), so a small font inlined as a data URL would be blocked.
      assetsInlineLimit: (file) => (/\.(woff2?|ttf|otf)$/.test(file) ? false : undefined),
    },
    ssgOptions: {
      script: 'async',
      formatting: 'none',
      dirStyle: 'nested',
    },
    test: {
      environment: 'jsdom',
    },
  }
  return defineConfig(config)
}
