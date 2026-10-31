import { onBeforeUnmount, onMounted, readonly, ref, type Ref } from 'vue'
import {
  applyPreference,
  browserStorage,
  parsePreference,
  readPreference,
  savePreference,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from './preference'

export interface ThemePreferenceState {
  /** The current choice; `system` until the component is mounted (the prerendered page). */
  preference: Readonly<Ref<ThemePreference>>
  /** Applies a choice to the page at once and stores it. */
  setPreference: (value: ThemePreference) => void
}

/**
 * The visitor's theme choice for a component. The stored choice is read after mount, so the
 * hydrated markup matches the prerendered one; the head script already applied the theme.
 * A change made in another tab of the same site is followed through the `storage` event.
 */
export function useThemePreference(): ThemePreferenceState {
  const preference = ref<ThemePreference>('system')

  function setPreference(value: ThemePreference): void {
    preference.value = value
    applyPreference(document.documentElement, value)
    savePreference(browserStorage(), value)
  }

  function onStorage(event: StorageEvent): void {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return
    const value = parsePreference(event.key === null ? null : event.newValue)
    preference.value = value
    applyPreference(document.documentElement, value)
  }

  onMounted(() => {
    preference.value = readPreference(browserStorage())
    window.addEventListener('storage', onStorage)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('storage', onStorage)
  })

  return { preference: readonly(preference), setPreference }
}
