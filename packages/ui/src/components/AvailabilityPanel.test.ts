import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { available, inDevelopment, strings } from '../release-signup/fixtures'
import AvailabilityPanel from './AvailabilityPanel.vue'

const common = { strings, contactEmail: 'hello@example.com', consentVersion: '2026-11-13', endpoint: 'https://example.test/fn' }

describe('AvailabilityPanel', () => {
  it('offers the download of an available product, with no form', () => {
    const wrapper = mount(AvailabilityPanel, { props: { ...common, product: available } })

    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('https://example.com/download')
    expect(link.text()).toBe('Download')
    expect(wrapper.text()).toContain('[availability.status.available]')
    expect(wrapper.text()).toContain('[availability.note.available] AnyContext')
    expect(wrapper.find('button[disabled]').exists()).toBe(false)
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('says a preview is a preview and still offers it', () => {
    const wrapper = mount(AvailabilityPanel, { props: { ...common, product: { ...available, status: 'preview' } } })

    expect(wrapper.text()).toContain('[availability.note.preview] AnyContext')
    expect(wrapper.find('a').exists()).toBe(true)
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('disables the download of a product in development, explains why, and shows the signup below', () => {
    const wrapper = mount(AvailabilityPanel, { props: { ...common, product: inDevelopment } })

    const button = wrapper.find('button[type="button"]')
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.text()).toBe('[availability.download] {product} {email}')
    const note = wrapper.find(`#${button.attributes('aria-describedby')}`)
    expect(note.text()).toBe('[availability.note.in-development] Gedo {email}')
    expect(wrapper.find('a').exists()).toBe(false)
    const html = wrapper.html()
    expect(html.indexOf('type="button"')).toBeLessThan(html.indexOf('<form'))
  })

  it('shows the latest release with one direct link per system, and keeps the link to every download', () => {
    const release = {
      version: 'v0.45.2',
      url: 'https://example.com/releases/v0.45.2',
      downloads: [
        { platform: 'windows' as const, url: 'https://example.com/v0.45.2/setup.exe' },
        { platform: 'linux' as const, url: 'https://example.com/v0.45.2/setup' },
      ],
    }
    const wrapper = mount(AvailabilityPanel, { props: { ...common, product: { ...available, release } } })

    const links = wrapper.findAll('a').map((link) => [link.attributes('href'), link.text()])
    expect(links).toEqual([
      ['https://example.com/releases/v0.45.2', '[availability.release.available] {product} {email}'],
      ['https://example.com/v0.45.2/setup.exe', '[availability.downloadFor] {product} {email}'],
      ['https://example.com/v0.45.2/setup', '[availability.downloadFor] {product} {email}'],
      ['https://example.com/download', '[availability.allDownloads] {product} {email}'],
    ])
  })

  it('fills the version and the system into the link text', () => {
    const custom = { ...strings, 'availability.downloadFor': 'Download {version} for {platform}', 'availability.platform.linux': 'Linux' }
    const release = { version: 'v1.0.0', url: 'https://example.com/r', downloads: [{ platform: 'linux' as const, url: 'https://example.com/l' }] }
    const wrapper = mount(AvailabilityPanel, { props: { ...common, strings: custom, product: { ...available, release } } })

    expect(wrapper.findAll('a')[1]?.text()).toBe('Download v1.0.0 for Linux')
  })

  it('keeps the install action and shows the version when the release has no installers', () => {
    const release = { version: 'v2.0.0-rc.1', url: 'https://example.com/r', downloads: [] }
    const wrapper = mount(AvailabilityPanel, { props: { ...common, product: { ...available, status: 'preview', release } } })

    expect(wrapper.findAll('a').map((link) => link.attributes('href'))).toEqual(['https://example.com/r', 'https://example.com/download'])
    expect(wrapper.text()).toContain('[availability.release.preview]')
  })

  it('falls back to the install action when no release could be read', () => {
    const wrapper = mount(AvailabilityPanel, { props: { ...common, product: { ...available, release: null } } })

    expect(wrapper.findAll('a').map((link) => link.text())).toEqual(['Download'])
  })

  it('shows no release for a product in development', () => {
    const release = { version: 'v1.0.0', url: 'https://example.com/r', downloads: [] }
    const wrapper = mount(AvailabilityPanel, { props: { ...common, product: { ...inDevelopment, release } } })

    expect(wrapper.text()).not.toContain('availability.release')
    expect(wrapper.find('button[disabled]').exists()).toBe(true)
  })

  it('renders on the server without style attributes', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(AvailabilityPanel, { ...common, product: inDevelopment }) }))

    expect(html).toContain('<form')
    expect(html).not.toContain('style=')
  })
})
