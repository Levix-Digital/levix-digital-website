import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { available, inDevelopment, strings } from '../release-signup/fixtures'
import AvailabilityPanel from './AvailabilityPanel.vue'

const common = { strings, contactEmail: 'hello@example.com', consentVersion: '2026-11-13', endpoint: 'https://example.test/fn' }

describe('AvailabilityPanel', () => {
  it('offers the download of an available product, with no form', () => {
    const wrapper = mount(AvailabilityPanel, { props: { ...common, product: available } })

    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('https://example.com/download')
    expect(link.text()).toBe('Download')
    expect(wrapper.text()).toContain('[availability.status.available]')
    expect(wrapper.text()).toContain('[availability.note.available] AnyContext')
    expect(wrapper.find('button[disabled]').exists()).toBe(false)
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('says a preview is a preview and still offers it', () => {
    const wrapper = mount(AvailabilityPanel, { props: { ...common, product: { ...available, status: 'preview' } } })

    expect(wrapper.text()).toContain('[availability.note.preview] AnyContext')
    expect(wrapper.find('a').exists()).toBe(true)
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('disables the download of a product in development, explains why, and shows the signup below', () => {
    const wrapper = mount(AvailabilityPanel, { props: { ...common, product: inDevelopment } })

    const button = wrapper.find('button[type="button"]')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.text()).toBe('[availability.download] {product} {email}')
    const note = wrapper.find(`#${button.attributes('aria-describedby')}`)
    expect(note.text()).toBe('[availability.note.in-development] Gedo {email}')
    expect(wrapper.find('a').exists()).toBe(false)
    const html = wrapper.html()
    expect(html.indexOf('type="button"')).toBeLessThan(html.indexOf('<form'))
  })

  it('renders on the server without style attributes', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(AvailabilityPanel, { ...common, product: inDevelopment }) }))

    expect(html).toContain('<form')
    expect(html).not.toContain('style=')
  })
})
