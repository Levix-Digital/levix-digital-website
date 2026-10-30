import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type UserConfig } from 'vite'
import type { ViteSSGOptions } from 'vite-ssg'

// vite-ssg reads its options from the `ssgOptions` key of the Vite configuration.
type SiteConfig = UserConfig & {
  ssgOptions?: Partial<ViteSSGOptions>
  test?: Record<string, unknown>
}

/** The Vite configuration shared by every site: Vue, Tailwind, prerendering and tests. */
export function defineSiteConfig(): UserConfig {
  const config: SiteConfig = {
    plugins: [vue(), tailwindcss()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
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
