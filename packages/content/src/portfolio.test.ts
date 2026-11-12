import { describe, expect, it } from 'vitest'
import domains from '../../../domains.json'
import { PortfolioError, portfolio, productLines, validatePortfolio } from './portfolio'
import type { Product } from './types'

const valid: Product = { id: 'sample', name: 'Sample', line: 'documents', statement: 'Does one thing.', status: 'available' }

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

  it('links each site at its production domain, and DocMapper has no site', () => {
    for (const product of portfolio) {
      if (product.site === undefined) continue
      expect(product.site).toBe(`https://${(domains as Record<string, string>)[product.id]}`)
    }
    expect(portfolio.find((product) => product.id === 'docmapper')?.site).toBeUndefined()
  })

  it.each([
    [{ ...valid, statement: ' ' }, 'Product sample has no statement'],
    [{ ...valid, name: '' }, 'Product sample has no name'],
    [{ ...valid, status: 'soon' as Product['status'] }, 'Product sample has the unknown status "soon"'],
    [{ ...valid, line: 'games' as Product['line'] }, 'Product sample has the unknown line "games"'],
    [{ ...valid, site: 'http://sample.example' }, 'Product sample has a site that is not an https address'],
  ])('rejects an invalid entry with the product named', (entry, message) => {
    expect(() => validatePortfolio([entry], productLines)).toThrow(new PortfolioError(message))
  })

  it('rejects a product listed twice', () => {
    expect(() => validatePortfolio([valid, valid], productLines)).toThrow('Product sample is listed twice')
  })
})
