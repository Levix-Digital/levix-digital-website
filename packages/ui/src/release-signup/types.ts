/** The product facts the availability panel shows; the site passes them from its data (ui owns no facts). */
export interface PanelProduct {
  readonly id: string
  readonly name: string
  readonly statement: string
  readonly status: 'available' | 'preview' | 'in-development'
  readonly install?: { readonly url: string; readonly label: string } | undefined
  /** The latest release read while the site was built (FEAT-016); absent or null when it could not be read. */
  readonly release?: PanelRelease | null | undefined
}

/** The release the panel shows: its version, its notes page and a direct installer link per operating system. */
export interface PanelRelease {
  readonly version: string
  readonly url: string
  readonly downloads: readonly { readonly platform: 'windows' | 'macos' | 'linux'; readonly url: string }[]
}

/** The text of the panel, the signup form and the subscription pages, given by the site (ui owns no text). */
export interface AvailabilityStrings {
  readonly 'availability.label': string
  readonly 'availability.status.available': string
  readonly 'availability.status.preview': string
  readonly 'availability.status.in-development': string
  readonly 'availability.note.available': string
  readonly 'availability.note.preview': string
  readonly 'availability.note.in-development': string
  readonly 'availability.download': string
  readonly 'availability.release.available': string
  readonly 'availability.release.preview': string
  readonly 'availability.downloadFor': string
  readonly 'availability.platform.windows': string
  readonly 'availability.platform.macos': string
  readonly 'availability.platform.linux': string
  readonly 'availability.allDownloads': string
  readonly 'signup.heading': string
  readonly 'signup.lead': string
  readonly 'signup.email': string
  readonly 'signup.consent': string
  readonly 'signup.sender': string
  readonly 'signup.submit': string
  readonly 'signup.sending': string
  readonly 'signup.error.email': string
  readonly 'signup.error.consent': string
  readonly 'signup.success': string
  readonly 'signup.rateLimited': string
  readonly 'signup.unavailable': string
  readonly 'signup.noScript': string
  readonly 'subscription.confirm.title': string
  readonly 'subscription.unsubscribe.title': string
  readonly 'subscription.working': string
  readonly 'subscription.confirmed': string
  readonly 'subscription.expired': string
  readonly 'subscription.unsubscribed': string
  readonly 'subscription.missingToken': string
  readonly 'subscription.failed': string
  readonly 'subscription.back': string
}

/** Replaces each `{name}` with its value; a placeholder without a value stays visible rather than failing a page. */
export function fillText(text: string, values: Readonly<Record<string, string>>): string {
  return text.replace(/\{(\w+)\}/g, (placeholder, name: string) => values[name] ?? placeholder)
}
