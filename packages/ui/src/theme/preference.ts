/**
 * The visitor's theme choice (FEAT-007): kept in the site's local storage and applied as
 * `data-theme` on the root element, which the stylesheet turns into the theme (ADR-0011).
 * The head script `theme-init.js` applies the stored choice before the first paint (ADR-0012).
 */

export type ThemePreference = 'system' | 'light' | 'dark'

/** The local storage key; absent means "follow the system". `theme-init.js` reads the same key. */
export const THEME_STORAGE_KEY = 'levix-theme'

/** The storage methods used here; `window.localStorage` in the browser. */
export type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

/** @returns the forced theme a stored value names, or `system` for none or any other value. */
export function parsePreference(value: string | null | undefined): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'system'
}

/** @returns the stored choice; `system` when there is none, it is unknown or storage fails. */
export function readPreference(storage: PreferenceStorage | undefined): ThemePreference {
  try {
    return parsePreference(storage?.getItem(THEME_STORAGE_KEY))
  } catch {
    return 'system'
  }
}

/**
 * Stores a forced theme, or removes the key for `system`. A storage that fails (private mode,
 * blocked storage, a full quota) only means the choice is not remembered.
 * @returns whether the choice was stored
 */
export function savePreference(storage: PreferenceStorage | undefined, preference: ThemePreference): boolean {
  try {
    if (!storage) return false
    if (preference === 'system') storage.removeItem(THEME_STORAGE_KEY)
    else storage.setItem(THEME_STORAGE_KEY, preference)
    return true
  } catch {
    return false
  }
}

/** Forces the theme on the root element, or lets the system decide for `system`. */
export function applyPreference(root: HTMLElement, preference: ThemePreference): void {
  if (preference === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', preference)
}

/** @returns the browser's local storage, or undefined where reading it throws or it is absent. */
export function browserStorage(): PreferenceStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}
