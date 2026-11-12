/**
 * The text of the vault home prototype. The product links come from `@levix/content`; the
 * taglines and facts here are a draft for the prototype, taken from each product's README, and
 * move to the product data files (FEAT-014, FEAT-015) if this direction is approved.
 */
import { products, type ProductId, type ProductLink } from '@levix/content'

/** The hue of each product's logo and light in the vault, from the aurora palette. */
export type ProductHue = 'cyan' | 'emerald' | 'purple' | 'magenta'

export interface VaultProduct extends ProductLink {
  readonly tagline: string
  readonly facts: readonly string[]
  readonly hue: ProductHue
}

const DETAILS: Record<ProductId, Omit<VaultProduct, keyof ProductLink>> = {
  anycontext: {
    tagline: 'Answers from your own folders, documents and documentation sites, with citations.',
    facts: [
      'Indexes everything on your machine, from source code to PDF, Word and Excel.',
      'One workspace per project, with its own sources, settings and memory.',
      'Works with a cloud provider or a model running locally.',
    ],
    hue: 'cyan',
  },
  devcycle: {
    tagline: 'A development cycle from product idea to verified release, for teams that build with coding tools.',
    facts: [
      'One entry point that diagnoses the project and says where to start.',
      'Plans, approval gates and release candidates kept as files in the project.',
      'Works with the coding tools a team already uses.',
    ],
    hue: 'emerald',
  },
  gedo: {
    tagline: 'Collaboration on functions, types and modules instead of lines of text, built on Git.',
    facts: [
      'Conflicts merged by meaning, collisions found while they are born.',
      'History per code entity, stored in the repository itself.',
      'Travels through ordinary Git remotes.',
    ],
    hue: 'purple',
  },
  aurora: {
    tagline: 'One desktop window for the Dev Cycle Protocol, Gedo and AnyContext.',
    facts: [
      'A portfolio of the repositories you follow.',
      'Which engines are installed, and what each one enables.',
      'Light and dark Aurora Borealis themes.',
    ],
    hue: 'magenta',
  },
}

/** The products in the order the vault shows them around its ring. */
export const vaultProducts: readonly VaultProduct[] = products.map((product) => ({
  ...product,
  ...DETAILS[product.id],
}))

/** The company sections shown as the panels above the ring. */
export type VaultSectionId = 'about' | 'research' | 'contact'

export interface VaultSection {
  readonly id: VaultSectionId
  readonly label: string
  readonly title: string
  readonly body: readonly string[]
}

export const vaultSections: readonly VaultSection[] = [
  {
    id: 'about',
    label: 'About',
    title: 'Who we are',
    body: [
      'Levix Digital Inc. is a software company in Calgary, Alberta, Canada.',
      'We build tools for developers and teams: to understand their own material, to run a disciplined development cycle and to collaborate on code by meaning.',
    ],
  },
  {
    id: 'research',
    label: 'Research',
    title: 'Research and development',
    body: [
      'Our research line studies the LSIE algorithm: the method, a reproducible benchmark and the code.',
      'The paper is a work in progress and will be published here.',
    ],
  },
  {
    id: 'contact',
    label: 'Contact',
    title: 'Talk to us',
    body: ['Questions about a product, plans for your team or a partnership: write to us and we answer by email.'],
  },
]

export const vaultText = {
  title: 'Levix Digital',
  headline: 'Software that opens new ways to build.',
  intro:
    'Developer tools from Calgary, Canada: answers from your own files, a development cycle from idea to release, and collaboration on code by meaning.',
  enter: 'Open the vault',
  skip: 'Skip intro',
  replay: 'Replay intro',
  staticView: 'Static view',
  cinematicView: '3D view',
  back: 'Back to the vault',
  visit: 'Visit',
  close: 'Close',
  productsHeading: 'Products',
  ringHint: 'Choose a product',
  prototypeBadge: 'Prototype',
} as const
