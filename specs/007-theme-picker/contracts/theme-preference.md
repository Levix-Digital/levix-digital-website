# Contract: Theme Preference

## Stored value

| Storage | Key | Values | Meaning |
|---|---|---|---|
| `localStorage` of the site | `levix-theme` | `light`, `dark` | the visitor forced that theme |
| | (absent, or any other value) | | follow the system preference |

## Root element

| Preference | `data-theme` on `<html>` |
|---|---|
| `system` | absent |
| `light` | `light` |
| `dark` | `dark` |

The stylesheet (FEAT-006) turns the attribute into the theme; the table of `docs/architecture/ui.md` ("Themes") is the reference.

## Public interface of `@levix/ui`

- `ThemePicker` component. Props: `labels: { legend: string, system: string, light: string, dark: string }`.
- `useThemePreference()`: `{ preference: Readonly<Ref<ThemePreference>>, setPreference(value: ThemePreference): void }`.
- `type ThemePreference = 'system' | 'light' | 'dark'`.
- `@levix/ui/theme-init.js`: the head script, read by the shared Vite configuration and by the security headers (its hash).
