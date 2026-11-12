import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import SectionHeading from './SectionHeading.vue'

describe('SectionHeading', () => {
  it('renders the title at the given level with its eyebrow and lead', () => {
    const wrapper = mount(SectionHeading, { props: { title: 'Products', id: 'products-title', eyebrow: 'Portfolio', lead: 'Two lines.', level: 1 } })

    expect(wrapper.find('h1#products-title').text()).toBe('Products')
    expect(wrapper.text()).toContain('Portfolio')
    expect(wrapper.text()).toContain('Two lines.')
  })

  it('is a level-2 heading by default, without style attributes on the server', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(SectionHeading, { title: 'About' }) }))

    expect(html).toContain('<h2')
    expect(html).not.toContain('style=')
  })
})
