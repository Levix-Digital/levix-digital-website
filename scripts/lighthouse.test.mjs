import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { lighthouseArgs, main, REPORTS_DIR } from './lighthouse.mjs'
import { readHostingConfig } from './lib/hosting-config.mjs'

const config = readHostingConfig()

/** A copy of the hosting configuration with the given sites built. */
function workspace(/** @type {string[]} */ built) {
  const root = mkdtempSync(join(tmpdir(), 'lighthouse-'))
  for (const file of ['firebase.json', '.firebaserc']) copyFileSync(file, join(root, file))
  for (const site of built) {
    mkdirSync(join(root, 'sites', site, 'dist'), { recursive: true })
    writeFileSync(join(root, 'sites', site, 'dist', 'index.html'), '<h1>x</h1>')
  }
  return root
}

const ok = { code: 0, stdout: '', stderr: '' }

describe('lighthouseArgs', () => {
  it('audits the site output folder and keeps its reports apart', () => {
    const gedo = /** @type {import('./lib/hosting-config.mjs').HostingTarget} */ (config.targets.find((target) => target.name === 'gedo'))
    expect(lighthouseArgs(gedo).slice(1)).toEqual([
      'autorun', '--config=lighthouserc.json', '--collect.staticDistDir=sites/gedo/dist', `--upload.outputDir=${REPORTS_DIR}/gedo`,
    ])
  })
})

describe('main', () => {
  it('fails before auditing when a site is not built', async () => {
    const run = vi.fn(async () => ok)
    await expect(main([], run, workspace(['home']))).rejects.toThrow('not built:')
    expect(run).not.toHaveBeenCalled()
  })

  it('audits every site and names the ones over budget', async () => {
    const run = vi.fn(async (/** @type {string} */ _command, /** @type {string[]} */ args) => ({ ...ok, code: args.some((arg) => arg.includes('aurora')) ? 1 : 0 }))
    await expect(main([], run, workspace(config.targets.map((target) => target.name)))).rejects.toThrow('over budget or not audited: aurora')
    expect(run).toHaveBeenCalledTimes(5)
  })
})
