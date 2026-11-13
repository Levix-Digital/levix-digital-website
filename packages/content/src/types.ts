/** The product facts the sites show (ADR-0005, ADR-0014). */

/** Whether a product can be installed today: a public release, pre-release builds, or neither. */
export type AvailabilityStatus = 'available' | 'preview' | 'in-development'

export const AVAILABILITY_STATUSES: readonly AvailabilityStatus[] = ['available', 'preview', 'in-development']

/** The two product lines, in the order the home shows them. */
export type ProductLineId = 'documents' | 'development'

export interface ProductLine {
  readonly id: ProductLineId
  readonly name: string
  readonly summary: string
}

/** Where an installable product is downloaded or installed from, and the label of the action that opens it. */
export interface InstallSource {
  readonly url: string
  readonly label: string
}

/**
 * A product of the portfolio. `site` is set only for products that have their own site. `statement` says what the
 * product is for, never its application type (desktop, web, command line): that belongs to the product's own site.
 */
export interface Product {
  readonly id: string
  readonly name: string
  readonly line: ProductLineId
  readonly statement: string
  readonly status: AvailabilityStatus
  readonly site?: string
  /** Set exactly when the product can be installed (available or preview). */
  readonly install?: InstallSource
}
