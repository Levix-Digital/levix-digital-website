import layout from './layout.en.json'

/** The language every string is written in first; other languages are translated from it. */
export const SOURCE_LANGUAGE = 'en'

/** The English text of the shared layout (header, footer, pickers), the same on every site. */
export type LayoutStrings = typeof layout

export const layoutStrings: LayoutStrings = layout
