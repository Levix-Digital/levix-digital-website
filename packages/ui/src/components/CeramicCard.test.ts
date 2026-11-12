import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import CeramicCard from './CeramicCard.vue'

describe('CeramicCard', () => {
  it('with an address, is one link named by its title', () => {
    const wrapper = mount(CeramicCard, { props: { title: 'AnyContext', href: 'https://anycontext.levix.digital' }, slots: { default: '<p>Body</p>' } })

    const links = wrapper.findAll('a')
    expect(links).toHaveLength(1)
    expect(links[0]?.text()).toBe('AnyContext')
    expect(links[0]?.attributes('href')).toBe('https://anycontext.levix.digital')
    expect(wrapper.find('h3').exists()).toBe(true)
    expect(wrapper.text()).toContain('Body')
  })

  it('without an address, has no link', () => {
    const wrapper = mount(CeramicCard, { props: { title: 'DocMapper' } })

    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.find('h3').text()).toBe('DocMapper')
  })

  it('hides the aurora seam from assistive technology and has no style attribute', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(CeramicCard, { title: 'Gedo', headingLevel: 4 }) }))

    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('<h4')
    expect(html).not.toContain('style=')
  })
})
