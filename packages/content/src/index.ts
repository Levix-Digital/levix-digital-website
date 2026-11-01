export interface Location {
  readonly city: string
  readonly province: string
  readonly country: string
}

export interface Company {
  readonly name: string
  readonly email: string
  readonly location: Location
}

/** The five sites: the company home and one site per product. */
export type SiteId = 'home' | 'anycontext' | 'devcycle' | 'gedo' | 'aurora'
export type ProductId = Exclude<SiteId, 'home'>

/** A site as other sites link to it: its name and its production address. */
export interface SiteLink {
  readonly id: SiteId
  readonly name: string
  readonly url: string
}

export interface ProductLink extends SiteLink {
  readonly id: ProductId
}

export const company: Company = {
  name: 'Levix Digital Inc.',
  email: 'contact@levix.digital',
  location: { city: 'Calgary', province: 'Alberta', country: 'Canada' },
}

export const companySite: SiteLink = { id: 'home', name: 'Levix Digital', url: 'https://levix.digital' }

/** The products, in the order the sites show them. FEAT-014 extends these entries with the product facts. */
export const products: readonly ProductLink[] = [
  { id: 'anycontext', name: 'AnyContext', url: 'https://anycontext.levix.digital' },
  { id: 'devcycle', name: 'Dev Cycle Protocol', url: 'https://devcycle.levix.digital' },
  { id: 'gedo', name: 'Gedo', url: 'https://gedo.levix.digital' },
  { id: 'aurora', name: 'Aurora Dev Suite', url: 'https://aurora.levix.digital' },
]
