import { flushPromises, mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, h } from 'vue'
import { BUILD_YEAR } from '../layout/build-year'
import { company, products, strings } from '../layout/fixtures'
import SiteFooter from './SiteFooter.vue'

const props = { company, products, current: 'two', strings }

describe('SiteFooter', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the contact details and the product links', () => {
    const wrapper = mount(SiteFooter, { props })

    expect(wrapper.find('a[href="mailto:hello@example.com"]').text()).toBe('hello@example.com')
    expect(wrapper.text()).toContain('Calgary, Alberta, Canada')
    expect(wrapper.findAll('li a').map((a) => a.attributes('href'))).toEqual(products.map((p) => p.url))
  })

  it('marks the current site', () => {
    const wrapper = mount(SiteFooter, { props })

    expect(wrapper.find('a[aria-current="page"]').text()).toBe('Product Two')
    expect(wrapper.findAll('a[aria-current]')).toHaveLength(1)
  })

  it('prerenders the build year', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(SiteFooter, props) }))

    expect(html).toContain(`© ${BUILD_YEAR} Example Inc.`)
  })

  it("shows the visitor's current year once mounted", async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(BUILD_YEAR + 3, 2, 1))
    const wrapper = mount(SiteFooter, { props })
    await flushPromises()

    expect(wrapper.text()).toContain(`© ${BUILD_YEAR + 3} Example Inc.`)
  })
})
