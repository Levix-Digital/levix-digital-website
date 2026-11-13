import { PortfolioError, portfolio } from './portfolio'
import type { Product } from './types'

export { portfolio, productLines, PortfolioError, validatePortfolio } from './portfolio'
export type { AvailabilityStatus, InstallSource, Product, ProductLine, ProductLineId } from './types'

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

/** The six sites: the company home and one site per product. */
export type SiteId = 'home' | 'docmapper' | 'anycontext' | 'devcycle' | 'gedo' | 'aurora'
export type ProductId = Exclude<SiteId, 'home'>

const PRODUCT_SITE_IDS: readonly ProductId[] = ['docmapper', 'anycontext', 'devcycle', 'gedo', 'aurora']

/** The release candidate signup function (Cloud Functions, Montreal); the product sites call its routes. */
export const releaseSignupEndpoint = 'https://northamerica-northeast1-levix-digital.cloudfunctions.net/releaseSignup'

/** The product of the portfolio with this id; the build stops when it is missing. */
export function productById(id: ProductId): Product {
  const product = portfolio.find((entry) => entry.id === id)
  if (product === undefined) throw new PortfolioError(`Product ${id} is not in the portfolio`)
  return product
}

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
