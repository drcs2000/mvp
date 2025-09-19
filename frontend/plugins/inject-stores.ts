import { defineNuxtPlugin } from '#app'
import { useAuthStore } from '~/stores/auth'
import { usePoolsStore } from '~/stores/pool'
import { useChampionshipsStore } from '~/stores/championships'
import { useMatchesStore } from '~/stores/matches'
import { useBetsStore } from '~/stores/bet'
import { useInvitationsStore } from '~/stores/invitations'
import { useStandingsStore } from '~/stores/standings'
import { useUsersStore } from '~/stores/users'

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
  }

  return {
    provide: {
      stores: stores,
    },
  }
})
