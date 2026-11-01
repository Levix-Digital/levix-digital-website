import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h, nextTick } from 'vue'
import HeaderBar from './HeaderBar.vue'

const slots = {
  brand: () => h('span', 'Brand'),
  // The link does not navigate: jsdom cannot open another document.
  default: () => h('a', { href: 'https://one.example.com', onClick: (event: Event) => event.preventDefault() }, 'One'),
  pickers: () => h('span', 'Picker'),
}

function mountBar() {
  return mount(HeaderBar, { props: { menuLabel: 'Menu' }, slots, attachTo: document.body })
}

describe('HeaderBar', () => {
  it('shows everything and no menu button in the prerendered page', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(HeaderBar, { menuLabel: 'Menu' }, slots) }))

    expect(html).toContain('<header')
    expect(html).not.toContain('<button')
    expect(html).toMatch(/id="header-panel-[^"]*" class="[^"]*\bflex\b/)
    expect(html).not.toMatch(/id="header-panel-[^"]*" class="[^"]*\bhidden\b/)
  })

  it('folds the panel behind a menu button once mounted', async () => {
    const wrapper = mountBar()
    await nextTick()
    const button = wrapper.find('button')
    const panel = wrapper.find(`#${button.attributes('aria-controls')}`)

    expect(button.text()).toBe('Menu')
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(panel.classes()).toContain('hidden')

    await button.trigger('click')
    expect(button.attributes('aria-expanded')).toBe('true')
    expect(panel.classes()).not.toContain('hidden')
    wrapper.unmount()
  })

  it('closes with Escape and gives the focus back to the button', async () => {
    const wrapper = mountBar()
    await nextTick()
    const button = wrapper.find('button')
    await button.trigger('click')

    await wrapper.find('header').trigger('keydown', { key: 'Escape' })
    await nextTick()
    expect(button.attributes('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(button.element)
    wrapper.unmount()
  })

  it('closes when a link of the panel is followed', async () => {
    const wrapper = mountBar()
    await nextTick()
    const button = wrapper.find('button')
    await button.trigger('click')

    await wrapper.find('a').trigger('click')
    expect(button.attributes('aria-expanded')).toBe('false')
    wrapper.unmount()
  })
})
