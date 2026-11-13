import { checkAnnouncement, type Announcement } from './announcements.js'
import { PRODUCTS, type ProductId } from './products.js'

/** The fields of a GitHub release the watcher reads. */
export interface GitHubRelease {
  readonly tag_name: string
  readonly html_url: string
  readonly body?: string | null
  readonly draft: boolean
  readonly prerelease: boolean
  readonly published_at?: string | null
}

/** Release candidates older than this are never announced, so the first run does not announce past ones. */
export const ANNOUNCE_WITHIN_MS = 3 * 24 * 60 * 60 * 1000
const MAX_NOTES_LENGTH = 2000
const RC_TAG = /^v\d+\.\d+\.\d+-rc\.\d+$/

/** The published release candidates of a product, recent enough to announce, oldest first. */
export function candidatesToAnnounce(product: ProductId, releases: readonly GitHubRelease[], now: Date): Announcement[] {
  return releases
    .filter((release) => !release.draft && release.prerelease && RC_TAG.test(release.tag_name))
    .filter((release) => {
      const published = release.published_at ? Date.parse(release.published_at) : Number.NaN
      return Number.isFinite(published) && now.getTime() - published <= ANNOUNCE_WITHIN_MS
    })
    .sort((a, b) => Date.parse(a.published_at as string) - Date.parse(b.published_at as string))
    .map((release) => {
      const notes = release.body?.trim().slice(0, MAX_NOTES_LENGTH)
      const announcement: Announcement = {
        product,
        version: release.tag_name,
        downloadUrl: release.html_url,
        ...(notes ? { notes } : {}),
      }
      checkAnnouncement(announcement)
      return announcement
    })
}

/** The GitHub API address of the latest releases of a product's releases repository. */
export function releasesApiUrl(product: ProductId): string {
  return `https://api.github.com/repos/${PRODUCTS[product].releases}/releases?per_page=20`
}
