import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { company, companySite, products, strings } from '../layout/fixtures'
import SiteLayout from './SiteLayout.vue'

const base = { company, companySite, products, strings }
const page = { default: () => h('h1', 'Page') }

describe('SiteLayout', () => {
  it('starts with a skip link to the main content', () => {
    const wrapper = mount(SiteLayout, { props: { ...base, site: 'home' }, slots: page })
    const first = wrapper.find('a')

    expect(first.text()).toBe('Skip to content')
    expect(first.attributes('href')).toBe('#main')
    expect(wrapper.find('main#main').attributes('tabindex')).toBe('-1')
    expect(wrapper.find('main h1').text()).toBe('Page')
  })

  it('has the banner, navigation, main and content information landmarks on the home', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(SiteLayout, { ...base, site: 'home' }, page) }))

    expect(html).toMatch(/<header[\s\S]*<nav aria-label="Main"[\s\S]*<main[\s\S]*<footer/)
    expect(html).not.toContain('style=')
  })

  it('shows the product header on a product site', () => {
    const wrapper = mount(SiteLayout, { props: { ...base, site: 'one' }, slots: page })

    expect(wrapper.find('header a[href="/"]').text()).toBe('Product One')
    expect(wrapper.find('header nav').exists()).toBe(false)
    expect(wrapper.find('footer a[aria-current="page"]').text()).toBe('Product One')
  })
})
