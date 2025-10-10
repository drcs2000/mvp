import { defineNuxtPlugin } from '#app'
import { useAuthStore } from '~/stores/auth'
import { usePoolsStore } from '~/stores/pool'
import { useChampionshipsStore } from '~/stores/championships'
import { useMatchesStore } from '~/stores/matches'
import { useBetsStore } from '~/stores/bet'
import { useInvitationsStore } from '~/stores/invitations'
import { useStandingsStore } from '~/stores/standings'
import { useUsersStore } from '~/stores/users'
import { useUiStore } from '~/stores/ui'
import { useAiStore } from '~/stores/ai'

export default defineNuxtPlugin(() => {
  const stores = {
    auth: useAuthStore(),
    pools: usePoolsStore(),
    championships: useChampionshipsStore(),
    matches: useMatchesStore(),
    bet: useBetsStore(),
    invitations: useInvitationsStore(),
    standings: useStandingsStore(),
    users: useUsersStore(),
    ui: useUiStore(),
    ai: useAiStore()
  }

  return {
    provide: {
      stores: stores,
    },
  }
})
