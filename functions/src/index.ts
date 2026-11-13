import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { defineString } from 'firebase-functions/params'
import * as logger from 'firebase-functions/logger'
import { onRequest } from 'firebase-functions/v2/https'
import { FirestoreStore } from './firestore-store.js'
import { createHandler, type RequestLog } from './http.js'
import { SENDER } from './sender.js'

/** Printed in every email (CASL); set in `.env.levix-digital`. */
const mailingAddress = defineString('SENDER_MAILING_ADDRESS')

const log: RequestLog = ({ error, ...entry }) => {
  if (error === undefined) logger.info('releaseSignup', entry)
  else logger.error('releaseSignup failed', { ...entry, error: error instanceof Error ? error.stack : String(error) })
}

let handle: ReturnType<typeof createHandler> | undefined

function handler(): ReturnType<typeof createHandler> {
  if (handle === undefined) {
    initializeApp()
    handle = createHandler(
      {
        store: new FirestoreStore(getFirestore()),
        sender: { ...SENDER, mailingAddress: mailingAddress.value() },
        now: () => new Date(),
      },
      log,
    )
  }
  return handle
}

/** Release candidate signup: POST /subscribe, /confirm and /unsubscribe from the product sites. */
export const releaseSignup = onRequest(
  { region: 'northamerica-northeast1', memory: '256MiB', maxInstances: 5, concurrency: 40 },
  (request, response) => handler()(request, response),
)
