import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { builtTargets, deployArgs, main, parseArgs, previewTable, PREVIEW_MARKER } from './hosting-deploy.mjs'
import { readHostingConfig } from './lib/hosting-config.mjs'

const config = readHostingConfig()

/** A copy of the hosting configuration with the given sites built. */
function workspace(/** @type {string[]} */ built) {
  const root = mkdtempSync(join(tmpdir(), 'hosting-'))
  for (const file of ['firebase.json', '.firebaserc']) copyFileSync(file, join(root, file))
  for (const site of built) {
    mkdirSync(join(root, 'sites', site, 'dist'), { recursive: true })
    writeFileSync(join(root, 'sites', site, 'dist', 'index.html'), '<h1>x</h1>')
  }
  return root
}

const PREVIEW_JSON = JSON.stringify({
  status: 'success',
  result: {
    home: { site: 'levix-digital', url: 'https://levix-digital--pr-7-abc.web.app', expireTime: '2026-11-06T16:00:00Z' },
    gedo: { site: 'levix-gedo', url: 'https://levix-gedo--pr-7-def.web.app', expireTime: '2026-11-06T16:00:00Z' },
  },
})

describe('parseArgs', () => {
  it('reads sites and the channel', () => {
    expect(parseArgs(['--channel', 'pr-7', 'home', 'gedo'])).toEqual({ channel: 'pr-7', sites: ['home', 'gedo'] })
  })

  it('rejects a channel option without a value and unknown options', () => {
    expect(() => parseArgs(['--channel'])).toThrow('--channel needs a channel id')
    expect(() => parseArgs(['--force'])).toThrow('unknown option --force')
  })
})

describe('builtTargets', () => {
  it('refuses a site that is not built, naming it', () => {
    const root = workspace(['home'])
    expect(() => builtTargets(config, ['home', 'gedo'], root)).toThrow('not built: gedo')
  })

  it('returns every target when no site is named and all are built', () => {
    const root = workspace(config.targets.map((target) => target.name))
    expect(builtTargets(config, [], root)).toHaveLength(5)
  })
})

describe('deployArgs', () => {
  it('builds the live deploy command for the chosen targets', () => {
    const targets = config.targets.filter((target) => ['home', 'gedo'].includes(target.name))
    expect(deployArgs(config, targets, null)).toEqual([
      'deploy', '--only', 'hosting:home,hosting:gedo', '--project', 'levix-digital', '--non-interactive',
    ])
  })

  it('builds the preview command with expiry and JSON output', () => {
    expect(deployArgs(config, config.targets.slice(0, 1), 'pr-7')).toEqual([
      'hosting:channel:deploy', 'pr-7', '--only', 'home', '--expires', '7d', '--no-authorized-domains', '--json',
      '--project', 'levix-digital', '--non-interactive',
    ])
  })
})

describe('previewTable', () => {
  it('lists each site address in configuration order, with the marker', () => {
    const table = previewTable(config, 'pr-7', PREVIEW_JSON)
    expect(table.startsWith(PREVIEW_MARKER)).toBe(true)
    expect(table).toContain('| home | https://levix-digital--pr-7-abc.web.app | 2026-11-06 |')
    expect(table.indexOf('| home |')).toBeLessThan(table.indexOf('| gedo |'))
  })

  it('fails on an error result', () => {
    expect(() => previewTable(config, 'pr-7', '{"status":"error","error":"quota"}')).toThrow('quota')
  })
})

describe('main', () => {
  it('never calls the CLI when a site is not built', async () => {
    const run = vi.fn()
    await expect(main(['home'], run, workspace([]))).rejects.toThrow('not built: home')
    expect(run).not.toHaveBeenCalled()
  })

  it('never calls the CLI for an unknown site', async () => {
    const run = vi.fn()
    await expect(main(['shop'], run, workspace(['home']))).rejects.toThrow('unknown site shop')
    expect(run).not.toHaveBeenCalled()
  })

  it('fails when the CLI fails', async () => {
    const run = vi.fn().mockResolvedValue({ code: 2, stdout: '', stderr: 'denied' })
    await expect(main(['home'], run, workspace(['home']))).rejects.toThrow('code 2')
  })
})
