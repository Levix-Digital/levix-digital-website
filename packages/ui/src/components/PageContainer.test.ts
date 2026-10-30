import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import PageContainer from './PageContainer.vue'

describe('PageContainer', () => {
  it('renders its content inside a centered, width-limited container', () => {
    const wrapper = mount(PageContainer, { slots: { default: '<p>Content</p>' } })

    expect(wrapper.find('p').text()).toBe('Content')
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['mx-auto', 'max-w-6xl']))
  })
})
