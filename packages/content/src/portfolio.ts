import { anycontext } from './products/anycontext'
import { aurora } from './products/aurora'
import { devcycle } from './products/devcycle'
import { docmapper } from './products/docmapper'
import { gedo } from './products/gedo'
import { AVAILABILITY_STATUSES, type Product, type ProductLine } from './types'

export const productLines: readonly ProductLine[] = [
  {
    id: 'documents',
    name: 'Documents and knowledge',
    summary: 'For teams that extract, search and question documents that cannot leave the organization.',
  },
  {
    id: 'development',
    name: 'Software development with agents',
    summary: 'For teams that build software with coding agents: developers, technical leads and managers keep the decisions.',
  },
]

/** Raised when a product entry breaks the rules of the portfolio; the build stops on it. */
export class PortfolioError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PortfolioError'
  }
}

/** Checks every entry and returns the portfolio unchanged, or throws naming the faulty product. */
export function validatePortfolio(entries: readonly Product[], lines: readonly ProductLine[]): readonly Product[] {
  const lineIds = new Set(lines.map((line) => line.id))
  const seen = new Set<string>()
  for (const product of entries) {
    const label = product.id || '(no id)'
    if (!product.id) throw new PortfolioError('A product has no id')
    if (seen.has(product.id)) throw new PortfolioError(`Product ${label} is listed twice`)
    seen.add(product.id)
    if (!product.name.trim()) throw new PortfolioError(`Product ${label} has no name`)
    if (!product.statement.trim()) throw new PortfolioError(`Product ${label} has no statement`)
    if (!lineIds.has(product.line)) throw new PortfolioError(`Product ${label} has the unknown line "${product.line}"`)
    if (!AVAILABILITY_STATUSES.includes(product.status)) {
      throw new PortfolioError(`Product ${label} has the unknown status "${product.status}"`)
    }
    if (product.site !== undefined && !product.site.startsWith('https://')) {
      throw new PortfolioError(`Product ${label} has a site that is not an https address`)
    }
  }
  return entries
}

/** Every product, documents line first, in the order the home shows them. */
export const portfolio: readonly Product[] = validatePortfolio(
  [docmapper, anycontext, devcycle, gedo, aurora],
  productLines,
)
