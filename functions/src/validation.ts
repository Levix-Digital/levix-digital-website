import { consentText } from './consent.js'
import { PRODUCTS, isProductId, type ProductId } from './products.js'

/** The longest address SMTP accepts (RFC 5321 path limit). */
const MAX_EMAIL_LENGTH = 254
const MAX_PAGE_LENGTH = 500
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/

export interface SignupRequest {
  readonly email: string
  readonly product: ProductId
  readonly consentVersion: string
  readonly consentText: string
  readonly page: string
}

export type InvalidField = 'email' | 'consent' | 'product'

export type SignupValidation =
  | { readonly kind: 'valid'; readonly request: SignupRequest }
  | { readonly kind: 'invalid'; readonly fields: readonly InvalidField[] }
  /** The honeypot field was filled: answer as if accepted, store nothing. */
  | { readonly kind: 'bot' }

/** Trims and lowercases an address, so the same mailbox is one subscription. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidEmail(email: string): boolean {
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email)
}

function field(body: unknown, name: string): unknown {
  return typeof body === 'object' && body !== null ? (body as Record<string, unknown>)[name] : undefined
}

/** Checks a signup body (contract: POST /subscribe) and returns the request to store, or what is wrong with it. */
export function validateSignup(body: unknown): SignupValidation {
  const honeypot = field(body, 'website')
  if (typeof honeypot === 'string' && honeypot !== '') return { kind: 'bot' }

  const fields: InvalidField[] = []
  const rawEmail = field(body, 'email')
  const email = typeof rawEmail === 'string' ? normalizeEmail(rawEmail) : ''
  if (!isValidEmail(email)) fields.push('email')

  const product = field(body, 'product')
  if (!isProductId(product)) fields.push('product')

  const version = field(body, 'consentVersion')
  const text = isProductId(product) && typeof version === 'string' ? consentText(version, PRODUCTS[product].name) : undefined
  if (field(body, 'consent') !== true || text === undefined) fields.push('consent')

  if (fields.length > 0 || !isProductId(product) || text === undefined) return { kind: 'invalid', fields }

  const page = field(body, 'page')
  const pageAddress =
    typeof page === 'string' && page.startsWith('https://') && page.length <= MAX_PAGE_LENGTH ? page : PRODUCTS[product].site
  return {
    kind: 'valid',
    request: { email, product, consentVersion: version as string, consentText: text, page: pageAddress },
  }
}
