import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ActionLink from './ActionLink.vue'

describe('ActionLink', () => {
  it('is a link with its text, primary by default', () => {
    const wrapper = mount(ActionLink, { props: { href: '#products' }, slots: { default: 'See the products' } })

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('#products')
    expect(wrapper.text()).toBe('See the products')
    expect(wrapper.classes()).toContain('bg-accent')
  })

  it('has an outlined secondary variant', () => {
    const wrapper = mount(ActionLink, { props: { href: '#contact', variant: 'secondary' }, slots: { default: 'Contact' } })

    expect(wrapper.classes()).toContain('border')
    expect(wrapper.classes()).not.toContain('bg-accent')
  })
})
