import { portfolio } from './portfolio'

export { portfolio, productLines, PortfolioError, validatePortfolio } from './portfolio'
export type { AvailabilityStatus, Product, ProductLine, ProductLineId } from './types'

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

const PRODUCT_SITE_IDS: readonly ProductId[] = ['anycontext', 'devcycle', 'gedo', 'aurora']

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

/** The products that have a site, in portfolio order: the links of the header and the footer. */
export const products: readonly ProductLink[] = portfolio.flatMap((product) =>
  product.site !== undefined && isProductId(product.id)
    ? [{ id: product.id, name: product.name, url: product.site }]
    : [],
)

function isProductId(id: string): id is ProductId {
  return PRODUCT_SITE_IDS.includes(id as ProductId)
}
