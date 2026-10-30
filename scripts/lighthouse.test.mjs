import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { lighthouseArgs, main, pagePaths, REPORTS_DIR } from './lighthouse.mjs'
import { readHostingConfig } from './lib/hosting-config.mjs'

const config = readHostingConfig()

/** A copy of the hosting configuration with the given sites built, each with the given pages. */
function workspace(/** @type {string[]} */ built, pages = ['index.html']) {
  const root = mkdtempSync(join(tmpdir(), 'lighthouse-'))
  for (const file of ['firebase.json', '.firebaserc']) copyFileSync(file, join(root, file))
  for (const site of built) {
    for (const page of pages) {
      const file = join(root, 'sites', site, 'dist', page)
      mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, '<h1>x</h1>')
    }
  }
  return root
}

const ok = { code: 0, stdout: '', stderr: '' }
const bases = async (/** @type {string[]} */ names) => new Map(names.map((name, index) => [name, `http://127.0.0.1:${5000 + index}`]))

describe('pagePaths', () => {
  it('lists every page at its clean URL, without the not-found page or other files', () => {
    const root = workspace(['home'], ['index.html', 'about.html', 'research/index.html', 'research/lsie.html', '404.html', 'assets/app.js'])
    expect(pagePaths(join(root, 'sites', 'home', 'dist'))).toEqual(['/', '/about', '/research', '/research/lsie'])
  })
})

describe('lighthouseArgs', () => {
  it('audits the given pages and keeps the site reports apart', () => {
    const gedo = /** @type {import('./lib/hosting-config.mjs').HostingTarget} */ (config.targets.find((target) => target.name === 'gedo'))
    expect(lighthouseArgs(gedo, ['http://h:1/', 'http://h:1/about']).slice(1)).toEqual([
      'autorun', '--config=lighthouserc.json', '--collect.url=http://h:1/', '--collect.url=http://h:1/about', `--upload.outputDir=${REPORTS_DIR}/gedo`,
    ])
  })
})

describe('main', () => {
  it('fails before auditing when a site is not built', async () => {
    const run = vi.fn(async () => ok)
    await expect(main([], { run, root: workspace(['home']), bases })).rejects.toThrow('not built:')
    expect(run).not.toHaveBeenCalled()
  })

  it('audits each site at its emulator address and names the ones over budget', async () => {
    const run = vi.fn(async (/** @type {string} */ _command, /** @type {string[]} */ args) => ({ ...ok, code: args.some((arg) => arg.includes('aurora')) ? 1 : 0 }))
    await expect(main([], { run, root: workspace(config.targets.map((target) => target.name)), bases })).rejects.toThrow('over budget or not audited: aurora')
    expect(run).toHaveBeenCalledTimes(5)
    expect(run.mock.calls[0]?.[1]).toContain('--collect.url=http://127.0.0.1:5000/')
  })
})
