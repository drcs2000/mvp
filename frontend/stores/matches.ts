import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Match {
  id: number;
  espnId: number;
  apiFootballId: number;
  apiFootballFixtureId: number;
  date: string;
  stadium: string;
  homeTeamName: string;
  homeTeamLogoUrl: string;
  awayTeamName: string;
  awayTeamLogoUrl: string;
  homeScore?: number;
  awayScore?: number;
  status: string;
}

export const useMatchesStore = defineStore('matches', () => {
  const matches = ref<Match[]>([]);
  const loading = ref(false);
  
  async function fetchByChampionship(apiFootballId: number) {
    loading.value = true;
    try {
      const championshipMatches = await $fetch<Match[]>(`/api/matches/championship/${apiFootballId}`);
      matches.value = championshipMatches;
      return { success: true, data: championshipMatches };
    } catch (error: any) {
      console.error('Erro ao buscar jogos do campeonato:', error);
      matches.value = [];
      return { success: false, error: error.data?.message || 'Falha ao buscar jogos' };
    } finally {
      loading.value = false;
    }
  }

  async function fetchByTeam(teamName: string) {
    loading.value = true;
    try {
      const teamMatches = await $fetch<Match[]>('/api/matches/team', {
        params: { name: teamName } 
      });
      matches.value = teamMatches;
      return { success: true, data: teamMatches };
    } catch (error: any) {
      console.error(`Erro ao buscar jogos do time ${teamName}:`, error);
      matches.value = [];
      return { success: false, error: error.data?.message || 'Falha ao buscar jogos' };
    } finally {
      loading.value = false;
    }
  }

  return {
    matches,
    loading,
    fetchByChampionship,
    fetchByTeam,
  };
});
