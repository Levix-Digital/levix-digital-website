// @vitest-environment node
/// <reference types="node" />
import { compile } from '@tailwindcss/node'
import { readFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'

// Builds the shared stylesheet the way every site does and checks what reaches the output.
const STYLES_PATH = fileURLToPath(new URL('./styles.css', import.meta.url))

let css = ''

beforeAll(async () => {
  const compiler = await compile(readFileSync(STYLES_PATH, 'utf8'), {
    base: dirname(STYLES_PATH),
    onDependency: () => {},
  })
  css = compiler.build([
    'bg-surface', 'bg-surface-raised', 'text-body', 'text-title', 'text-ink-cyan', 'border-bevel',
    'shadow-ceramic', 'hover:shadow-ceramic-active', 'bg-aurora', 'font-display', 'font-mono',
    'bg-aurora-magenta', 'dark:hidden',
  ])
})

/** The declarations of the first rule whose selector ends with the given text. */
function rule(selectorEnd: string): string {
  const escaped = selectorEnd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? ''
}

describe('built stylesheet', () => {
  it('gives the token utilities, reading the theme variables', () => {
    expect(rule('.bg-surface')).toContain('var(--levix-surface)')
    expect(rule('.text-ink-cyan')).toContain('var(--levix-ink-cyan)')
    expect(rule('.shadow-ceramic')).toContain('--levix-shadow-glow')
    expect(rule('.bg-aurora')).toContain('linear-gradient')
    expect(rule('.font-display')).toContain('var(--font-display)')
  })

  it('carries the theme colors and the three typefaces', () => {
    expect(css).toMatch(/--levix-surface:\s*light-dark\(#FAFAFC, #0B0F19\)/)
    expect(css).toContain('"Inter Tight Variable"')
    expect(css).toContain('"Inter Variable"')
    expect(css).toContain('"JetBrains Mono Variable"')
  })

  it('selects light by default, dark from the system unless forced light, and forced dark', () => {
    expect(css).toMatch(/:root\s*\{\s*color-scheme:\s*light;/)
    expect(css).toMatch(
      /@media \(prefers-color-scheme: dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\)\s*\{\s*color-scheme:\s*dark;/,
    )
    expect(css).toMatch(/:root\[data-theme="dark"\]\s*\{\s*color-scheme:\s*dark;/)
  })

  it('makes the dark: variant follow the same rule as the tokens', () => {
    const variant = css.slice(css.indexOf('.dark\\:hidden'))
    expect(css).toContain('.dark\\:hidden:where([data-theme="dark"], [data-theme="dark"] *)')
    expect(css).toMatch(/\.dark\\:hidden:where\(:root:not\(\[data-theme="light"\]\), :root:not\(\[data-theme="light"\]\) \*\)/)
    expect(variant).toContain('display: none')
  })
})
