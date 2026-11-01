import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import { companySite, products, strings } from '../layout/fixtures'
import CompanyHeader from './CompanyHeader.vue'

describe('CompanyHeader', () => {
  const props = { companySite, products, strings }

  it('links the monogram and name to the company home', () => {
    const wrapper = mount(CompanyHeader, { props })
    const brand = wrapper.find('a[href="https://levix.digital"]')

    expect(brand.attributes('aria-label')).toBe('Levix Digital')
    expect(brand.find('svg').exists()).toBe(true)
    expect(brand.text()).toContain('LEVIX')
  })

  it('carries the product navigation and the theme picker', () => {
    const wrapper = mount(CompanyHeader, { props })

    expect(wrapper.find('nav[aria-label="Main"]').findAll('a')).toHaveLength(products.length)
    expect(wrapper.find('fieldset legend').text()).toBe('Theme')
  })

  it('renders more pickers next to the theme picker', () => {
    const wrapper = mount(CompanyHeader, { props, slots: { pickers: () => h('span', { id: 'language' }) } })

    expect(wrapper.find('#language').exists()).toBe(true)
  })
})
