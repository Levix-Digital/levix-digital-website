import { FieldValue, Timestamp, type DocumentData, type DocumentReference, type Firestore } from 'firebase-admin/firestore'
import type { Announcement, AnnouncementMail, AnnouncementStore } from './announcements.js'
import type { ProductId } from './products.js'
import type { Consent, OutgoingMail, SubscriptionChange, SubscriptionRecord, SubscriptionStore } from './store.js'

export const SUBSCRIPTIONS = 'releaseSubscriptions'
export const SIGNUP_LIMITS = 'releaseSignupLimits'
/** The collection the Trigger Email extension reads. */
export const MAIL = 'mail'
export const ANNOUNCEMENTS = 'releaseAnnouncements'
/** Firestore allows 500 writes per batch. */
const BATCH_WRITES = 400

function toDate(value: unknown): Date | undefined {
  return value instanceof Timestamp ? value.toDate() : undefined
}

function required(value: Date | undefined, name: string, id: string): Date {
  if (value === undefined) throw new Error(`Subscription ${id} has no ${name}`)
  return value
}

function fromDocument(id: string, data: DocumentData): SubscriptionRecord {
  const consent = data.consent as Record<string, unknown>
  const record: SubscriptionRecord = {
    email: data.email,
    product: data.product,
    state: data.state,
    consent: {
      version: consent.version,
      text: consent.text,
      page: consent.page,
      givenAt: required(toDate(consent.givenAt), 'consent time', id),
    } as Consent,
    confirmHash: data.confirmHash,
    unsubscribeSecret: data.unsubscribeSecret,
    lastEmailAt: required(toDate(data.lastEmailAt), 'last email time', id),
  }
  const confirmedAt = toDate(data.confirmedAt)
  const expiresAt = toDate(data.expiresAt)
  return {
    ...record,
    ...(confirmedAt === undefined ? {} : { confirmedAt }),
    ...(expiresAt === undefined ? {} : { expiresAt }),
  }
}

/** Subscriptions, signup counters and mail in Firestore; dates are stored as timestamps. */
export class FirestoreStore implements SubscriptionStore, AnnouncementStore {
  constructor(private readonly db: Firestore) {}

  change<T>(id: string, apply: (current: SubscriptionRecord | undefined) => SubscriptionChange<T>): Promise<T> {
    const reference = this.db.collection(SUBSCRIPTIONS).doc(id)
    return this.db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(reference)
      const data = snapshot.data()
      const change = apply(data === undefined ? undefined : fromDocument(id, data))
      if (change.next === null) transaction.delete(reference)
      else if (change.next !== undefined) transaction.set(reference, change.next)
      if (change.mail !== undefined) transaction.create(this.db.collection(MAIL).doc(), mailDocument(change.mail))
      return change.result
    })
  }

  async increment(key: string, expiresAt: Date): Promise<number> {
    const reference = this.db.collection(SIGNUP_LIMITS).doc(key)
    await reference.set({ count: FieldValue.increment(1), expiresAt }, { merge: true })
    const snapshot = await reference.get()
    return Number(snapshot.get('count') ?? 0)
  }

  async confirmedSubscriptions(product: ProductId): Promise<{ id: string; record: SubscriptionRecord }[]> {
    const snapshot = await this.db
      .collection(SUBSCRIPTIONS)
      .where('product', '==', product)
      .where('state', '==', 'confirmed')
      .get()
    return snapshot.docs.map((document) => ({ id: document.id, record: fromDocument(document.id, document.data()) }))
  }

  /**
   * Creates the announcement record (`queuing`), queues one mail per subscriber with the id
   * `<key>-<subscription id>`, then marks it `queued`. A record left `queuing` by a failed run is resumed: mails
   * that exist are skipped, and `create` refuses a mail written twice, so nobody gets the announcement twice.
   */
  async recordAnnouncement(key: string, announcement: Announcement, at: Date, mails: readonly AnnouncementMail[]): Promise<'recorded' | 'exists'> {
    const reference = this.db.collection(ANNOUNCEMENTS).doc(key)
    try {
      await reference.create({ ...announcement, createdAt: at, recipients: mails.length, state: 'queuing' })
    } catch (error) {
      if ((error as { code?: number }).code !== ALREADY_EXISTS) throw error
      if ((await reference.get()).get('state') !== 'queuing') return 'exists'
    }
    for (let start = 0; start < mails.length; start += BATCH_WRITES) {
      const chunk = mails.slice(start, start + BATCH_WRITES)
      const references = chunk.map(({ subscriber }) => this.db.collection(MAIL).doc(`${key}-${subscriber}`))
      const existing = await this.db.getAll(...references)
      const batch = this.db.batch()
      chunk.forEach(({ mail }, index) => {
        if (!existing[index]?.exists) batch.create(references[index] as DocumentReference, mailDocument(mail))
      })
      await batch.commit()
    }
    await reference.update({ state: 'queued', recipients: mails.length })
    return 'recorded'
  }
}

/** gRPC status of a create on an existing document. */
const ALREADY_EXISTS = 6

function mailDocument(mail: OutgoingMail): DocumentData {
  return { to: mail.to, from: mail.from, message: mail.message, headers: mail.headers, deleteAt: mail.deleteAt }
}
