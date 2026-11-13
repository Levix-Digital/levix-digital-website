import { confirmationEmail, type SenderSettings } from './email.js'
import { EMAIL_COOLDOWN_MS, clientHourKey, overClientLimit } from './limits.js'
import { PRODUCTS, type ProductId } from './products.js'
import type { SubscriptionRecord, SubscriptionStore } from './store.js'
import { createSecret, makeToken, parseToken, sameSecret, sha256, subscriptionId } from './tokens.js'
import type { SignupRequest } from './validation.js'

/** How long a confirmation link works and a pending subscription is kept. */
export const PENDING_KEPT_MS = 7 * 24 * 60 * 60 * 1000

export interface SubscriptionService {
  readonly store: SubscriptionStore
  readonly sender: SenderSettings
  readonly now: () => Date
}

/** `queued`: a confirmation email was queued; `unchanged`: nothing to send (already confirmed or emailed lately). */
export type SubscribeResult = 'queued' | 'unchanged'

/** Counts the request of a client in the current hour; true when the client is over the limit. */
export async function clientOverLimit(service: SubscriptionService, clientAddress: string): Promise<boolean> {
  const { key, expiresAt } = clientHourKey(clientAddress, service.now())
  return overClientLimit(await service.store.increment(key, expiresAt))
}

function pendingRecord(request: SignupRequest, now: Date, confirmSecret: string, unsubscribeSecret: string): SubscriptionRecord {
  return {
    email: request.email,
    product: request.product,
    state: 'pending',
    consent: { version: request.consentVersion, text: request.consentText, page: request.page, givenAt: now },
    confirmHash: sha256(confirmSecret),
    unsubscribeSecret,
    lastEmailAt: now,
    expiresAt: new Date(now.getTime() + PENDING_KEPT_MS),
  }
}

/** Stores a pending subscription and queues its confirmation email, unless one was sent in the last 24 hours. */
export async function subscribe(service: SubscriptionService, request: SignupRequest): Promise<SubscribeResult> {
  const now = service.now()
  const id = subscriptionId(request.email, request.product)
  return service.store.change(id, (current) => {
    if (current?.state === 'confirmed') return { result: 'unchanged' }
    const live = current !== undefined && isLivePending(current, now)
    if (live && now.getTime() - current.lastEmailAt.getTime() < EMAIL_COOLDOWN_MS) return { result: 'unchanged' }

    const confirmSecret = createSecret()
    const unsubscribeSecret = createSecret()
    const mail = confirmationEmail({
      to: request.email,
      product: PRODUCTS[request.product],
      confirmToken: makeToken(id, confirmSecret),
      unsubscribeToken: makeToken(id, unsubscribeSecret),
      sender: service.sender,
      now,
    })
    return { next: pendingRecord(request, now, confirmSecret, unsubscribeSecret), mail, result: 'queued' }
  })
}

function isLivePending(record: SubscriptionRecord, now: Date): boolean {
  return record.state === 'pending' && record.expiresAt !== undefined && record.expiresAt.getTime() > now.getTime()
}

export type ConfirmResult = { readonly status: 'confirmed'; readonly product: ProductId } | { readonly status: 'expired' }

/** Confirms a pending subscription whose link is still valid; a confirmed one answers confirmed again. */
export async function confirm(service: SubscriptionService, token: unknown): Promise<ConfirmResult> {
  const parsed = parseToken(token)
  if (parsed === undefined) return { status: 'expired' }
  const now = service.now()
  return service.store.change<ConfirmResult>(parsed.id, (current) => {
    if (current === undefined || !sameSecret(sha256(parsed.secret), current.confirmHash)) return { result: { status: 'expired' } }
    if (current.state === 'confirmed') return { result: { status: 'confirmed', product: current.product } }
    if (!isLivePending(current, now)) return { result: { status: 'expired' } }
    const confirmed: SubscriptionRecord = {
      email: current.email,
      product: current.product,
      state: 'confirmed',
      consent: current.consent,
      confirmedAt: now,
      confirmHash: current.confirmHash,
      unsubscribeSecret: current.unsubscribeSecret,
      lastEmailAt: current.lastEmailAt,
    }
    return { next: confirmed, result: { status: 'confirmed', product: current.product } }
  })
}

/** Deletes the subscription the link belongs to; a link whose subscription is gone, or does not match, deletes nothing. */
export async function unsubscribe(service: SubscriptionService, token: unknown): Promise<void> {
  const parsed = parseToken(token)
  if (parsed === undefined) return
  await service.store.change(parsed.id, (current) =>
    current !== undefined && sameSecret(parsed.secret, current.unsubscribeSecret) ? { next: null, result: undefined } : { result: undefined },
  )
}
