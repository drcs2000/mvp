import axios from 'axios';
import 'dotenv/config';

const API_FOOTBALL_KEY = process.env.SPORTS_API_KEY;

class ExternalAPIService {
  private espnClient = axios.create({
    baseURL: 'http://site.api.espn.com/apis/site/v2/sports/soccer',
  });

  private footballApiClient = axios.create({
    baseURL: 'https://v3.football.api-sports.io',
    headers: {
      'x-rapidapi-host': 'v3.football.api-sports.io',
      'x-rapidapi-key': API_FOOTBALL_KEY,
    },
  });

  public async getFixturesByLeague(leagueId: number, season: number) {
    if (!API_FOOTBALL_KEY) {
      throw new Error('A chave da API-FOOTBALL não está configurada no .env');
    }
    const response = await this.footballApiClient.get('/fixtures', {
      params: { league: leagueId, season: season },
    });
    return response.data.response;
  }

  public async getEspnScoreboard(leagueSlug: string) {
    const endpoint = `/${leagueSlug}/scoreboard`;
    const response = await this.espnClient.get(endpoint);
    return response.data;
  }

  public async getH2H(team1Id: number, team2Id: number) {
    if (!API_FOOTBALL_KEY) {
      throw new Error('A chave da API-FOOTBALL não está configurada no .env');
    }
    const endpoint = '/fixtures/headtohead';
    const response = await this.footballApiClient.get(endpoint, {
      params: { h2h: `${team1Id}-${team2Id}` },
    });
    return response.data.response;
  }
}

export default new ExternalAPIService();
