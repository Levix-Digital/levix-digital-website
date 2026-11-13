import { sha256 } from './tokens.js'

export const MAX_SIGNUPS_PER_CLIENT_PER_HOUR = 10
/** At most one confirmation email per address and product in this period. */
export const EMAIL_COOLDOWN_MS = 24 * 60 * 60 * 1000
const HOUR_MS = 60 * 60 * 1000

/** The counter of a client for the current UTC hour; the client address is stored only as a hash. */
export function clientHourKey(clientAddress: string, now: Date): { key: string; expiresAt: Date } {
  const hourStart = Math.floor(now.getTime() / HOUR_MS) * HOUR_MS
  const hour = new Date(hourStart).toISOString().slice(0, 13)
  return { key: sha256(`${clientAddress}|${hour}`), expiresAt: new Date(hourStart + 2 * HOUR_MS) }
}

export function overClientLimit(count: number): boolean {
  return count > MAX_SIGNUPS_PER_CLIENT_PER_HOUR
}
