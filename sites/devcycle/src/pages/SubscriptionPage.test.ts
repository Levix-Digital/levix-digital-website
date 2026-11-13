import { createHead } from '@unhead/vue/server'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import SubscriptionPage from './SubscriptionPage.vue'

describe('SubscriptionPage', () => {
  it.each(['confirm', 'unsubscribe'] as const)('prerenders the %s page waiting for the link to be read', async (mode) => {
    const app = createSSRApp({ render: () => h(SubscriptionPage, { mode }) })
    app.use(createHead())
    const html = await renderToString(app)

    expect(html).toContain('<h1')
    expect(html).toContain('data-state="working"')
  })
})
