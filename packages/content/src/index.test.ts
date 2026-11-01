import { describe, expect, it } from 'vitest'
import domains from '../../../domains.json'
import { company, companySite, products } from './index'

describe('@levix/content', () => {
  it('exposes the company facts', () => {
    expect(company.name).toBe('Levix Digital Inc.')
    expect(company.email).toBe('contact@levix.digital')
    expect(company.location).toEqual({ city: 'Calgary', province: 'Alberta', country: 'Canada' })
  })

  it('lists the four products in order with their names', () => {
    expect(products.map((product) => [product.id, product.name])).toEqual([
      ['anycontext', 'AnyContext'],
      ['devcycle', 'Dev Cycle Protocol'],
      ['gedo', 'Gedo'],
      ['aurora', 'Aurora Dev Suite'],
    ])
  })

  it('links every site at its production domain from domains.json', () => {
    for (const site of [companySite, ...products]) {
      expect(site.url).toBe(`https://${domains[site.id]}`)
    }
  })
})
