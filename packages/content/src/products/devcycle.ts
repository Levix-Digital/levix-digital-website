import type { Product } from '../types'

/**
 * Sources, all in the dev-cycle-protocol repository: README (install.sh and install.ps1), docs/product/VISION.md
 * (the approved one-line description, kept verbatim), docs/ROADMAP.md (v3.0.0 conducted cycle and v3.1.0 chat screen,
 * both planned) and ADR-0008 (the engine conducts the coding agents and checks every result itself).
 */
export const devcycle: Product = {
  id: 'devcycle',
  name: 'Dev Cycle Protocol',
  line: 'development',
  statement:
    'The agent writes the code. Dev Cycle Protocol makes sure it was done the right way: specification, plan, tests, review and release, with no steps skipped.',
  upcoming:
    'In a coming release, the dcp engine will conduct the coding agents your team already uses through the cycle: it starts the agent and model chosen for each role, checks every result itself and makes the commits and pull requests, so no phase can be skipped. A later release adds a chat screen to run the cycle and approve its gates.',
  status: 'available',
  site: 'https://devcycle.levix.digital',
  install: { url: 'https://github.com/Levix-Digital/dev-cycle-protocol#installation', label: 'Install' },
  // Archives from Dev Cycle Protocol's release workflow, the same names in every release; the extracted folder holds
  // install.ps1 (Windows) and install.sh (Linux, macOS).
  releases: {
    repository: 'Levix-Digital/dcp-releases',
    downloads: { windows: 'dev-cycle-protocol.zip', macos: 'dev-cycle-protocol.tar.gz', linux: 'dev-cycle-protocol.tar.gz' },
  },
}
