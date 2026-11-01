import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { products } from '../layout/fixtures'
import MainNavigation from './MainNavigation.vue'

describe('MainNavigation', () => {
  it('is a named navigation with one link per site', () => {
    const wrapper = mount(MainNavigation, { props: { label: 'Main', links: products } })

    expect(wrapper.find('nav').attributes('aria-label')).toBe('Main')
    expect(wrapper.findAll('a').map((a) => [a.text(), a.attributes('href')])).toEqual([
      ['Product One', 'https://one.example.com'],
      ['Product Two', 'https://two.example.com'],
    ])
  })
})
