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
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchStandingsByChampionshipId(apiFootballId: number) {
    isLoading.value = true;
    error.value = null;
    standings.value = [];

    try {
      const data = await $fetch<Standing[]>(`/api/standings/${apiFootballId}`);
      standings.value = data;
    } catch (err: any) {
      error.value = err;
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