import axios from 'axios';
import 'dotenv/config';

export interface IEspnEventCompetitor {
  id: string;
  homeAway: 'home' | 'away';
  score: any;
  team: {
    id: string;
    displayName: string;
    logos?: { href: string }[];
  };
}

export interface IEspnEvent {
  id: string;
  date: string;
  name: string;
  competitions?: {
    id: string;
    competitors: IEspnEventCompetitor[];
    status: {
      type: { name: string; detail: string };
    };
    venue?: {
      fullName: string;
      address: { city: string };
    };
  }[];
  season: {
    year: number;
    slug: string;
  };
  week?: {
    text: string;
  };
}

export interface IEspnTeam {
  id: string;
  name: string;
}

class ExternalAPIService {
  private apiClient = axios.create({
    baseURL: 'http://site.api.espn.com/apis/site/v2/sports/soccer',
  });

  private webApiClient = axios.create({
    baseURL: 'https://site.web.api.espn.com/apis/v2/sports/soccer',
  });

  public async getStandings(leagueSlug: string): Promise<any> {
    const endpoint = `/${leagueSlug}/standings`;
    const response = await this.webApiClient.get(endpoint);
    return response.data;
  }

  public async getTodaysMatches(leagueSlug: string): Promise<IEspnEvent[]> {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const dateString = `${year}${month}${day}`;
    
    const endpoint = `/${leagueSlug}/scoreboard?dates=${dateString}`;
    
    const response = await this.apiClient.get(endpoint);
    return response.data?.events || [];
  }

  public async getMatchesByDate(leagueSlug: string, date: Date): Promise<IEspnEvent[]> {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateString = `${year}${month}${day}`;
    
    const endpoint = `/${leagueSlug}/scoreboard?dates=${dateString}`;
    
    try {
      const response = await this.apiClient.get(endpoint);
      return response.data?.events || [];
    } catch (error) {
      console.error(`Erro ao buscar jogos para a liga ${leagueSlug} na data ${dateString}:`, error);
      return [];
    }
  }

  public async getScheduleForTeam(leagueSlug: string, teamId: string): Promise<IEspnEvent[]> {
    const pastGamesEndpoint = `/${leagueSlug}/teams/${teamId}/schedule`;
    const futureGamesEndpoint = `/${leagueSlug}/teams/${teamId}/schedule?fixture=true`;

    try {
      const [pastGamesResponse, futureGamesResponse] = await Promise.all([
        this.apiClient.get(pastGamesEndpoint),
        this.apiClient.get(futureGamesEndpoint)
      ]);

      const pastEvents: IEspnEvent[] = pastGamesResponse.data?.events || [];
      const futureEvents: IEspnEvent[] = futureGamesResponse.data?.events || [];

      const allEventsMap = new Map<string, IEspnEvent>();
      for (const event of pastEvents) {
        allEventsMap.set(event.id, event);
      }
      for (const event of futureEvents) {
        allEventsMap.set(event.id, event);
      }

      return Array.from(allEventsMap.values());

    } catch (error) {
      console.error(`Erro ao buscar calendário completo para o time ${teamId} na liga ${leagueSlug}:`, error);
      return [];
    }
  }
}

export default new ExternalAPIService();