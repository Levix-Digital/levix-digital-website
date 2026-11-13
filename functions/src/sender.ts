import type { SenderSettings } from './email.js'

/** The sender of every email except its mailing address, which is a deploy parameter (`SENDER_MAILING_ADDRESS`). */
export const SENDER: Omit<SenderSettings, 'mailingAddress'> = {
  from: 'Levix Digital <releases@levix.digital>',
  companyName: 'Levix Digital Inc.',
  contactEmail: 'contact@levix.digital',
}
