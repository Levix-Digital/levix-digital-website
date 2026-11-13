import type { SubscribableProduct } from './products.js'
import type { OutgoingMail } from './store.js'

/** Who the emails come from, printed in every one of them (CASL sender identification). */
export interface SenderSettings {
  readonly from: string
  readonly companyName: string
  readonly mailingAddress: string
  readonly contactEmail: string
}

export const MAIL_KEPT_MS = 30 * 24 * 60 * 60 * 1000

/** The deployed `releaseSignup` function, which mail clients call for one-click unsubscribe (RFC 8058). */
export const SIGNUP_FUNCTION_URL = 'https://northamerica-northeast1-levix-digital.cloudfunctions.net/releaseSignup'

/** `List-Unsubscribe` with a one-click POST address, so a mail client's own unsubscribe button works. */
export function unsubscribeHeaders(token: string): Record<string, string> {
  return {
    'List-Unsubscribe': `<${SIGNUP_FUNCTION_URL}/one-click-unsubscribe?token=${encodeURIComponent(token)}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  }
}

export function confirmLink(product: SubscribableProduct, token: string): string {
  return `${product.site}/subscription/confirm#${token}`
}

export function unsubscribeLink(product: SubscribableProduct, token: string): string {
  return `${product.site}/subscription/unsubscribe#${token}`
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`)
}

function senderFooter(sender: SenderSettings, unsubscribe: string): { text: string; html: string } {
  const lines = [`${sender.companyName}, ${sender.mailingAddress}`, `Contact: ${sender.contactEmail}`, `Unsubscribe: ${unsubscribe}`]
  const html = `<p>${escapeHtml(lines[0] as string)}<br>Contact: ${htmlLink(`mailto:${sender.contactEmail}`, sender.contactEmail)}<br>${htmlLink(unsubscribe, 'Unsubscribe')}</p>`
  return { text: `-- \n${lines.join('\n')}\n`, html }
}

function htmlLink(url: string, label: string): string {
  return `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`
}

/** The announcement of a release candidate to a confirmed subscriber, with their own unsubscribe link. */
export function announcementEmail(input: {
  to: string
  product: SubscribableProduct
  version: string
  downloadUrl: string
  notes?: string
  unsubscribeToken: string
  sender: SenderSettings
  now: Date
}): OutgoingMail {
  const { product, sender } = input
  const unsubscribe = unsubscribeLink(product, input.unsubscribeToken)
  const footer = senderFooter(sender, unsubscribe)
  const intro = `Release candidate ${input.version} of ${product.name} is ready to download and test.`
  const reason = `You receive this email because you asked ${sender.companyName} to tell you about release candidates of ${product.name}.`
  const notes = input.notes?.trim()
  const text = [intro, `Download: ${input.downloadUrl}`, ...(notes ? [notes] : []), reason].join('\n\n')
  const html = [
    `<p>${escapeHtml(intro)}</p>`,
    `<p>${htmlLink(input.downloadUrl, `Download ${product.name} ${input.version}`)}</p>`,
    ...(notes ? [`<p>${escapeHtml(notes).replaceAll('\n', '<br>')}</p>`] : []),
    `<p>${escapeHtml(reason)}</p>`,
    '<hr>',
    footer.html,
  ].join('\n')
  return {
    to: input.to,
    from: sender.from,
    message: { subject: `${product.name} ${input.version}: release candidate ready to test`, text: `${text}\n\n${footer.text}`, html },
    headers: unsubscribeHeaders(input.unsubscribeToken),
    deleteAt: new Date(input.now.getTime() + MAIL_KEPT_MS),
  }
}

/** The double opt-in email: what was asked, the confirmation link, and the sender block with the unsubscribe link. */
export function confirmationEmail(input: {
  to: string
  product: SubscribableProduct
  confirmToken: string
  unsubscribeToken: string
  sender: SenderSettings
  now: Date
}): OutgoingMail {
  const { product, sender } = input
  const confirm = confirmLink(product, input.confirmToken)
  const unsubscribe = unsubscribeLink(product, input.unsubscribeToken)
  const paragraphs = [
    `You asked to receive emails from ${sender.companyName} about release candidates of ${product.name}, so you can download and test them before the release.`,
    'Confirm your subscription with this link (valid for 7 days):',
    confirm,
    'If you did not ask for this, ignore this email: without confirmation the address is deleted in 7 days.',
  ]
  const footer = senderFooter(sender, unsubscribe)
  const text = `${paragraphs.join('\n\n')}\n\n${footer.text}`
  const html = [
    `<p>${escapeHtml(paragraphs[0] as string)}</p>`,
    `<p>${htmlLink(confirm, 'Confirm my subscription')} (valid for 7 days)</p>`,
    `<p>${escapeHtml(paragraphs[3] as string)}</p>`,
    '<hr>',
    footer.html,
  ].join('\n')
  return {
    to: input.to,
    from: sender.from,
    message: { subject: `Confirm: ${product.name} release candidates from Levix Digital`, text, html },
    headers: unsubscribeHeaders(input.unsubscribeToken),
    deleteAt: new Date(input.now.getTime() + MAIL_KEPT_MS),
  }
}
