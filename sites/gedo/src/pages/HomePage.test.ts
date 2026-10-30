import { createHead } from '@unhead/vue/server'
import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import strings from '../locales/en.json'
import HomePage from './HomePage.vue'

describe('HomePage', () => {
  it('renders its heading on the server, without browser globals', async () => {
    const app = createSSRApp(HomePage)
    app.use(createHead())

    const html = await renderToString(app)

    expect(html).toContain(`<h1`)
    expect(html).toContain(strings['home.title'])
  })

  it('renders its heading and notice in the browser', () => {
    const wrapper = mount(HomePage, { global: { plugins: [createHead()] } })

    expect(wrapper.find('h1').text()).toBe(strings['home.title'])
    expect(wrapper.text()).toContain(strings['home.notice'])
  })
})
