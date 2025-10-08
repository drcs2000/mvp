import { defineStore } from 'pinia';
import { ref } from 'vue';

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  HALFTIME = 'HALFTIME',
  FULL_TIME = 'FULL_TIME',
  FINAL = 'FINAL',
  POSTPONED = 'POSTPONED',
  CANCELED = 'CANCELED',
}

type ChampionshipReference = {
  id: number;
};

export type Match = {
  id: number;
  championship: ChampionshipReference;
  apiEspnId: number;
  date: string;
  venueName: string | null;
  venueCity: string | null;
  homeTeamEspnId: number;
  homeTeamName: string;
  homeTeamLogoUrl: string;
  awayTeamEspnId: number;
  awayTeamName: string;
  awayTeamLogoUrl: string;
  homeScore?: number | null;
  awayScore?: number | null;
  status: MatchStatus;
  apiEspnStatusDetail: string | null;
  round: string | null;
  createdAt: string;
  updatedAt: string;
};

export type H2HData = {
  stats: {
    team1Wins: number;
    team2Wins: number;
    draws: number;
  };
  matches: Match[];
};

export const useMatchesStore = defineStore('matches', () => {
  const matches = ref<Match[]>([]);
  const matchesCache = ref<{ [key: number]: Match[] }>({});
  const isLoading = ref(false);
  const error = ref<unknown | null>(null);
  const config = useRuntimeConfig();
  const apiBaseUrl = config.public.apiBaseUrl;

  async function fetchByChampionship(championshipId: number) {
    if (matchesCache.value[championshipId]) {
      matches.value = matchesCache.value[championshipId];
      return;
    }

    isLoading.value = true;
    error.value = null;
    try {
      const url = import.meta.dev ? `/api/matches/championship/${championshipId}` : `${apiBaseUrl}/matches/championship/${championshipId}`;
      const championshipMatches = await $fetch<Match[]>(url);
      matches.value = championshipMatches;
      matchesCache.value[championshipId] = championshipMatches;
    } catch (err: unknown) {
      console.error('Erro ao buscar jogos do campeonato:', err);
      matches.value = [];
      error.value = err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchByTeam(teamId: number) {
    isLoading.value = true;
    error.value = null;
    try {
      const url = import.meta.dev ? `/api/matches/team/${teamId}` : `${apiBaseUrl}/matches/team/${teamId}`;
      const teamMatches = await $fetch<Match[]>(url);
      matches.value = teamMatches;
    } catch (err: unknown) {
      console.error(`Erro ao buscar jogos do time ${teamId}:`, err);
      matches.value = [];
      error.value = err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchLastGames(teamIds: number[]): Promise<{ [key: number]: Match[] } | null> {
    try {
      const url = import.meta.dev ? `/api/matches/last-games` : `${apiBaseUrl}/matches/last-games`;
      const response = await $fetch<{ [key: number]: Match[] }>(url, {
        params: { teamIds: teamIds.join(',') }
      });
      return response;
    } catch (err: unknown) {
      console.error('Erro ao buscar os últimos jogos dos times:', err);
      error.value = err;
      return null;
    }
  }

  async function fetchH2H(team1Id: number, team2Id: number): Promise<H2HData | null> {
    try {
      const url = import.meta.dev ? `/api/matches/h2h/${team1Id}/${team2Id}` : `${apiBaseUrl}/matches/h2h/${team1Id}/${team2Id}`;
      const h2hData = await $fetch<H2HData>(url);
      return h2hData;
    } catch (err: unknown) {
      console.error('Erro ao buscar H2H dos times:', err);
      error.value = err;
      return null;
    }
  }

  return {
    matches,
    isLoading,
    error,
    fetchByChampionship,
    fetchByTeam,
    fetchLastGames,
    fetchH2H,
  };
});
