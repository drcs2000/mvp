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

function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    typeof (error as { data: unknown }).data === 'object' &&
    (error as { data: unknown }).data !== null
  ) {
    const errorData = (error as { data: { message?: unknown } }).data;
    if (typeof errorData.message === 'string') {
      return errorData.message;
    }
  }
  return defaultMessage;
}

export const useMatchesStore = defineStore('matches', () => {
  const matches = ref<Match[]>([]);
  const matchesCache = ref<{ [key: number]: Match[] }>({});
  const loading = ref(false);

  /**
   * Busca as partidas de um campeonato específico pela API.
   * @param apiFootballId O ID do campeonato na API Football.
   * @returns Um objeto indicando sucesso ou falha, com os dados das partidas ou uma mensagem de erro.
   */
  async function fetchByChampionship(apiFootballId: number) {
    if (matchesCache.value[apiFootballId] && matches.value.length !== 0) {
      matches.value = matchesCache.value[apiFootballId];
      return { success: true, data: matches.value };
    }

    loading.value = true;
    try {
      const championshipMatches = await $fetch<Match[]>(`/api/matches/championship/${apiFootballId}`);
      matches.value = championshipMatches;
      matchesCache.value[apiFootballId] = championshipMatches;
      return { success: true, data: championshipMatches };
    } catch (error: unknown) {
      console.error('Erro ao buscar jogos do campeonato:', error);
      matches.value = [];
      const message = getErrorMessage(error, 'Falha ao buscar jogos');
      return { success: false, error: message };
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
    } catch (error: unknown) {
      console.error(`Erro ao buscar jogos do time ${teamName}:`, error);
      matches.value = [];
      const message = getErrorMessage(error, 'Falha ao buscar jogos');
      return { success: false, error: message };
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
    } catch (error: unknown) {
      console.error('Erro ao buscar os últimos jogos dos times:', error);
      const message = getErrorMessage(error, 'Falha ao buscar últimos jogos');
      return { success: false, error: message };
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
    } catch (error: unknown) {
      console.error('Erro ao buscar H2H dos times:', error);
      const message = getErrorMessage(error, 'Falha ao buscar H2H');
      return { success: false, error: message };
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

