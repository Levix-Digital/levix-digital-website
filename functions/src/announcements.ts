import { announcementEmail, type SenderSettings } from './email.js'
import { PRODUCTS, type ProductId } from './products.js'
import type { OutgoingMail, SubscriptionRecord } from './store.js'
import { makeToken } from './tokens.js'

/** A release candidate announced to the confirmed subscribers of a product. */
export interface Announcement {
  readonly product: ProductId
  readonly version: string
  readonly downloadUrl: string
  readonly notes?: string
}

/** Reading the subscribers and recording an announcement with its mail. */
export interface AnnouncementStore {
  confirmedSubscriptions(product: ProductId): Promise<readonly { id: string; record: SubscriptionRecord }[]>
  /** Records the announcement once and queues its mail; `exists` when it was already announced, queuing nothing. */
  recordAnnouncement(key: string, announcement: Announcement, at: Date, mails: readonly OutgoingMail[]): Promise<'recorded' | 'exists'>
}

const VERSION_PATTERN = /^v?\d+\.\d+\.\d+-rc\.\d+$/

export class AnnouncementError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AnnouncementError'
  }
}

/** Checks the command's input: a release candidate version and an https download address. */
export function checkAnnouncement(announcement: Announcement): void {
  if (!VERSION_PATTERN.test(announcement.version)) {
    throw new AnnouncementError(`"${announcement.version}" is not a release candidate version (vX.Y.Z-rc.N)`)
  }
  if (!announcement.downloadUrl.startsWith('https://')) throw new AnnouncementError('The download address must be an https address')
}

export function announcementKey(announcement: Announcement): string {
  return `${announcement.product}-${announcement.version}`
}

/** One email per confirmed subscriber of the product, each with its own unsubscribe link. */
export async function announcementMails(
  store: AnnouncementStore,
  announcement: Announcement,
  sender: SenderSettings,
  now: Date,
): Promise<OutgoingMail[]> {
  checkAnnouncement(announcement)
  const subscribers = await store.confirmedSubscriptions(announcement.product)
  return subscribers.map(({ id, record }) =>
    announcementEmail({
      to: record.email,
      product: PRODUCTS[announcement.product],
      version: announcement.version,
      downloadUrl: announcement.downloadUrl,
      ...(announcement.notes === undefined ? {} : { notes: announcement.notes }),
      unsubscribeToken: makeToken(id, record.unsubscribeSecret),
      sender,
      now,
    }),
  )
}
