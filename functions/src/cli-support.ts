import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { FirestoreStore } from './firestore-store.js'

const PROJECT_ID = 'levix-digital'

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
