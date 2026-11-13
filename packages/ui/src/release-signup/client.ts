/** What a signup request can come back with (contract: specs/010-product-availability-signup/contracts). */
export type SubscribeOutcome =
  | { readonly kind: 'check-inbox' }
  | { readonly kind: 'invalid'; readonly fields: readonly string[] }
  | { readonly kind: 'rate-limited' }
  | { readonly kind: 'unavailable' }

export type ConfirmOutcome = 'confirmed' | 'expired' | 'unavailable'
export type UnsubscribeOutcome = 'unsubscribed' | 'unavailable'

export interface SubscribeInput {
  readonly email: string
  readonly product: string
  readonly consent: boolean
  readonly consentVersion: string
  readonly page: string
  readonly website: string
}

/** The three routes of the release candidate signup function. */
export interface ReleaseSignupClient {
  subscribe(input: SubscribeInput): Promise<SubscribeOutcome>
  confirm(token: string): Promise<ConfirmOutcome>
  unsubscribe(token: string): Promise<UnsubscribeOutcome>
}

type Fetch = (url: string, init: RequestInit) => Promise<Response>

/** A client over `fetch`; a network failure or an unexpected answer is `unavailable`, never an exception. */
export function createReleaseSignupClient(endpoint: string, fetcher: Fetch = (url, init) => fetch(url, init)): ReleaseSignupClient {
  async function post(route: string, body: unknown): Promise<{ status: number; body: Record<string, unknown> } | undefined> {
    try {
      const response = await fetcher(`${endpoint}${route}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const parsed: unknown = await response.json().catch(() => ({}))
      return { status: response.status, body: typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {} }
    } catch {
      return undefined
    }
  }

  return {
    async subscribe(input) {
      const answer = await post('/subscribe', input)
      if (answer?.status === 202) return { kind: 'check-inbox' }
      if (answer?.status === 429) return { kind: 'rate-limited' }
      if (answer?.status === 400 && Array.isArray(answer.body.fields)) {
        return { kind: 'invalid', fields: answer.body.fields.filter((field): field is string => typeof field === 'string') }
      }
      return { kind: 'unavailable' }
    },
    async confirm(token) {
      const answer = await post('/confirm', { token })
      if (answer?.status === 200) return 'confirmed'
      if (answer?.status === 410) return 'expired'
      return 'unavailable'
    },
    async unsubscribe(token) {
      const answer = await post('/unsubscribe', { token })
      return answer?.status === 200 ? 'unsubscribed' : 'unavailable'
    },
  }
}
