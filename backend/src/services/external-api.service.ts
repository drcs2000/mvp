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
}

export default new ExternalAPIService();

