import { productById } from '@levix/content'
import { createHead } from '@unhead/vue/server'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import HomePage from './HomePage.vue'

const product = productById('devcycle')

async function render(): Promise<string> {
  const app = createSSRApp(HomePage)
  app.use(createHead())
  return renderToString(app)
}

describe('HomePage', () => {
  it('names the product and says what it is for', async () => {
    const html = await render()

    expect(html).toMatch(new RegExp(`<h1[^>]*>\\s*${product.name}\\s*</h1>`))
    expect(html).toContain(product.statement)
  })

  it('shows its availability: the download, or the disabled button and the release candidate form', async () => {
    const html = await render()

    if (product.install) {
      expect(html).toContain(`href="${product.install.url}"`)
      expect(html).not.toContain('<form')
    } else {
      expect(html).toMatch(/<button[^>]*disabled/)
      expect(html).toContain('<form')
    }
  })
})
