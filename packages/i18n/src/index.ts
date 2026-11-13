import availability from './availability.en.json'
import layout from './layout.en.json'

/** The language every string is written in first; other languages are translated from it. */
export const SOURCE_LANGUAGE = 'en'

/** The English text of the shared layout (header, footer, pickers), the same on every site. */
export type LayoutStrings = typeof layout

export const layoutStrings: LayoutStrings = layout

/** The English text of the availability panel, the release candidate form and the subscription pages. */
export type AvailabilityStrings = typeof availability

export const availabilityStrings: AvailabilityStrings = availability

/** The date of the consent wording (`signup.consent`); change it whenever that wording changes. */
export const CONSENT_VERSION = '2026-11-13'

/** Replaces each `{name}` in the text with its value; a placeholder without a value is an error. */
export function formatText(text: string, values: Readonly<Record<string, string>>): string {
  return text.replace(/\{(\w+)\}/g, (_match, name: string) => {
    const value = values[name]
    if (value === undefined) throw new Error(`No value for {${name}} in "${text}"`)
    return value
  })
}
