import type { SenderSettings } from './email.js'

/**
 * The sender printed in every email (CASL sender identification). The mailing address is public business
 * information, given by the owner on 2026-11-13, so it lives in the code rather than in a deploy parameter.
 */
export const SENDER: SenderSettings = {
  from: 'Levix Digital <releases@levix.digital>',
  companyName: 'Levix Digital Inc.',
  mailingAddress: '31 Masters Square SE, Calgary, Alberta, Canada',
  contactEmail: 'contact@levix.digital',
}
