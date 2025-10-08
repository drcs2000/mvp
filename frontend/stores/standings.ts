import { defineStore } from 'pinia';
import { ref } from 'vue';

type ChampionshipReference = {
  id: number;
};

export type Standing = {
  id: number;
  championship: ChampionshipReference;
  teamEspnId: number;
  teamName: string;
  teamLogoUrl: string;
  rank: number;
  points: number;
  goalsDiff: number;
  form: string | null;
  round: string | null;
  description: string | null;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
  updatedAt: Date;
};

export const useStandingsStore = defineStore('standings', () => {
  const standings = ref<Standing[]>([]);
  const standingsCache = ref<{ [key: number]: Standing[] }>({});
  const isLoading = ref(false);
  const error = ref<unknown | null>(null);
  const config = useRuntimeConfig();
  const apiBaseUrl = config.public.apiBaseUrl;

  async function fetchStandingsByChampionshipId(championshipId: number) {
    if (standingsCache.value[championshipId]) {
      standings.value = standingsCache.value[championshipId];
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const url = import.meta.dev ? `/api/standings/${championshipId}` : `${apiBaseUrl}/standings/${championshipId}`;
      const data = await $fetch<Standing[]>(url);
      standings.value = data;
      standingsCache.value[championshipId] = data;
    } catch (err: unknown) {
      error.value = err;
      standings.value = [];
      console.error('Falha ao buscar a tabela de classificação:', err);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    standings,
    isLoading,
    error,
    fetchStandingsByChampionshipId,
  };
});
