import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { companySite, products, strings } from '../layout/fixtures'
import ProductHeader from './ProductHeader.vue'

const product = products[0]!

describe('ProductHeader', () => {
  it("puts the product's name in front, linked to its home", () => {
    const wrapper = mount(ProductHeader, { props: { product, companySite, strings } })

    expect(wrapper.find('a[href="/"]').text()).toBe('Product One')
  })

  it('links "by Levix Digital" to the company home, with the theme picker and no company navigation', () => {
    const wrapper = mount(ProductHeader, { props: { product, companySite, strings } })

    expect(wrapper.find('a[href="https://levix.digital"]').text()).toMatch(/^by\s+Levix Digital$/)
    expect(wrapper.find('fieldset').exists()).toBe(true)
    expect(wrapper.find('nav').exists()).toBe(false)
  })
})
