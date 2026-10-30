import { describe, expect, it } from 'vitest'
import { changedSites, parseArgs, sitesForPaths } from './changed-sites.mjs'

const SITES = ['home', 'anycontext', 'devcycle', 'gedo', 'aurora']

/**
 * A fake runner for git: `known` says whether the base commit exists, `files` is the diff.
 * @param {{ known?: boolean, files?: string[] }} state
 * @returns {import('./lib/run.mjs').Runner}
 */
function git({ known = true, files = [] }) {
  return async (_command, args) => {
    if (args[0] === 'cat-file') return { code: known ? 0 : 128, stdout: '', stderr: '' }
    return { code: 0, stdout: files.map((file) => `${file}\n`).join(''), stderr: '' }
  }
}

describe('sitesForPaths', () => {
  it('selects only the site whose folder changed', () => {
    expect(sitesForPaths(['sites/gedo/src/pages/HomePage.vue'], SITES).sites).toEqual(['gedo'])
  })

  it('selects every site for shared packages, the lock file, hosting and tooling', () => {
    for (const path of ['packages/ui/src/index.ts', 'package-lock.json', 'firebase.json', 'tooling/vite-site.ts', 'scripts/hosting-deploy.mjs', '.github/workflows/deploy.yml']) {
      expect(sitesForPaths([path], SITES).sites, path).toEqual(SITES)
    }
  })

  it('selects no site for documentation, specifications and tool settings', () => {
    const paths = ['docs/architecture/ci.md', 'specs/003-ci-deploy/spec.md', '.specify/memory/constitution.md', '.claude/settings.json', 'tests/MANUAL_TESTS.md', 'README.md', 'TECDOC.md', 'LICENSE', '.github/workflows/preview.yml']
    expect(sitesForPaths(paths, SITES)).toEqual({ sites: [], reasons: paths.map((path) => `${path}: no site`) })
  })

  it('keeps Markdown inside a site as a change of that site', () => {
    expect(sitesForPaths(['sites/home/README.md'], SITES).sites).toEqual(['home'])
  })

  it('returns the union in the order of the sites', () => {
    expect(sitesForPaths(['sites/aurora/a.ts', 'docs/x.md', 'sites/home/b.ts'], SITES).sites).toEqual(['home', 'aurora'])
  })

  it('treats a folder of an unknown site as a shared change', () => {
    expect(sitesForPaths(['sites/forklift/index.ts'], SITES).sites).toEqual(SITES)
  })
})

describe('parseArgs', () => {
  it('reads the commits or the manual list', () => {
    expect(parseArgs(['--base', 'a', '--head', 'b'])).toEqual({ base: 'a', head: 'b', sites: null })
    expect(parseArgs(['--sites', ''])).toEqual({ base: null, head: null, sites: '' })
  })

  it('rejects unknown options, missing values and no input', () => {
    expect(() => parseArgs(['--all'])).toThrow('unknown option --all')
    expect(() => parseArgs(['--base'])).toThrow('--base needs a value')
    expect(() => parseArgs([])).toThrow('give --base and --head, or --sites')
  })
})

describe('changedSites', () => {
  it('publishes every site when there is no previous commit', async () => {
    for (const base of ['', '0000000000000000000000000000000000000000']) {
      expect((await changedSites(['--base', base, '--head', 'h'], git({}))).sites).toEqual(SITES)
    }
  })

  it('publishes every site when the previous commit is not in the history', async () => {
    const result = await changedSites(['--base', 'abc', '--head', 'h'], git({ known: false }))
    expect(result).toEqual({ sites: SITES, reasons: ['abc is not in the history: every site'] })
  })

  it('applies the rules to the files of the diff', async () => {
    const result = await changedSites(['--base', 'abc', '--head', 'h'], git({ files: ['sites/gedo/x.vue', 'docs/y.md'] }))
    expect(result.sites).toEqual(['gedo'])
  })

  it('validates a manual list, empty meaning every site', async () => {
    expect((await changedSites(['--sites', ' gedo  aurora '], git({}))).sites).toEqual(['gedo', 'aurora'])
    expect((await changedSites(['--sites', ''], git({}))).sites).toEqual(SITES)
    await expect(changedSites(['--sites', 'gedo forklift'], git({}))).rejects.toThrow('unknown site forklift')
  })
})
