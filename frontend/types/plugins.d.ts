import type { useAuthStore } from '~/stores/auth';
import type { usePoolsStore } from '~/stores/pool';
import type { useChampionshipsStore } from '~/stores/championships';
import type { useMatchesStore } from '~/stores/matches';
import type { useBetsStore } from '~/stores/bet';
import type { useInvitationsStore } from '~/stores/invitations';
import type { useStandingsStore } from '~/stores/standings';
import type { useUsersStore } from '~/stores/users';
import type { useUiStore } from '~/stores/ui';
import type { useAiStore } from '~/stores/ai';

interface IStores {
  auth: ReturnType<typeof useAuthStore>;
  pools: ReturnType<typeof usePoolsStore>;
  championships: ReturnType<typeof useChampionshipsStore>;
  matches: ReturnType<typeof useMatchesStore>;
  bet: ReturnType<typeof useBetsStore>;
  invitations: ReturnType<typeof useInvitationsStore>;
  standings: ReturnType<typeof useStandingsStore>;
  users: ReturnType<typeof useUsersStore>;
  ui: ReturnType<typeof useUiStore>;
  ai: ReturnType<typeof useAiStore>;
}

declare module '#app' {
  interface NuxtApp {
    $stores: IStores;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $stores: IStores;
  }
}