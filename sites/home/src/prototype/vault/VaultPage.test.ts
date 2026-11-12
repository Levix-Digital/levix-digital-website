import { createHead } from '@unhead/vue/server'
import { flushPromises, mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import { vaultProducts, vaultSections, vaultText } from './content'
import VaultPage from './VaultPage.vue'

function mountPage() {
  return mount(VaultPage, { global: { plugins: [createHead()] }, attachTo: document.body })
}

describe('VaultPage', () => {
  it('prerenders every product and section as plain HTML, with no inline style', async () => {
    const app = createSSRApp(VaultPage)
    app.use(createHead())

    const html = await renderToString(app)

    expect(html).toContain('<h1')
    expect(html).toContain(vaultText.title)
    for (const product of vaultProducts) {
      expect(html).toContain(`href="${product.url}"`)
      expect(html).toContain(product.tagline)
    }
    for (const section of vaultSections) expect(html).toContain(section.title)
    // The Content Security Policy blocks style attributes (style-src 'self').
    expect(html).not.toMatch(/\sstyle="/)
  })

  it('falls back to the static view without WebGL, with the console ready', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.find('canvas').exists()).toBe(false)
    expect(wrapper.find('.vault-console-bottom').classes()).toContain('is-visible')
    expect(wrapper.text()).toContain(vaultText.cinematicView)
    wrapper.unmount()
  })

  it('opens a product panel from its button, turns with the arrows and goes back', async () => {
    const wrapper = mountPage()
    await flushPromises()
    const gedo = vaultProducts.findIndex((product) => product.id === 'gedo')
    const buttons = wrapper.findAll('.vault-console-bottom .vault-key:not(.vault-arrow)')

    await buttons[gedo]?.trigger('click')
    expect(wrapper.find('.vault-product-panel h2').text()).toBe('Gedo')
    expect(buttons[gedo]?.attributes('aria-pressed')).toBe('true')

    await wrapper.find('[aria-label="Next product"]').trigger('click')
    expect(wrapper.find('.vault-product-panel h2').text()).toBe(vaultProducts[(gedo + 1) % vaultProducts.length]?.name)

    await wrapper.find('.vault-product-panel button').trigger('click')
    expect(wrapper.find('.vault-product-panel').exists()).toBe(false)
    wrapper.unmount()
  })

  it('opens and closes a company panel, also with Escape', async () => {
    const wrapper = mountPage()
    await flushPromises()
    const about = wrapper.find('.vault-console-top .vault-key')

    await about.trigger('click')
    expect(about.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('#vault-section-panel').text()).toContain(vaultSections[0]?.title)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    expect(wrapper.find('#vault-section-panel').exists()).toBe(false)
    wrapper.unmount()
  })
})
