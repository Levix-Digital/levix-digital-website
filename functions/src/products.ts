/**
 * The products a visitor can subscribe to, with the addresses their emails link to. The functions are deployed on
 * their own, so they keep this copy of the portfolio's facts; a test checks it against `@levix/content`.
 */
export interface SubscribableProduct {
  readonly name: string
  /** The production site, where the confirmation and unsubscribe pages are. */
  readonly site: string
  /** The Firebase Hosting site, whose `web.app` address and preview channels may also call the function. */
  readonly hostingSite: string
  /** The public repository whose pre-releases tagged `vX.Y.Z-rc.N` are announced to the subscribers. */
  readonly releases: string
}

export const PRODUCTS = {
  docmapper: { name: 'DocMapper', site: 'https://docmapper.levix.digital', hostingSite: 'docmapper', releases: 'Levix-Digital/docmapper-releases' },
  anycontext: { name: 'AnyContext', site: 'https://anycontext.levix.digital', hostingSite: 'levix-anycontext', releases: 'Levix-Digital/any-context-releases' },
  devcycle: { name: 'Dev Cycle Protocol', site: 'https://devcycle.levix.digital', hostingSite: 'levix-devcycle', releases: 'Levix-Digital/dev-cycle-protocol-releases' },
  gedo: { name: 'Gedo', site: 'https://gedo.levix.digital', hostingSite: 'levix-gedo', releases: 'Levix-Digital/gedo-releases' },
  aurora: { name: 'Aurora Dev Suite', site: 'https://aurora.levix.digital', hostingSite: 'levix-aurora', releases: 'Levix-Digital/aurora-dev-suite-releases' },
} as const satisfies Record<string, SubscribableProduct>

export type ProductId = keyof typeof PRODUCTS

export function isProductId(value: unknown): value is ProductId {
  return typeof value === 'string' && Object.hasOwn(PRODUCTS, value)
}

/** Whether a browser origin is one of the product sites: production domain, `web.app` address or preview channel. */
export function isProductSiteOrigin(origin: string): boolean {
  return Object.values(PRODUCTS).some((product) => {
    if (origin === product.site) return true
    const hosting = new RegExp(`^https://${product.hostingSite}(--[a-z0-9-]+)?\\.web\\.app$`)
    return hosting.test(origin)
  })
}
