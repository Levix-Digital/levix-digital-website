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
  // Archives from Dev Cycle Protocol's release workflow, the same names in every release; the extracted folder holds
  // install.ps1 (Windows) and install.sh (Linux, macOS).
  releases: {
    repository: 'Levix-Digital/dcp-releases',
    downloads: { windows: 'dev-cycle-protocol.zip', macos: 'dev-cycle-protocol.tar.gz', linux: 'dev-cycle-protocol.tar.gz' },
  },
}
