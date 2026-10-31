# Contract: Design Tokens

Utilities follow Tailwind's naming: a color token `--color-<name>` gives `bg-<name>`, `text-<name>`, `border-<name>`, `outline-<name>` and the others; `--shadow-<name>` gives `shadow-<name>`; `--font-<name>` gives `font-<name>`. Every token is also a CSS variable of the same name.

## Theme colors (light, dark)

| Token | Light | Dark | Use |
|---|---|---|---|
| `surface` | `#FAFAFC` | `#0B0F19` | Page backdrop |
| `surface-raised` | `#FFFFFF` | `#161F30` | Ceramic plates, cards, header |
| `bevel` | `#E2E8F0` | `#334155` | Decorative lines, 1px bevels, dividers |
| `control` | `#64748B` | `#64748B` | Borders of inputs and controls that must be seen |
| `title` | `#0A0D12` | `#F1F5F9` | Headings, high-contrast text |
| `body` | `#475569` | `#CBD5E1` | Paragraphs |
| `muted` | `#64748B` | `#94A3B8` | Secondary text, captions |
| `accent` | `#0E7490` | `#00F0FF` | Links, highlights, filled buttons |
| `on-accent` | `#FFFFFF` | `#0B0F19` | Text on an `accent` fill |
| `focus` | `#0E7490` | `#00F0FF` | Keyboard focus ring |
| `ink-cyan` | `#0E7490` | `#00F0FF` | Text in the aurora cyan hue |
| `ink-emerald` | `#047857` | `#00FFA3` | Text in the aurora emerald hue |
| `ink-purple` | `#7928CA` | `#C084FC` | Text in the aurora purple hue |
| `ink-magenta` | `#C8006A` | `#FF5CA8` | Text in the aurora magenta hue |
| `success` | `#047857` | `#00E5A3` | Status |
| `warning` | `#B45309` | `#F59E0B` | Status |
| `error` | `#B91C1C` | `#F87171` | Status |
| `info` | `#0369A1` | `#38BDF8` | Status |

## Fixed values

| Token | Value | Use |
|---|---|---|
| `aurora-cyan` | `#00F0FF` | Seams, glows, hero (never body text) |
| `aurora-emerald` | `#00FFA3` | Same |
| `aurora-purple` | `#7928CA` | Same |
| `aurora-magenta` | `#FF007A` | Same |
| `bg-aurora` | gradient cyan, emerald, purple, magenta | Seams and emissive borders |
| `shadow-ceramic` | `0 20px 40px -15px` depth, `0 0 20px -5px` cyan glow | Plates at rest |
| `shadow-ceramic-active` | `0 30px 60px -12px` depth, `0 0 35px -5px` emerald glow | Plates on hover or highlight |
| `font-display` | Inter Tight Variable | Headings |
| `font-sans` | Inter Variable | Body text (page default) |
| `font-mono` | JetBrains Mono Variable | Telemetry, badges, code |

## Theme selection

| Root element | System preference | Theme |
|---|---|---|
| no `data-theme` | light or none | light |
| no `data-theme` | dark | dark |
| `data-theme="light"` | any | light |
| `data-theme="dark"` | any | dark |

The `dark:` variant of Tailwind follows this table.

## Contrast pairs (checked in both themes)

- 4.5:1: `title`, `body`, `muted`, `accent`, `ink-*`, `success`, `warning`, `error`, `info` on `surface` and `surface-raised`; `on-accent` on `accent`.
- 3:1: `focus` and `control` on `surface` and `surface-raised`.
