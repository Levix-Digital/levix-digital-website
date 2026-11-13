import { products } from '@levix/content'
import { createHead } from '@unhead/vue/server'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from './App.vue'
import { routes } from './routes'

const SITE: string = 'docmapper'

async function render(): Promise<string> {
  const app = createSSRApp(App)
  const router = createRouter({ history: createMemoryHistory(), routes })
  app.use(router).use(createHead())
  await router.push('/')
  await router.isReady()
  return renderToString(app)
}

describe('App', () => {
  it('frames the page with the header, the main content and the footer', async () => {
    const html = await render()

    expect(html).toMatch(/<header[\s\S]*<main id="main"[\s\S]*<h1[\s\S]*<\/main>[\s\S]*<footer/)
    expect(html).toContain('href="mailto:contact@levix.digital"')
    expect(html).toContain('Calgary, Alberta, Canada')
    for (const product of products) expect(html).toContain(`href="${product.url}"`)
  })

  it('shows the header of this site and marks it in the footer', async () => {
    const html = await render()
    const product = products.find((candidate) => candidate.id === SITE)

    if (product) {
      expect(html).toContain(`>${product.name}</a>`)
      expect(html).not.toContain('aria-label="Main"')
      expect(html).toMatch(new RegExp(`href="${product.url}"[^>]*aria-current="page"`))
    } else {
      expect(html).toContain('aria-label="Main"')
      expect(html).not.toContain('aria-current')
    }
  })
})
