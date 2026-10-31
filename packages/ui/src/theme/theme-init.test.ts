/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { THEME_STORAGE_KEY } from './preference'

const SCRIPT = readFileSync(join(import.meta.dirname, 'theme-init.js'), 'utf8').trim()

function run(): void {
  new Function(SCRIPT)()
}

describe('theme-init.js', () => {
  afterEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    vi.restoreAllMocks()
  })

  it('forces the stored light or dark theme on the root element', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    run()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    localStorage.setItem(THEME_STORAGE_KEY, 'light')
    run()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('leaves the system in charge with no key or an unknown value', () => {
    run()
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)

    localStorage.setItem(THEME_STORAGE_KEY, 'sepia')
    run()
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('does not throw when storage fails', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(run).not.toThrow()
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
  })

  it('reads the same key as the picker', () => {
    expect(SCRIPT).toContain(`"${THEME_STORAGE_KEY}"`)
  })

  it('is one line with no characters HTML could change inside a script element', () => {
    expect(SCRIPT).not.toMatch(/[\n<>&]/)
  })
})
