import type { Product } from '../types'

/**
 * Sources in the dev-cycle-protocol repository: docs/product/VISION.md (positioning), docs/ROADMAP.md (v3.0.0
 * conducted cycle and v3.1.0 chat screen, both planned) and ADR-0008 (the engine conducts the coding agents and checks
 * every result itself). Install links to the public releases repository Levix-Digital/dcp-releases (owner's decision).
 */
export const devcycle: Product = {
  id: 'devcycle',
  name: 'Dev Cycle Protocol',
  line: 'development',
  statement:
    'Dev Cycle Protocol takes every change in a project from idea to verified release: specification, plan, tests, review and release, each step checked before the next, with the decisions kept in the repository.',
  upcoming:
    'In a coming release, the dcp engine will conduct the coding agents your team already uses through the cycle: it starts the agent and model chosen for each role, checks every result itself and makes the commits and pull requests, so no phase can be skipped. A later release adds a chat screen to run the cycle and approve its gates.',
  status: 'available',
  site: 'https://devcycle.levix.digital',
  install: { url: 'https://github.com/Levix-Digital/dcp-releases', label: 'Install' },
  // Archives from Dev Cycle Protocol's release workflow, the same names in every release; the extracted folder holds
  // install.ps1 (Windows) and install.sh (Linux, macOS).
  releases: {
    repository: 'Levix-Digital/dcp-releases',
    downloads: { windows: 'dev-cycle-protocol.zip', macos: 'dev-cycle-protocol.tar.gz', linux: 'dev-cycle-protocol.tar.gz' },
  },
}
