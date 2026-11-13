<script setup lang="ts">
/**
 * The page an email link opens: it reads the token from the address fragment (never sent to a server), removes it from
 * the address, and posts it to the function, so link scanners that only fetch the page change nothing.
 */
import { computed, onMounted, ref } from 'vue'
import { createReleaseSignupClient, type ReleaseSignupClient } from '../release-signup/client'
import { fillText, type AvailabilityStrings } from '../release-signup/types'
import ActionLink from './ActionLink.vue'
import PageContainer from './PageContainer.vue'

const props = withDefaults(
  defineProps<{
    mode: 'confirm' | 'unsubscribe'
    productName: string
    strings: AvailabilityStrings
    contactEmail: string
    endpoint: string
    client?: ReleaseSignupClient | undefined
  }>(),
  { client: undefined },
)

type State = 'working' | 'confirmed' | 'expired' | 'unsubscribed' | 'missing-token' | 'failed'

const state = ref<State>('working')
const values = computed(() => ({ product: props.productName, email: props.contactEmail }))
const MESSAGE: Record<State, keyof AvailabilityStrings> = {
  working: 'subscription.working',
  confirmed: 'subscription.confirmed',
  expired: 'subscription.expired',
  unsubscribed: 'subscription.unsubscribed',
  'missing-token': 'subscription.missingToken',
  failed: 'subscription.failed',
}
const message = computed(() => fillText(props.strings[MESSAGE[state.value]], values.value))
const title = computed(() => props.strings[props.mode === 'confirm' ? 'subscription.confirm.title' : 'subscription.unsubscribe.title'])

onMounted(async () => {
  const token = window.location.hash.slice(1)
  if (token) window.history.replaceState(null, '', window.location.pathname)
  if (!token) {
    state.value = 'missing-token'
    return
  }
  const client = props.client ?? createReleaseSignupClient(props.endpoint)
  if (props.mode === 'confirm') {
    const outcome = await client.confirm(token)
    state.value = outcome === 'unavailable' ? 'failed' : outcome
  } else {
    const outcome = await client.unsubscribe(token)
    state.value = outcome === 'unavailable' ? 'failed' : outcome
  }
})
</script>

<template>
  <section class="py-16 sm:py-24">
    <PageContainer>
      <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
        {{ title }}
      </h1>
      <p
        class="mt-4 max-w-2xl text-lg"
        role="status"
        aria-live="polite"
        :data-state="state"
      >
        {{ message }}
      </p>
      <div class="mt-8">
        <ActionLink
          href="/"
          variant="secondary"
        >
          {{ fillText(strings['subscription.back'], values) }}
        </ActionLink>
      </div>
    </PageContainer>
  </section>
</template>
