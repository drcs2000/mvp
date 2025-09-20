import { defineStore } from 'pinia';
import { ref } from 'vue';

interface Standing {
  id: number;
  championshipApiFootballId: number;
  teamApiId: number;
  teamName: string;
  teamLogoUrl: string;
  rank: number;
  points: number;
  goalsDiff: number;
  form: string;
  description: string | null;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
  lastUpdate: string;
}

export const useStandingsStore = defineStore('standings', () => {
  const standings = ref<Standing[]>([]);
  const standingsCache = ref<{ [key: number]: Standing[] }>({});
  const isLoading = ref(false);
  const error = ref<unknown | null>(null);

  /**
   * Busca a tabela de classificação de um campeonato específico.
   * @param apiFootballId O ID do campeonato na API Football.
   */
  async function fetchStandingsByChampionshipId(apiFootballId: number) {
    if (standingsCache.value[apiFootballId]) {
      standings.value = standingsCache.value[apiFootballId];
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const data = await $fetch<Standing[]>(`/api/standings/${apiFootballId}`);
      standings.value = data;
      standingsCache.value[apiFootballId] = data;
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

