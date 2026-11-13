import { flushPromises, mount } from '@vue/test-utils'
import { renderToString } from '@vue/server-renderer'
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import type { SubscribeOutcome } from '../release-signup/client'
import { fakeClient, inDevelopment, strings } from '../release-signup/fixtures'
import ReleaseSignupForm from './ReleaseSignupForm.vue'

function setup(answer?: SubscribeOutcome) {
  const { client, calls } = fakeClient(answer === undefined ? {} : { subscribe: answer })
  const wrapper = mount(ReleaseSignupForm, {
    props: { product: inDevelopment, strings, contactEmail: 'hello@example.com', consentVersion: '2026-11-13', endpoint: 'x', client },
  })
  return { wrapper, calls }
}

async function fillAndSubmit(wrapper: ReturnType<typeof setup>['wrapper'], email: string, consent: boolean) {
  await wrapper.find('input[type="email"]').setValue(email)
  await wrapper.find('input[type="checkbox"]').setValue(consent)
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('ReleaseSignupForm', () => {
  it('starts with the consent box unticked and states purpose, sender and withdrawal', () => {
    const { wrapper } = setup()

    const checkbox = wrapper.find('input[type="checkbox"]')
    expect((checkbox.element as HTMLInputElement).checked).toBe(false)
    expect(wrapper.find(`label[for="${checkbox.attributes('id')}"]`).text()).toBe('[signup.consent] Gedo hello@example.com')
    expect(wrapper.text()).toContain('[signup.sender] Gedo hello@example.com')
    expect(wrapper.find('label[for$="-email"]').exists()).toBe(true)
  })

  it('names the missing email and consent next to their fields and sends nothing', async () => {
    const { wrapper, calls } = setup()
    await fillAndSubmit(wrapper, 'nope', false)

    expect(calls).toEqual([])
    const email = wrapper.find('input[type="email"]')
    expect(email.attributes('aria-invalid')).toBe('true')
    expect(wrapper.find(`#${email.attributes('aria-describedby')}`).text()).toBe('[signup.error.email] {product} {email}')
    expect(wrapper.text()).toContain('[signup.error.consent]')
  })

  it('sends the product, consent version, page and the empty honeypot, then asks to check the inbox', async () => {
    const { wrapper, calls } = setup()
    await fillAndSubmit(wrapper, ' ana@example.com ', true)

    expect(calls).toEqual([
      {
        route: 'subscribe',
        payload: { email: 'ana@example.com', product: 'gedo', consent: true, consentVersion: '2026-11-13', page: window.location.href, website: '' },
      },
    ])
    expect(wrapper.find('[role="status"]').text()).toBe('[signup.success] Gedo hello@example.com')
    expect(wrapper.find('input[type="email"]').exists()).toBe(false)
  })

  it.each([
    [{ kind: 'rate-limited' } as const, '[signup.rateLimited]'],
    [{ kind: 'unavailable' } as const, '[signup.unavailable] Gedo hello@example.com'],
  ])('keeps what was typed and explains a %o answer', async (answer, message) => {
    const { wrapper } = setup(answer)
    await fillAndSubmit(wrapper, 'ana@example.com', true)

    expect(wrapper.find('[role="status"]').text()).toContain(message)
    expect((wrapper.find('input[type="email"]').element as HTMLInputElement).value).toBe('ana@example.com')
  })

  it('shows the fields the function refused', async () => {
    const { wrapper } = setup({ kind: 'invalid', fields: ['email'] })
    await fillAndSubmit(wrapper, 'ana@example.com', true)

    expect(wrapper.text()).toContain('[signup.error.email]')
  })

  it('hides the honeypot from people and assistive technology', () => {
    const { wrapper } = setup()

    const honeypot = wrapper.find('input[name="website"]')
    expect(honeypot.attributes('tabindex')).toBe('-1')
    expect(honeypot.element.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('tells visitors without JavaScript how else to reach the company', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(ReleaseSignupForm, { product: inDevelopment, strings, contactEmail: 'hello@example.com', consentVersion: 'v', endpoint: 'x' }),
      }),
    )

    expect(html).toMatch(/<noscript>[\s\S]*\[signup.noScript\] Gedo hello@example.com[\s\S]*<\/noscript>/)
    expect(html).not.toContain('style=')
  })
})
