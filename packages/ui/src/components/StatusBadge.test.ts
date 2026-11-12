import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import StatusBadge from './StatusBadge.vue'

describe('StatusBadge', () => {
  it.each(['available', 'preview', 'in-development'] as const)('shows the %s label as text', (status) => {
    const wrapper = mount(StatusBadge, { props: { status, label: `Label ${status}` } })

    expect(wrapper.text()).toBe(`Label ${status}`)
    expect(wrapper.attributes('data-status')).toBe(status)
    expect(wrapper.attributes('style')).toBeUndefined()
  })
})
