import { flushPromises, mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { afterEach, describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { THEME_STORAGE_KEY } from '../theme/preference'
import ThemePicker from './ThemePicker.vue'

const labels = { legend: 'Theme', system: 'System', light: 'Light', dark: 'Dark' }

function checked(wrapper: ReturnType<typeof mount>): string | undefined {
  return wrapper.findAll('input').find((input) => (input.element as HTMLInputElement).checked)?.attributes('value')
}

describe('ThemePicker', () => {
  afterEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('is a named group of three radio buttons with the given labels', () => {
    const wrapper = mount(ThemePicker, { props: { labels } })

    expect(wrapper.find('fieldset legend').text()).toBe('Theme')
    const inputs = wrapper.findAll('input[type="radio"]')
    expect(inputs.map((input) => input.attributes('value'))).toEqual(['system', 'light', 'dark'])
    expect(new Set(inputs.map((input) => input.attributes('name'))).size).toBe(1)
    expect(wrapper.findAll('label').map((label) => label.text())).toEqual(['System', 'Light', 'Dark'])
  })

  it('renders on the server with System checked', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(ThemePicker, { labels }) }))

    expect(html).toMatch(/value="system"[^>]*checked/)
  })

  it('shows the stored choice once mounted', async () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    const wrapper = mount(ThemePicker, { props: { labels } })
    await flushPromises()

    expect(checked(wrapper)).toBe('dark')
  })

  it('applies and stores a choice, and System removes both', async () => {
    const wrapper = mount(ThemePicker, { props: { labels } })

    await wrapper.find('input[value="dark"]').setValue(true)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')

    await wrapper.find('input[value="system"]').setValue(true)
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull()
    expect(checked(wrapper)).toBe('system')
  })

  it('follows a change made in another tab', async () => {
    const wrapper = mount(ThemePicker, { props: { labels }, attachTo: document.body })
    await flushPromises()

    window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: 'light' }))
    await flushPromises()
    expect(checked(wrapper)).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    window.dispatchEvent(new StorageEvent('storage', { key: null, newValue: null }))
    await flushPromises()
    expect(checked(wrapper)).toBe('system')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)

    wrapper.unmount()
  })
})
