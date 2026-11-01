import { mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import LevixMonogram from './LevixMonogram.vue'

describe('LevixMonogram', () => {
  it('is decorative, with no background, text or inline style', async () => {
    const html = await renderToString(createSSRApp({ render: () => h(LevixMonogram) }))

    expect(html).toContain('aria-hidden="true"')
    expect(html).not.toMatch(/<rect|<text|style=/)
  })

  it('gives each instance its own gradient and filter ids', () => {
    const wrapper = mount({ render: () => [h(LevixMonogram), h(LevixMonogram)] })
    const ids = wrapper.findAll('[id]').map((element) => element.attributes('id'))

    expect(ids).toHaveLength(6)
    expect(new Set(ids).size).toBe(6)
    for (const id of ids) expect(id).toMatch(/^[\w-]+$/)
  })
})
