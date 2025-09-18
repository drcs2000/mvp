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
  homeTeamApiId?: number | null;
  awayTeamApiId?: number | null;
}

export interface H2HData {
  team1Id: number;
  team2Id: number;
  matches: Match[];
  lastUpdated: string;
}

export const useMatchesStore = defineStore('matches', () => {
  const matches = ref<Match[]>([]);
  const loading = ref(false);

  /**
   * Busca as partidas de um campeonato específico pela API.
   * @param apiFootballId O ID do campeonato na API Football.
   * @returns Um objeto indicando sucesso ou falha, com os dados das partidas ou uma mensagem de erro.
   */
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

  /**
   * Busca as partidas de um time específico pelo nome.
   * @param teamName O nome do time.
   * @returns Um objeto indicando sucesso ou falha, com os dados das partidas ou uma mensagem de erro.
   */
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

  /**
   * Busca os últimos jogos de dois times em um determinado campeonato.
   * @param championshipId O ID do campeonato.
   * @param team1Id O ID do primeiro time.
   * @param team2Id O ID do segundo time.
   * @returns Um objeto indicando sucesso ou falha, com os dados dos últimos jogos ou uma mensagem de erro.
   */
  async function fetchLastGames(championshipId: number, team1Id: number, team2Id: number) {
    try {
      const response = await $fetch<{ [key: number]: Match[] }>(`/api/matches/last-games/${championshipId}/${team1Id}/${team2Id}`);
      return { success: true, data: response };
    } catch (error: any) {
      console.error('Erro ao buscar os últimos jogos dos times:', error);
      return { success: false, error: error.data?.message || 'Falha ao buscar últimos jogos' };
    }
  }

  /**
   * Busca o histórico de confrontos diretos (Head-to-Head) entre dois times.
   * @param team1Id O ID do primeiro time na API Football.
   * @param team2Id O ID do segundo time na API Football.
   * @returns Um objeto indicando sucesso ou falha, com os dados do H2H ou uma mensagem de erro.
   */
  async function fetchH2H(team1Id: number, team2Id: number) {
    try {
      const h2hData = await $fetch<H2HData>(`/api/matches/h2h/${team1Id}/${team2Id}`);
      return { success: true, data: h2hData };
    } catch (error: any) {
      console.error('Erro ao buscar H2H dos times:', error);
      return { success: false, error: error.data?.message || 'Falha ao buscar H2H' };
    }
  }

  return {
    matches,
    loading,
    fetchByChampionship,
    fetchByTeam,
    fetchLastGames,
    fetchH2H,
  };
});
