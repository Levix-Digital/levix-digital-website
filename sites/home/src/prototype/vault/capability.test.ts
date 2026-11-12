import { describe, expect, it } from 'vitest'
import { chooseMode, isSoftwareRenderer, readViewEnvironment, storeMode, VIEW_STORAGE_KEY, type ViewEnvironment } from './capability'

const capable: ViewEnvironment = { webgl: 'gpu', reducedMotion: false, saveData: false, stored: null }

describe('choosing the view', () => {
  it('plays the 3D scene when nothing stands against it', () => {
    expect(chooseMode(capable)).toBe('cinematic')
  })

  it('shows the static view without WebGL, whatever was chosen', () => {
    expect(chooseMode({ ...capable, webgl: 'none' })).toBe('static')
    expect(chooseMode({ ...capable, webgl: 'none', stored: 'cinematic' })).toBe('static')
  })

  it('plays software WebGL only when the visitor asked for the 3D view', () => {
    expect(chooseMode({ ...capable, webgl: 'software' })).toBe('static')
    expect(chooseMode({ ...capable, webgl: 'software', stored: 'cinematic' })).toBe('cinematic')
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

describe('software rendering', () => {
  it('counts processor-drawn WebGL as no WebGL', () => {
    expect(isSoftwareRenderer('ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)')).toBe(true)
    expect(isSoftwareRenderer('llvmpipe (LLVM 15.0.7, 256 bits)')).toBe(true)
    expect(isSoftwareRenderer('Microsoft Basic Render Driver')).toBe(true)
    expect(isSoftwareRenderer('ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0)')).toBe(false)
    expect(isSoftwareRenderer('Apple M2')).toBe(false)
  })
})

describe('the browser environment', () => {
  it('reads no WebGL in a browser without it (jsdom), and remembers the choice', () => {
    window.localStorage.removeItem(VIEW_STORAGE_KEY)
    storeMode('static')

    const environment = readViewEnvironment()

    expect(environment.webgl).toBe('none')
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
