import { describe, expect, it } from 'vitest'
import { chooseMode, readViewEnvironment, storeMode, VIEW_STORAGE_KEY, type ViewEnvironment } from './capability'

const capable: ViewEnvironment = { webgl: true, reducedMotion: false, saveData: false, stored: null }

describe('choosing the view', () => {
  it('plays the 3D scene when nothing stands against it', () => {
    expect(chooseMode(capable)).toBe('cinematic')
  })

  it('shows the static view without WebGL, whatever was chosen', () => {
    expect(chooseMode({ ...capable, webgl: false })).toBe('static')
    expect(chooseMode({ ...capable, webgl: false, stored: 'cinematic' })).toBe('static')
  })

  it('honors reduced motion and reduced data', () => {
    expect(chooseMode({ ...capable, reducedMotion: true })).toBe('static')
    expect(chooseMode({ ...capable, saveData: true })).toBe('static')
  })

  it("lets the visitor's choice win over the preferences", () => {
    expect(chooseMode({ ...capable, reducedMotion: true, stored: 'cinematic' })).toBe('cinematic')
    expect(chooseMode({ ...capable, stored: 'static' })).toBe('static')
    expect(chooseMode({ ...capable, stored: 'something else' })).toBe('cinematic')
  })
})

describe('the browser environment', () => {
  it('reads no WebGL in a browser without it (jsdom), and remembers the choice', () => {
    window.localStorage.removeItem(VIEW_STORAGE_KEY)
    storeMode('static')

    const environment = readViewEnvironment()

    expect(environment.webgl).toBe(false)
    expect(environment.stored).toBe('static')
  })

  it('keeps working when storage is blocked', () => {
    const blocked = new Proxy(window, {
      get(target, key) {
        if (key === 'localStorage') throw new DOMException('blocked', 'SecurityError')
        const value = Reflect.get(target, key) as unknown
        return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(target) : value
      },
    })

    expect(() => storeMode('static', blocked)).not.toThrow()
    expect(readViewEnvironment(blocked).stored).toBeNull()
  })
})
