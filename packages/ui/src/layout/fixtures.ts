import type { LayoutCompany, LayoutSiteLink, LayoutStrings } from './types'

/** Facts and text for the layout tests, in the shape the sites pass them. */
export const company: LayoutCompany = {
  name: 'Example Inc.',
  email: 'hello@example.com',
  location: { city: 'Calgary', province: 'Alberta', country: 'Canada' },
}

export const companySite: LayoutSiteLink = { id: 'home', name: 'Levix Digital', url: 'https://levix.digital' }

export const products: readonly LayoutSiteLink[] = [
  { id: 'one', name: 'Product One', url: 'https://one.example.com' },
  { id: 'two', name: 'Product Two', url: 'https://two.example.com' },
]

export const strings: LayoutStrings = {
  'layout.skip': 'Skip to content',
  'layout.nav': 'Main',
  'layout.menu': 'Menu',
  'layout.products': 'Products',
  'layout.contact': 'Contact',
  'layout.by': 'by',
  'theme.legend': 'Theme',
  'theme.system': 'System',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
}
