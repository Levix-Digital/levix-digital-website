import { readFileSync } from 'node:fs'
import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import type { SenderSettings } from './email.js'
import { FirestoreStore } from './firestore-store.js'
import { SENDER } from './sender.js'

const PROJECT_ID = 'levix-digital'
const ENV_FILE = new URL('../.env.levix-digital', import.meta.url)

/** The sender with the mailing address the function is deployed with. */
export function senderSettings(): SenderSettings {
  const line = readFileSync(ENV_FILE, 'utf8')
    .split('\n')
    .find((entry) => entry.startsWith('SENDER_MAILING_ADDRESS='))
  const value = line?.slice('SENDER_MAILING_ADDRESS='.length).trim().replace(/^"|"$/g, '')
  if (!value) throw new Error(`SENDER_MAILING_ADDRESS is missing in ${ENV_FILE.pathname}`)
  return { ...SENDER, mailingAddress: value }
}

/** The project's Firestore with the caller's Google credentials (gcloud or the workflow's identity). */
export function firestoreStore(): FirestoreStore {
  initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID })
  return new FirestoreStore(getFirestore())
}

export function runMain(main: () => Promise<void>): void {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
