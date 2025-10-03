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

class ExternalAPIService {
  private apiClient = axios.create({
    baseURL: 'http://site.api.espn.com/apis/site/v2/sports/soccer',
  });

  private webApiClient = axios.create({
    baseURL: 'https://site.web.api.espn.com/apis/v2/sports/soccer',
  });

  /**
   * Busca a classificação (tabela) para uma liga específica.
   * @param leagueSlug O slug da liga (ex: 'bra.1', 'eng.1').
   * @returns O payload completo da API de standings.
   */
  public async getStandings(leagueSlug: string): Promise<any> {
    const endpoint = `/${leagueSlug}/standings`;
    const response = await this.webApiClient.get(endpoint);
    return response.data;
  }

  /**
   * Busca todos os jogos agendados para o dia atual em uma liga específica.
   * @param leagueSlug O slug da liga (ex: 'bra.1', 'eng.1').
   * @returns Uma promessa que resolve para um array de eventos (jogos).
   */
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

  public async getFullDailyScoreboard(): Promise<IEspnEvent[]> {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const dateString = `${year}${month}${day}`;
  
    const endpoint = `/all/scoreboard?dates=${dateString}`;
    
    const response = await this.apiClient.get(endpoint);
    return response.data?.events || [];
  }
}

export default new ExternalAPIService();
