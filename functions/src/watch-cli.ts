/**
 * Announces the new release candidates of every product: reads the pre-releases of each public releases repository
 * and announces those published in the last 3 days that were not announced yet. Run every hour by the
 * `Announce release candidates` workflow; `GITHUB_TOKEN` raises the GitHub API rate limit when set.
 */
import { announcementKey, announcementMails } from './announcements.js'
import { firestoreStore, runMain, senderSettings } from './cli-support.js'
import { PRODUCTS, type ProductId } from './products.js'
import { candidatesToAnnounce, releasesApiUrl, type GitHubRelease } from './release-watch.js'

async function releasesOf(product: ProductId): Promise<GitHubRelease[]> {
  const token = process.env.GITHUB_TOKEN
  const response = await fetch(releasesApiUrl(product), {
    headers: { Accept: 'application/vnd.github+json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  })
  if (response.status === 404) {
    console.log(`${product}: ${PRODUCTS[product].releases} not found or not public; skipped.`)
    return []
  }
  if (!response.ok) throw new Error(`${product}: GitHub answered ${response.status} for ${PRODUCTS[product].releases}`)
  return (await response.json()) as GitHubRelease[]
}

async function main(): Promise<void> {
  const store = firestoreStore()
  const sender = senderSettings()
  const now = new Date()
  for (const product of Object.keys(PRODUCTS) as ProductId[]) {
    for (const announcement of candidatesToAnnounce(product, await releasesOf(product), now)) {
      const mails = await announcementMails(store, announcement, sender, now)
      const result = await store.recordAnnouncement(announcementKey(announcement), announcement, now, mails)
      console.log(`${announcementKey(announcement)}: ${result === 'exists' ? 'already announced' : `${mails.length} email(s) queued`}`)
    }
  }
}

runMain(main)
