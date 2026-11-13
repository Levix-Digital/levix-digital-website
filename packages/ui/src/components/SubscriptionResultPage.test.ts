import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import type { ConfirmOutcome, UnsubscribeOutcome } from '../release-signup/client'
import { fakeClient, strings } from '../release-signup/fixtures'
import SubscriptionResultPage from './SubscriptionResultPage.vue'

async function open(mode: 'confirm' | 'unsubscribe', hash: string, answers: { confirm?: ConfirmOutcome; unsubscribe?: UnsubscribeOutcome } = {}) {
  window.history.replaceState(null, '', `/subscription/${mode}${hash}`)
  const { client, calls } = fakeClient(answers)
  const wrapper = mount(SubscriptionResultPage, {
    props: { mode, productName: 'Gedo', strings, contactEmail: 'hello@example.com', endpoint: 'x', client },
  })
  await flushPromises()
  return { wrapper, calls, state: wrapper.find('[role="status"]').attributes('data-state') }
}

afterEach(() => window.history.replaceState(null, '', '/'))

describe('SubscriptionResultPage', () => {
  it('confirms with the token of the address and removes it from the address', async () => {
    const { wrapper, calls, state } = await open('confirm', '#abc.def')

    expect(calls).toEqual([{ route: 'confirm', payload: 'abc.def' }])
    expect(state).toBe('confirmed')
    expect(wrapper.find('h1').text()).toBe('[subscription.confirm.title] {product} {email}')
    expect(wrapper.text()).toContain('[subscription.confirmed] Gedo')
    expect(window.location.hash).toBe('')
    expect(wrapper.find('a').attributes('href')).toBe('/')
  })

  it.each([
    ['confirm', { confirm: 'expired' as const }, 'expired'],
    ['confirm', { confirm: 'unavailable' as const }, 'failed'],
    ['unsubscribe', {}, 'unsubscribed'],
    ['unsubscribe', { unsubscribe: 'unavailable' as const }, 'failed'],
  ] as const)('%s answering %o shows %s', async (mode, answers, expected) => {
    const { state } = await open(mode, '#abc.def', answers)
    expect(state).toBe(expected)
  })

  it('says the link is incomplete when it has no token, and calls nothing', async () => {
    const { calls, state, wrapper } = await open('unsubscribe', '')

    expect(calls).toEqual([])
    expect(state).toBe('missing-token')
    expect(wrapper.find('h1').text()).toContain('[subscription.unsubscribe.title]')
  })
})
