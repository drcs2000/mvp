import { defineNuxtPlugin } from '#app'
import { useAuthStore } from '~/stores/auth'
import { usePoolsStore } from '~/stores/pool'
import { useChampionshipsStore } from '~/stores/championships'
import { useMatchesStore } from '~/stores/matches'
import { useUiStore } from '~/stores/ui'

export default defineNuxtPlugin((nuxtApp) => {
  const stores = {
    auth: useAuthStore(),
    pools: usePoolsStore(),
    championships: useChampionshipsStore(),
    matches: useMatchesStore(),
    ui: useUiStore()
  }

  return {
    provide: {
      stores: stores,
    },
  }
})
