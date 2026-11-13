import { portfolio } from '@levix/content'
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { PRODUCTS, isProductId, isProductSiteOrigin } from './products'

describe('products', () => {
  it('match the portfolio: ids, names and sites', () => {
    expect(Object.entries(PRODUCTS).map(([id, product]) => [id, product.name, product.site])).toEqual(
      portfolio.map((product) => [product.id, product.name, product.site]),
    )
  })

  it('name the hosting site of each product as .firebaserc does', () => {
    const firebaserc = JSON.parse(readFileSync(new URL('../../.firebaserc', import.meta.url), 'utf8'))
    const targets = firebaserc.targets['levix-digital'].hosting as Record<string, string[]>
    for (const [id, product] of Object.entries(PRODUCTS)) expect(targets[id]).toEqual([product.hostingSite])
  })

  it('recognizes product ids only', () => {
    expect(isProductId('gedo')).toBe(true)
    expect(isProductId('home')).toBe(false)
    expect(isProductId('toString')).toBe(false)
    expect(isProductId(42)).toBe(false)
  })

  it.each([
    ['https://gedo.levix.digital', true],
    ['https://levix-gedo.web.app', true],
    ['https://levix-gedo--pr-21-abc123.web.app', true],
    ['https://docmapper.web.app', true],
    ['https://levix.digital', false],
    ['http://gedo.levix.digital', false],
    ['https://gedo.levix.digital.example.com', false],
    ['https://evil-levix-gedo.web.app', false],
  ])('allows the origin %s: %s', (origin, allowed) => {
    expect(isProductSiteOrigin(origin)).toBe(allowed)
  })
})
