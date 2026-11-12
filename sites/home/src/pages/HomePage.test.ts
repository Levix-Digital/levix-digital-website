import { createHead } from '@unhead/vue/server'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import strings from '../locales/en.json'
import HomePage from './HomePage.vue'

function mountPage() {
  return mount(HomePage, { global: { plugins: [createHead()] } })
}

describe('HomePage', () => {
  it('renders the whole page on the server, without browser globals or style attributes', async () => {
    const app = createSSRApp(HomePage)
    app.use(createHead())

    const html = await renderToString(app)

    expect(html).toContain(strings['home.hero.headline'])
    expect(html).toContain('DocMapper')
    expect(html).toContain('contact@levix.digital')
    expect(html).not.toContain('style=')
  })

  it('shows the sections in order, with one level-1 heading', () => {
    const wrapper = mountPage()

    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.find('h1').text()).toBe(strings['home.hero.headline'])
    expect(wrapper.findAll('section').map((section) => section.attributes('aria-labelledby'))).toEqual([
      'hero-title',
      'products-title',
      'about-title',
      'research-title',
      'contact-title',
    ])
  })

  it('offers two hero actions, to the products and to the contact section', () => {
    const hero = mountPage().find('section[aria-labelledby="hero-title"]')

    expect(hero.findAll('a').map((link) => [link.text(), link.attributes('href')])).toEqual([
      [strings['home.hero.products'], '#products'],
      [strings['home.hero.contact'], '#contact'],
    ])
  })

  it('lists the five products in two lines with their statuses', () => {
    const wrapper = mountPage()

    expect(wrapper.findAll('[data-line]').map((line) => line.attributes('data-line'))).toEqual(['documents', 'development'])
    expect(wrapper.findAll('[data-product]').map((card) => card.attributes('data-product'))).toEqual([
      'docmapper',
      'anycontext',
      'devcycle',
      'gedo',
      'aurora',
    ])
    expect(wrapper.find('[data-product="anycontext"] [data-status]').text()).toBe(strings['home.status.available'])
    expect(wrapper.find('[data-product="aurora"] [data-status]').text()).toBe(strings['home.status.in-development'])
    expect(wrapper.find('[data-product="anycontext"] a').attributes('href')).toBe('https://anycontext.levix.digital')
  })

  it('does not link DocMapper, which has no site', () => {
    const card = mountPage().find('[data-product="docmapper"]')

    expect(card.find('a').exists()).toBe(false)
    expect(card.text()).toContain(strings['home.status.in-development'])
  })

  it('states the perimeter focus first in the about section', () => {
    const about = mountPage().find('section[aria-labelledby="about-title"]')

    expect(about.find('.space-y-4 p').text()).toBe(strings['home.about.body1'])
  })

  it('presents the research without links and the contact without a form', () => {
    const wrapper = mountPage()

    const research = wrapper.find('section[aria-labelledby="research-title"]')
    expect(research.find('a').exists()).toBe(false)
    expect(research.text()).toContain(strings['home.research.status'])

    const contact = wrapper.find('#contact')
    expect(contact.find('a').attributes('href')).toBe('mailto:contact@levix.digital')
    expect(contact.find('form').exists()).toBe(false)
  })

  it('leaves the theme picker to the header', () => {
    expect(mountPage().find('fieldset').exists()).toBe(false)
  })
})
