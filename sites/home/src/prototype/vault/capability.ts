/**
 * Decides whether the vault plays as a 3D scene or as the static view: the 3D scene needs WebGL
 * and a visitor who does not prefer reduced motion or reduced data, unless the visitor chose a
 * view with the toggle, which is remembered in this browser.
 */

export type VaultMode = 'cinematic' | 'static'

export const VIEW_STORAGE_KEY = 'levix.vault.view'

export interface ViewEnvironment {
  readonly webgl: boolean
  readonly reducedMotion: boolean
  readonly saveData: boolean
  readonly stored: string | null
}

/** The mode for an environment. A stored choice wins, except that no WebGL always means static. */
export function chooseMode(environment: ViewEnvironment): VaultMode {
  if (!environment.webgl) return 'static'
  if (environment.stored === 'cinematic' || environment.stored === 'static') return environment.stored
  return environment.reducedMotion || environment.saveData ? 'static' : 'cinematic'
}

/** Reads the environment from the browser. Every read is guarded: a failure means "not available". */
export function readViewEnvironment(win: Window = window): ViewEnvironment {
  return {
    webgl: hasWebGL(win),
    reducedMotion: matches(win, '(prefers-reduced-motion: reduce)'),
    saveData: Boolean((win.navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData),
    stored: readStored(win),
  }
}

/** Remembers the visitor's choice; storage may be blocked, and then the choice lasts for the visit. */
export function storeMode(mode: VaultMode, win: Window = window): void {
  try {
    win.localStorage.setItem(VIEW_STORAGE_KEY, mode)
  } catch {
    // Storage blocked (private window, site data blocked): the toggle still works for this visit.
  }
}

function readStored(win: Window): string | null {
  try {
    return win.localStorage.getItem(VIEW_STORAGE_KEY)
  } catch {
    return null
  }
}

function matches(win: Window, query: string): boolean {
  try {
    return win.matchMedia(query).matches
  } catch {
    return false
  }
}

function hasWebGL(win: Window): boolean {
  try {
    const canvas = win.document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}
