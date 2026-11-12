/**
 * Decides whether the vault plays as a 3D scene or as the static view: the 3D scene needs WebGL on
 * a graphics processor and a visitor who does not prefer reduced motion or reduced data, unless
 * the visitor chose a view with the toggle, which is remembered in this browser.
 */

export type VaultMode = 'cinematic' | 'static'

export const VIEW_STORAGE_KEY = 'levix.vault.view'

/** WebGL on a graphics processor, WebGL drawn by the processor (slow), or none. */
export type WebGLSupport = 'gpu' | 'software' | 'none'

export interface ViewEnvironment {
  readonly webgl: WebGLSupport
  readonly reducedMotion: boolean
  readonly saveData: boolean
  readonly stored: string | null
}

/**
 * The mode for an environment. A stored choice wins, except that no WebGL always means static;
 * software WebGL plays only when the visitor asked for the 3D view.
 */
export function chooseMode(environment: ViewEnvironment): VaultMode {
  if (environment.webgl === 'none') return 'static'
  if (environment.stored === 'cinematic' || environment.stored === 'static') return environment.stored
  if (environment.webgl === 'software') return 'static'
  return environment.reducedMotion || environment.saveData ? 'static' : 'cinematic'
}

/** Reads the environment from the browser. Every read is guarded: a failure means "not available". */
export function readViewEnvironment(win: Window = window): ViewEnvironment {
  return {
    webgl: webGLSupport(win),
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

/** Renderers that draw on the processor: the scene would block the page, so they count as no WebGL. */
export function isSoftwareRenderer(renderer: string): boolean {
  return /swiftshader|llvmpipe|softpipe|software|basic render driver/i.test(renderer)
}

/** Whether WebGL is there, and drawn by a graphics processor or by the processor. */
function webGLSupport(win: Window): WebGLSupport {
  try {
    const canvas = win.document.createElement('canvas')
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    if (!context) return 'none'
    const info = context.getExtension('WEBGL_debug_renderer_info')
    const renderer = info ? String(context.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
    context.getExtension('WEBGL_lose_context')?.loseContext()
    return isSoftwareRenderer(renderer) ? 'software' : 'gpu'
  } catch {
    return 'none'
  }
}
