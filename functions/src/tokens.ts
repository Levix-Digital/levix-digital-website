import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

const SECRET_BYTES = 32
const ID_PATTERN = /^[0-9a-f]{64}$/
const SECRET_PATTERN = /^[A-Za-z0-9_-]{43}$/

export function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

/** One subscription per address and product: the id is derived from both, so a repeated signup finds it. */
export function subscriptionId(email: string, product: string): string {
  return sha256(`${email}|${product}`)
}

export function createSecret(): string {
  return randomBytes(SECRET_BYTES).toString('base64url')
}

/** The token of an email link: the subscription id and a secret, so the function finds the record without a query. */
export function makeToken(id: string, secret: string): string {
  return `${id}.${secret}`
}

export function parseToken(token: unknown): { id: string; secret: string } | undefined {
  if (typeof token !== 'string') return undefined
  const [id, secret, ...rest] = token.split('.')
  if (rest.length > 0 || id === undefined || secret === undefined) return undefined
  if (!ID_PATTERN.test(id) || !SECRET_PATTERN.test(secret)) return undefined
  return { id, secret }
}

/** Compares in constant time, so the answer time does not reveal how much of a secret matched. */
export function sameSecret(secret: string, expected: string): boolean {
  const a = Buffer.from(secret)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}
