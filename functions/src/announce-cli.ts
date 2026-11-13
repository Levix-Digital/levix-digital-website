/**
 * Announces a release candidate to the confirmed subscribers of a product. Run by the owner with Google credentials
 * that can write the project's Firestore (`gcloud auth application-default login`):
 *
 *   npm run announce -- --product gedo --version v0.2.0-rc.1 --url <download address> [--notes <file>] [--send]
 *
 * Without --send it only prints how many subscribers would receive it and the email of the first one.
 */
import { readFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { announcementKey, announcementMails, type Announcement } from './announcements.js'
import { firestoreStore, runMain } from './cli-support.js'
import { SENDER } from './sender.js'
import { isProductId } from './products.js'

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      product: { type: 'string' },
      version: { type: 'string' },
      url: { type: 'string' },
      notes: { type: 'string' },
      send: { type: 'boolean', default: false },
    },
  })
  if (!isProductId(values.product) || !values.version || !values.url) {
    throw new Error('Usage: npm run announce -- --product <id> --version <vX.Y.Z-rc.N> --url <https address> [--notes <file>] [--send]')
  }
  const announcement: Announcement = {
    product: values.product,
    version: values.version,
    downloadUrl: values.url,
    ...(values.notes === undefined ? {} : { notes: readFileSync(values.notes, 'utf8') }),
  }
  const store = firestoreStore()
  const now = new Date()
  const mails = await announcementMails(store, announcement, SENDER, now)
  console.log(`${mails.length} confirmed subscriber(s) of ${announcement.product}.`)
  if (!values.send) {
    if (mails[0] !== undefined) console.log(`\nSubject: ${mails[0].mail.message.subject}\n\n${mails[0].mail.message.text}`)
    console.log('Nothing sent. Run again with --send to queue the emails.')
    return
  }
  const result = await store.recordAnnouncement(announcementKey(announcement), announcement, now, mails)
  if (result === 'exists') throw new Error(`${announcementKey(announcement)} was already announced; nothing sent.`)
  console.log(`Queued ${mails.length} email(s).`)
}

runMain(main)
