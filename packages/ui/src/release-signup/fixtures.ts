import type { ConfirmOutcome, ReleaseSignupClient, SubscribeInput, SubscribeOutcome, UnsubscribeOutcome } from './client'
import type { AvailabilityStrings, PanelProduct } from './types'

const KEYS = [
  'availability.label',
  'availability.status.available',
  'availability.status.preview',
  'availability.status.in-development',
  'availability.note.available',
  'availability.note.preview',
  'availability.note.in-development',
  'availability.download',
  'availability.release.available',
  'availability.release.preview',
  'availability.downloadFor',
  'availability.platform.windows',
  'availability.platform.macos',
  'availability.platform.linux',
  'availability.allDownloads',
  'signup.heading',
  'signup.lead',
  'signup.email',
  'signup.consent',
  'signup.sender',
  'signup.submit',
  'signup.sending',
  'signup.error.email',
  'signup.error.consent',
  'signup.success',
  'signup.rateLimited',
  'signup.unavailable',
  'signup.noScript',
  'subscription.confirm.title',
  'subscription.unsubscribe.title',
  'subscription.working',
  'subscription.confirmed',
  'subscription.expired',
  'subscription.unsubscribed',
  'subscription.missingToken',
  'subscription.failed',
  'subscription.back',
] as const satisfies readonly (keyof AvailabilityStrings)[]

/** Each text is its own key followed by the placeholders, so tests can tell which one is shown. */
export const strings = Object.fromEntries(KEYS.map((key) => [key, `[${key}] {product} {email}`])) as unknown as AvailabilityStrings

export const inDevelopment: PanelProduct = { id: 'gedo', name: 'Gedo', statement: 'Merges by meaning.', status: 'in-development' }
export const available: PanelProduct = {
  id: 'anycontext',
  name: 'AnyContext',
  statement: 'Answers from your folders.',
  status: 'available',
  install: { url: 'https://example.com/download', label: 'Download' },
}

/** A client that records its calls and answers what the test sets. */
export function fakeClient(answers: { subscribe?: SubscribeOutcome; confirm?: ConfirmOutcome; unsubscribe?: UnsubscribeOutcome } = {}) {
  const calls: { route: string; payload: SubscribeInput | string }[] = []
  const client: ReleaseSignupClient = {
    async subscribe(input) {
      calls.push({ route: 'subscribe', payload: input })
      return answers.subscribe ?? { kind: 'check-inbox' }
    },
    async confirm(token) {
      calls.push({ route: 'confirm', payload: token })
      return answers.confirm ?? 'confirmed'
    },
    async unsubscribe(token) {
      calls.push({ route: 'unsubscribe', payload: token })
      return answers.unsubscribe ?? 'unsubscribed'
    },
  }
  return { client, calls }
}
