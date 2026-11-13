import type { Announcement, AnnouncementStore } from './announcements.js'
import type { ProductId } from './products.js'

export interface Consent {
  readonly version: string
  readonly text: string
  readonly page: string
  readonly givenAt: Date
}

/** One address subscribed to one product (data model: ReleaseSubscription). */
export interface SubscriptionRecord {
  readonly email: string
  readonly product: ProductId
  readonly state: 'pending' | 'confirmed'
  readonly consent: Consent
  readonly confirmedAt?: Date
  /** SHA-256 of the confirmation secret. */
  readonly confirmHash: string
  /** Kept as is: every later email to the subscriber needs it for its unsubscribe link. */
  readonly unsubscribeSecret: string
  readonly lastEmailAt: Date
  /** Deletion time of a pending subscription (Firestore TTL); absent once confirmed. */
  readonly expiresAt?: Date
}

/** A message for the Trigger Email extension (data model: Mail). */
export interface OutgoingMail {
  readonly to: string
  readonly from: string
  readonly message: { readonly subject: string; readonly text: string; readonly html: string }
  readonly headers: Readonly<Record<string, string>>
  readonly deleteAt: Date
}

/**
 * What a change does to one subscription: the record to write (`null` deletes it, `undefined` leaves it), a mail to
 * queue with it, and the answer for the caller.
 */
export interface SubscriptionChange<T> {
  readonly next?: SubscriptionRecord | null
  readonly mail?: OutgoingMail
  readonly result: T
}

/** Storage of subscriptions, signup counters and outgoing mail; each method is atomic. */
export interface SubscriptionStore {
  /** Reads the subscription, applies the change and writes it with its mail in one transaction. */
  change<T>(id: string, apply: (current: SubscriptionRecord | undefined) => SubscriptionChange<T>): Promise<T>
  /** Adds one to the counter of a key and returns the new count; the counter is deleted after `expiresAt`. */
  increment(key: string, expiresAt: Date): Promise<number>
}

/** The store used by the tests and by local runs without Firestore. */
export class MemoryStore implements SubscriptionStore, AnnouncementStore {
  readonly subscriptions = new Map<string, SubscriptionRecord>()
  readonly counters = new Map<string, number>()
  readonly mails: OutgoingMail[] = []
  readonly announcements = new Map<string, Announcement>()

  async change<T>(id: string, apply: (current: SubscriptionRecord | undefined) => SubscriptionChange<T>): Promise<T> {
    const change = apply(this.subscriptions.get(id))
    if (change.next === null) this.subscriptions.delete(id)
    else if (change.next !== undefined) this.subscriptions.set(id, change.next)
    if (change.mail !== undefined) this.mails.push(change.mail)
    return change.result
  }

  async increment(key: string): Promise<number> {
    const count = (this.counters.get(key) ?? 0) + 1
    this.counters.set(key, count)
    return count
  }

  async confirmedSubscriptions(product: ProductId): Promise<{ id: string; record: SubscriptionRecord }[]> {
    return [...this.subscriptions].flatMap(([id, record]) =>
      record.product === product && record.state === 'confirmed' ? [{ id, record }] : [],
    )
  }

  async recordAnnouncement(key: string, announcement: Announcement, _at: Date, mails: readonly OutgoingMail[]): Promise<'recorded' | 'exists'> {
    if (this.announcements.has(key)) return 'exists'
    this.announcements.set(key, announcement)
    this.mails.push(...mails)
    return 'recorded'
  }
}
