import { defineNuxtPlugin } from '#app'
import { useAuthStore } from '~/stores/auth'
import { usePoolsStore } from '~/stores/pool'
import { useChampionshipsStore } from '~/stores/championships'
import { useMatchesStore } from '~/stores/matches'
import { useBetsStore } from '~/stores/bet'

export default defineNuxtPlugin((nuxtApp) => {
  const stores = {
    auth: useAuthStore(),
    pools: usePoolsStore(),
    championships: useChampionshipsStore(),
    matches: useMatchesStore(),
    bet: useBetsStore()
  }

  return {
    provide: {
      stores: stores,
    },
  }
})
