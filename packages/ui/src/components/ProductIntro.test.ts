import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { inDevelopment, strings } from '../release-signup/fixtures'
import ProductIntro from './ProductIntro.vue'

describe('ProductIntro', () => {
  it('shows the product name as the page heading, its statement and the availability panel', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(ProductIntro, { product: inDevelopment, strings, contactEmail: 'a@b.co', consentVersion: 'v', endpoint: 'x' }),
      }),
    )

    expect(html).toMatch(/<h1[^>]*>\s*Gedo\s*<\/h1>/)
    expect(html).toContain('Merges by meaning.')
    expect(html).toContain('[availability.label]')
    expect(html).not.toContain('style=')
  })
})
