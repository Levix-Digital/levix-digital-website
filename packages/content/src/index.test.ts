import { describe, expect, it } from 'vitest'
import domains from '../../../domains.json'
import { PortfolioError, company, companySite, portfolio, productById, products, releaseSignupEndpoint } from './index'

describe('@levix/content', () => {
  it('exposes the company facts', () => {
    expect(company.name).toBe('Levix Digital Inc.')
    expect(company.email).toBe('contact@levix.digital')
    expect(company.location).toEqual({ city: 'Calgary', province: 'Alberta', country: 'Canada' })
  })

  it('lists the five products in order with their names', () => {
    expect(products.map((product) => [product.id, product.name])).toEqual([
      ['docmapper', 'DocMapper'],
      ['anycontext', 'AnyContext'],
      ['devcycle', 'Dev Cycle Protocol'],
      ['gedo', 'Gedo'],
      ['aurora', 'Aurora Dev Suite'],
    ])
  })

  it('derives the products with a site from the portfolio', () => {
    expect(products.map((product) => product.url)).toEqual(
      portfolio.flatMap((product) => (product.site === undefined ? [] : [product.site])),
    )
  })

  it('finds a product by its id', () => {
    expect(productById('gedo').name).toBe('Gedo')
    expect(() => productById('nothing' as 'gedo')).toThrow(PortfolioError)
  })

  it('calls the signup function in Montreal over https', () => {
    expect(releaseSignupEndpoint).toBe('https://northamerica-northeast1-levix-digital.cloudfunctions.net/releaseSignup')
  })

  it('links every site at its production domain from domains.json', () => {
    for (const site of [companySite, ...products]) {
      expect(site.url).toBe(`https://${domains[site.id]}`)
    }
  })
})
