import { describe, expect, it } from 'vitest'
import {
  applyPreference,
  parsePreference,
  readPreference,
  savePreference,
  THEME_STORAGE_KEY,
  type PreferenceStorage,
} from './preference'

function memoryStorage(initial: Record<string, string> = {}): PreferenceStorage & { data: Record<string, string> } {
  const data = { ...initial }
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value
    },
    removeItem: (key) => {
      delete data[key]
    },
  }
}

const failingStorage: PreferenceStorage = {
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('quota')
  },
  removeItem: () => {
    throw new Error('blocked')
  },
}

describe('parsePreference', () => {
  it('accepts only light and dark as forced themes', () => {
    expect(parsePreference('light')).toBe('light')
    expect(parsePreference('dark')).toBe('dark')
    expect(parsePreference(null)).toBe('system')
    expect(parsePreference('system')).toBe('system')
    expect(parsePreference('Dark')).toBe('system')
    expect(parsePreference('')).toBe('system')
  })
})

describe('readPreference', () => {
  it('reads the stored choice', () => {
    expect(readPreference(memoryStorage({ [THEME_STORAGE_KEY]: 'dark' }))).toBe('dark')
  })

  it('follows the system with no key, an unknown value, no storage or a failing storage', () => {
    expect(readPreference(memoryStorage())).toBe('system')
    expect(readPreference(memoryStorage({ [THEME_STORAGE_KEY]: 'sepia' }))).toBe('system')
    expect(readPreference(undefined)).toBe('system')
    expect(readPreference(failingStorage)).toBe('system')
  })
})

describe('savePreference', () => {
  it('stores a forced theme and removes the key for system', () => {
    const storage = memoryStorage()
    expect(savePreference(storage, 'light')).toBe(true)
    expect(storage.data[THEME_STORAGE_KEY]).toBe('light')
    expect(savePreference(storage, 'system')).toBe(true)
    expect(storage.data).not.toHaveProperty(THEME_STORAGE_KEY)
  })

  it('reports a choice it could not store, without throwing', () => {
    expect(savePreference(failingStorage, 'dark')).toBe(false)
    expect(savePreference(failingStorage, 'system')).toBe(false)
    expect(savePreference(undefined, 'dark')).toBe(false)
  })
})

describe('applyPreference', () => {
  it('forces a theme on the root element, or removes it for system', () => {
    const root = document.createElement('html')
    applyPreference(root, 'dark')
    expect(root.getAttribute('data-theme')).toBe('dark')
    applyPreference(root, 'light')
    expect(root.getAttribute('data-theme')).toBe('light')
    applyPreference(root, 'system')
    expect(root.hasAttribute('data-theme')).toBe(false)
  })
})
