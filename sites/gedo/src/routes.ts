import type { RouteRecordRaw } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import SubscriptionPage from './pages/SubscriptionPage.vue'

/** The product page, and the two pages the release candidate emails link to. */
export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/subscription/confirm', name: 'subscription-confirm', component: SubscriptionPage, props: { mode: 'confirm' } },
  { path: '/subscription/unsubscribe', name: 'subscription-unsubscribe', component: SubscriptionPage, props: { mode: 'unsubscribe' } },
]
