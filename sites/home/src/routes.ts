import type { RouteRecordRaw } from 'vue-router'
import HomePage from './pages/HomePage.vue'

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomePage },
  // Prototype of the vault home, for review; not linked and not indexed.
  { path: '/prototype/vault', name: 'vault-prototype', component: () => import('./prototype/vault/VaultPage.vue') },
]
