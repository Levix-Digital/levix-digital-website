// @vitest-environment node
/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// The theme colors of styles.css, written as `--levix-<name>: light-dark(#RRGGBB, #RRGGBB);`.
const STYLES = readFileSync(new URL('./styles.css', import.meta.url), 'utf8')
const THEME_COLOR = /--levix-([a-z-]+):\s*light-dark\(\s*(#[0-9A-Fa-f]{6})\s*,\s*(#[0-9A-Fa-f]{6})\s*\)\s*;/g
const ANY_THEME_VARIABLE = /--levix-([a-z-]+):\s*([^;]+);/g
// Shadow inks carry transparency and are decorative, so they are not contrast-checked.
const NOT_CHECKED = /^shadow-/

type Theme = 'light' | 'dark'
const THEMES: Theme[] = ['light', 'dark']

function themeColors(css: string): Map<string, Record<Theme, string>> {
  const colors = new Map<string, Record<Theme, string>>()
  for (const [, name, light, dark] of css.matchAll(THEME_COLOR)) {
    colors.set(name as string, { light: light as string, dark: dark as string })
  }
  return colors
}

/** WCAG 2.2 relative luminance of a #RRGGBB color. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  }) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG 2.2 contrast ratio between two #RRGGBB colors. */
function contrast(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (high + 0.05) / (low + 0.05)
}

const SURFACES = ['surface', 'surface-raised']
const TEXT = [
  'title', 'body', 'muted', 'accent',
  'ink-cyan', 'ink-emerald', 'ink-purple', 'ink-magenta',
  'success', 'warning', 'error', 'info',
]
const NON_TEXT = ['focus', 'control']

// The contract's pairs (specs/006-design-tokens-themes/contracts/tokens.md).
const PAIRS: Array<{ foreground: string; background: string; minimum: number }> = [
  ...TEXT.flatMap((foreground) => SURFACES.map((background) => ({ foreground, background, minimum: 4.5 }))),
  { foreground: 'on-accent', background: 'accent', minimum: 4.5 },
  ...NON_TEXT.flatMap((foreground) => SURFACES.map((background) => ({ foreground, background, minimum: 3 }))),
]

function failingPairs(colors: Map<string, Record<Theme, string>>): string[] {
  const failures: string[] = []
  for (const theme of THEMES) {
    for (const { foreground, background, minimum } of PAIRS) {
      const fg = colors.get(foreground)?.[theme]
      const bg = colors.get(background)?.[theme]
      if (!fg || !bg) {
        failures.push(`${theme}: ${foreground} on ${background} is not a theme color`)
        continue
      }
      const ratio = contrast(fg, bg)
      if (ratio < minimum) {
        failures.push(`${theme}: ${foreground} ${fg} on ${background} ${bg} is ${ratio.toFixed(2)}:1, below ${minimum}:1`)
      }
    }
  }
  return failures
}

describe('theme colors', () => {
  it('writes every theme color as light-dark(#RRGGBB, #RRGGBB)', () => {
    const malformed = [...STYLES.matchAll(ANY_THEME_VARIABLE)]
      .filter(([, name]) => !NOT_CHECKED.test(name as string))
      .filter(([declaration]) => !new RegExp(THEME_COLOR.source).test(declaration))
      .map(([declaration]) => declaration)

    expect(malformed).toEqual([])
  })

  it('exposes every theme color as a Tailwind color', () => {
    const missing = [...themeColors(STYLES).keys()].filter(
      (name) => !STYLES.includes(`--color-${name}: var(--levix-${name});`),
    )

    expect(missing).toEqual([])
  })

  it('meets WCAG 2.2 AA contrast for every declared pair in both themes', () => {
    expect(failingPairs(themeColors(STYLES))).toEqual([])
  })

  it('names the theme, pair and ratio of a pair below the minimum', () => {
    const colors = themeColors(STYLES)
    colors.set('muted', { light: '#94A3B8', dark: '#94A3B8' })

    expect(failingPairs(colors)).toContain('light: muted #94A3B8 on surface #FAFAFC is 2.46:1, below 4.5:1')
  })

  it('computes the WCAG ratio of black on white as 21:1', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 5)
  })
})
