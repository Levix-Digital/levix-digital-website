import type { Product } from '../types'

/**
 * Source: Aurora Dev Suite ADR-0014 (2026-11-10): a self-hosted web application inside the organization's network,
 * governed by the Levix Admin Hub; the desktop builds are not released and the web application is not released yet.
 */
export const aurora: Product = {
  id: 'aurora',
  name: 'Aurora Dev Suite',
  line: 'development',
  statement:
    'The phases, decisions and approvals of every project in one place, for leads, architects and managers.',
  status: 'in-development',
  site: 'https://aurora.levix.digital',
}
