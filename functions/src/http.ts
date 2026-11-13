import { isProductSiteOrigin } from './products.js'
import { clientOverLimit, confirm, subscribe, unsubscribe, type SubscriptionService } from './subscriptions.js'
import { validateSignup } from './validation.js'

/** The parts of an Express request the handler reads. */
export interface HttpRequest {
  readonly method: string
  readonly path: string
  readonly headers: Readonly<Record<string, string | string[] | undefined>>
  readonly body: unknown
  readonly ip?: string | undefined
}

/** The parts of an Express response the handler writes. */
export interface HttpResponse {
  status(code: number): HttpResponse
  set(name: string, value: string): HttpResponse
  json(body: unknown): void
  end(): void
}

/** One line per request: route, result and product; never an address or a token. */
export type RequestLog = (entry: { route: string; status: number; result: string; product?: string; error?: unknown }) => void

const PREFLIGHT_MAX_AGE_S = '3600'

function header(request: HttpRequest, name: string): string | undefined {
  const value = request.headers[name]
  return Array.isArray(value) ? value[0] : value
}

/** The client address as Google's front end reports it: the first entry of X-Forwarded-For. */
export function clientAddress(request: HttpRequest): string {
  const forwarded = header(request, 'x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || request.ip || 'unknown'
}

/** The HTTPS handler of `releaseSignup` (contract: contracts/release-signup-api.md). */
export function createHandler(service: SubscriptionService, log: RequestLog) {
  return async function handle(request: HttpRequest, response: HttpResponse): Promise<void> {
    const route = request.path.replace(/\/+$/, '') || '/'
    const origin = header(request, 'origin')
    const reply = (status: number, body: unknown, result: string, product?: string) => {
      log({ route, status, result, ...(product === undefined ? {} : { product }) })
      response.status(status).json(body)
    }

    if (origin === undefined || !isProductSiteOrigin(origin)) {
      log({ route, status: 403, result: 'origin-refused' })
      response.status(403).end()
      return
    }
    response.set('Access-Control-Allow-Origin', origin).set('Vary', 'Origin')
    if (request.method === 'OPTIONS') {
      response
        .set('Access-Control-Allow-Methods', 'POST')
        .set('Access-Control-Allow-Headers', 'Content-Type')
        .set('Access-Control-Max-Age', PREFLIGHT_MAX_AGE_S)
        .status(204)
        .end()
      return
    }
    if (request.method !== 'POST') {
      reply(405, { error: 'method-not-allowed' }, 'method-not-allowed')
      return
    }

    try {
      switch (route) {
        case '/subscribe': {
          if (await clientOverLimit(service, clientAddress(request))) {
            reply(429, { error: 'rate-limited' }, 'rate-limited')
            return
          }
          const validation = validateSignup(request.body)
          if (validation.kind === 'invalid') {
            reply(400, { error: 'invalid', fields: validation.fields }, 'invalid')
            return
          }
          if (validation.kind === 'bot') {
            reply(202, { status: 'check-inbox' }, 'honeypot')
            return
          }
          const result = await subscribe(service, validation.request)
          reply(202, { status: 'check-inbox' }, result, validation.request.product)
          return
        }
        case '/confirm': {
          const result = await confirm(service, field(request.body, 'token'))
          if (result.status === 'confirmed') reply(200, result, 'confirmed', result.product)
          else reply(410, { error: 'expired' }, 'expired')
          return
        }
        case '/unsubscribe': {
          await unsubscribe(service, field(request.body, 'token'))
          reply(200, { status: 'unsubscribed' }, 'unsubscribed')
          return
        }
        default:
          reply(404, { error: 'not-found' }, 'not-found')
      }
    } catch (error) {
      log({ route, status: 500, result: 'error', error })
      response.status(500).json({ error: 'unavailable' })
    }
  }
}

function field(body: unknown, name: string): unknown {
  return typeof body === 'object' && body !== null ? (body as Record<string, unknown>)[name] : undefined
}
