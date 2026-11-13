<script setup lang="ts">
/**
 * The release candidate signup of a product that cannot be downloaded yet: email, unticked consent (CASL), sender
 * identification, and the answer of the function. A hidden honeypot field catches bots. Without JavaScript the
 * prerendered form says it needs it and gives the contact address.
 */
import { computed, ref, useId } from 'vue'
import { createReleaseSignupClient, type ReleaseSignupClient } from '../release-signup/client'
import { fillText, type AvailabilityStrings, type PanelProduct } from '../release-signup/types'

const props = withDefaults(
  defineProps<{
    product: PanelProduct
    strings: AvailabilityStrings
    contactEmail: string
    consentVersion: string
    endpoint: string
    client?: ReleaseSignupClient | undefined
  }>(),
  { client: undefined },
)

type State = 'idle' | 'sending' | 'done' | 'rate-limited' | 'unavailable'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/
const id = useId()
const email = ref('')
const consent = ref(false)
const website = ref('')
const state = ref<State>('idle')
const errors = ref<{ email: boolean; consent: boolean }>({ email: false, consent: false })

const values = computed(() => ({ product: props.product.name, email: props.contactEmail }))
const text = (key: keyof AvailabilityStrings) => fillText(props.strings[key], values.value)
const status = computed(() => {
  if (state.value === 'done') return text('signup.success')
  if (state.value === 'rate-limited') return text('signup.rateLimited')
  if (state.value === 'unavailable') return text('signup.unavailable')
  return ''
})

async function submit(): Promise<void> {
  errors.value = { email: !EMAIL_PATTERN.test(email.value.trim()), consent: !consent.value }
  if (errors.value.email || errors.value.consent) return
  state.value = 'sending'
  const client = props.client ?? createReleaseSignupClient(props.endpoint)
  const outcome = await client.subscribe({
    email: email.value.trim(),
    product: props.product.id,
    consent: consent.value,
    consentVersion: props.consentVersion,
    page: window.location.href,
    website: website.value,
  })
  if (outcome.kind === 'invalid') {
    errors.value = { email: outcome.fields.includes('email'), consent: outcome.fields.includes('consent') }
    state.value = errors.value.email || errors.value.consent ? 'idle' : 'unavailable'
    return
  }
  state.value = outcome.kind === 'check-inbox' ? 'done' : outcome.kind
}
</script>

<template>
  <form
    class="mt-6 max-w-xl"
    novalidate
    :aria-labelledby="`${id}-heading`"
    @submit.prevent="submit"
  >
    <h2
      :id="`${id}-heading`"
      class="text-lg font-semibold"
    >
      {{ strings['signup.heading'] }}
    </h2>
    <p class="mt-1 text-sm">
      {{ text('signup.lead') }}
    </p>
    <noscript>
      <p class="mt-3 text-sm">
      {{ text('signup.noScript') }}
      </p>
    </noscript>

    <template v-if="state !== 'done'">
      <label
        :for="`${id}-email`"
        class="mt-4 block text-sm font-medium text-title"
      >{{ strings['signup.email'] }}</label>
      <input
        :id="`${id}-email`"
        v-model="email"
        type="email"
        name="email"
        autocomplete="email"
        required
        :aria-invalid="errors.email"
        :aria-describedby="errors.email ? `${id}-email-error` : undefined"
        class="mt-1 w-full rounded-lg border border-control bg-surface px-3 py-2 text-title focus-visible:border-accent"
      >
      <p
        v-if="errors.email"
        :id="`${id}-email-error`"
        class="mt-1 text-sm text-error"
      >
        {{ strings['signup.error.email'] }}
      </p>

      <div
        class="absolute -left-[10000px] h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        <label :for="`${id}-website`">Website</label>
        <input
          :id="`${id}-website`"
          v-model="website"
          type="text"
          name="website"
          tabindex="-1"
          autocomplete="off"
        >
      </div>

      <div class="mt-4 flex items-start gap-3">
        <input
          :id="`${id}-consent`"
          v-model="consent"
          type="checkbox"
          name="consent"
          :aria-invalid="errors.consent"
          :aria-describedby="errors.consent ? `${id}-consent-error ${id}-sender` : `${id}-sender`"
          class="mt-1 size-4 shrink-0 accent-accent"
        >
        <label
          :for="`${id}-consent`"
          class="text-sm"
        >{{ text('signup.consent') }}</label>
      </div>
      <p
        v-if="errors.consent"
        :id="`${id}-consent-error`"
        class="mt-1 text-sm text-error"
      >
        {{ strings['signup.error.consent'] }}
      </p>
      <p
        :id="`${id}-sender`"
        class="mt-2 text-xs text-muted"
      >
        {{ text('signup.sender') }}
      </p>

      <button
        type="submit"
        class="mt-4 inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:opacity-90 disabled:opacity-60"
        :disabled="state === 'sending'"
      >
        {{ state === 'sending' ? strings['signup.sending'] : strings['signup.submit'] }}
      </button>
    </template>

    <p
      class="mt-4 text-sm"
      :class="state === 'done' ? 'text-title' : 'text-error'"
      role="status"
      aria-live="polite"
    >
      {{ status }}
    </p>
  </form>
</template>
