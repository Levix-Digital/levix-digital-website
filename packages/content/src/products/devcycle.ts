import type { Product } from '../types'

/** Sources: ai-code-agent-skills README (install.sh and install.ps1) and docs/product/VISION.md (approved one-line description). */
export const devcycle: Product = {
  id: 'devcycle',
  name: 'Dev Cycle Protocol',
  line: 'development',
  statement:
    'The agent writes the code. Dev Cycle Protocol makes sure it was done the right way: specification, plan, tests, review and release, with no steps skipped.',
  status: 'available',
  site: 'https://devcycle.levix.digital',
  install: { url: 'https://github.com/Levix-Digital/ai-code-agent-skills#installation', label: 'Install' },
  releases: { repository: 'Levix-Digital/dev-cycle-protocol-releases' },
}
