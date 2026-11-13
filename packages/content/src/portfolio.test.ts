import { describe, expect, it } from 'vitest'
import domains from '../../../domains.json'
import { PortfolioError, portfolio, productLines, validatePortfolio } from './portfolio'
import type { Product } from './types'

const valid: Product = {
  id: 'sample',
  name: 'Sample',
  line: 'documents',
  statement: 'Does one thing.',
  status: 'available',
  install: { url: 'https://sample.example/download', label: 'Download' },
  releases: { repository: 'Levix-Digital/sample-releases' },
}
const inDevelopment: Product = {
  id: 'sample',
  name: 'Sample',
  line: 'documents',
  statement: 'Does one thing.',
  status: 'in-development',
  releases: { repository: 'Levix-Digital/sample-releases' },
}

describe('portfolio', () => {
  it('lists the five products in two lines, documents first', () => {
    expect(productLines.map((line) => line.id)).toEqual(['documents', 'development'])
    expect(portfolio.map((product) => [product.id, product.line])).toEqual([
      ['docmapper', 'documents'],
      ['anycontext', 'documents'],
      ['devcycle', 'development'],
      ['gedo', 'development'],
      ['aurora', 'development'],
    ])
  })

  it('carries the statuses checked against each repository', () => {
    expect(Object.fromEntries(portfolio.map((product) => [product.id, product.status]))).toEqual({
      docmapper: 'in-development',
      anycontext: 'available',
      devcycle: 'available',
      gedo: 'in-development',
      aurora: 'in-development',
    })
  })

  it('links every product to its site at its production domain', () => {
    for (const product of portfolio) {
      expect(product.site).toBe(`https://${(domains as Record<string, string>)[product.id]}`)
    }
  })

  it('gives the installable products their install source, and none to the others', () => {
    expect(Object.fromEntries(portfolio.map((product) => [product.id, product.install?.url]))).toEqual({
      docmapper: undefined,
      anycontext: 'https://github.com/Levix-Digital/any-context-releases/releases/latest',
      devcycle: 'https://github.com/Levix-Digital/dev-cycle-protocol#installation',
      gedo: undefined,
      aurora: undefined,
    })
  })

  it.each([
    [{ ...valid, statement: ' ' }, 'Product sample has no statement'],
    [{ ...valid, name: '' }, 'Product sample has no name'],
    [{ ...valid, status: 'soon' as Product['status'] }, 'Product sample has the unknown status "soon"'],
    [{ ...valid, line: 'games' as Product['line'] }, 'Product sample has the unknown line "games"'],
    [{ ...valid, site: 'http://sample.example' }, 'Product sample has a site that is not an https address'],
    [{ ...inDevelopment, status: 'available' as const }, 'Product sample is available but has no install source'],
    [{ ...inDevelopment, status: 'preview' as const }, 'Product sample is preview but has no install source'],
    [{ ...valid, status: 'in-development' as const }, 'Product sample is in development but has an install source'],
    [{ ...valid, install: { url: 'http://sample.example', label: 'Download' } }, 'Product sample has an install source that is not an https address'],
    [{ ...valid, install: { url: 'https://sample.example', label: ' ' } }, 'Product sample has an install source with no label'],
    [{ ...valid, releases: { repository: 'sample' } }, 'Product sample: releases repository "sample" is not owner/name'],
    [{ ...valid, releases: { repository: 'a/b', downloads: { linux: '' } } }, 'Product sample: empty asset name for linux'],
  ])('rejects an invalid entry with the product named', (entry, message) => {
    expect(() => validatePortfolio([entry], productLines)).toThrow(new PortfolioError(message))
  })

  it('accepts a product in development without an install source', () => {
    expect(validatePortfolio([inDevelopment], productLines)).toEqual([inDevelopment])
  })

  it('names the public releases repository of every product, and the AnyContext installers', () => {
    expect(Object.fromEntries(portfolio.map((product) => [product.id, product.releases.repository]))).toEqual({
      docmapper: 'Levix-Digital/docmapper-releases',
      anycontext: 'Levix-Digital/any-context-releases',
      devcycle: 'Levix-Digital/dcp-releases',
      gedo: 'Levix-Digital/gedo-releases',
      aurora: 'Levix-Digital/aurora-dev-suite-releases',
    })
    expect(portfolio.find((product) => product.id === 'anycontext')?.releases.downloads).toEqual({
      windows: 'actx-installer.exe',
      linux: 'actx-installer',
    })
    expect(portfolio.find((product) => product.id === 'devcycle')?.releases.downloads).toEqual({
      windows: 'dev-cycle-protocol.zip',
      macos: 'dev-cycle-protocol.tar.gz',
      linux: 'dev-cycle-protocol.tar.gz',
    })
  })

  it('rejects a product listed twice', () => {
    expect(() => validatePortfolio([valid, valid], productLines)).toThrow('Product sample is listed twice')
  })
})
