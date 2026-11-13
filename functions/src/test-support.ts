import { MemoryStore } from './store.js'
import type { SubscriptionService } from './subscriptions.js'

export const testSender = {
  from: 'Levix Digital <releases@levix.digital>',
  companyName: 'Levix Digital Inc.',
  mailingAddress: '31 Masters Square SE, Calgary, Alberta, Canada',
  contactEmail: 'contact@levix.digital',
}

/** A service over a memory store with a clock the test moves. */
export function testService(start = '2026-11-13T12:00:00Z'): SubscriptionService & { store: MemoryStore; advance(ms: number): void } {
  let now = new Date(start)
  return {
    store: new MemoryStore(),
    sender: testSender,
    now: () => now,
    advance(ms: number) {
      now = new Date(now.getTime() + ms)
    },
  }
}

/** The token after `#` of the first link to a page in a mail text. */
export function linkToken(text: string, page: 'confirm' | 'unsubscribe'): string {
  const match = new RegExp(`/subscription/${page}#(\\S+)`).exec(text)
  if (match?.[1] === undefined) throw new Error(`No ${page} link in the mail`)
  return match[1]
}
