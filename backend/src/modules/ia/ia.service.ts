import { In, Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source.js';
import { Match, MatchStatus } from '../../entities/match.entity.js';
import { HeadToHead } from '../../entities/h2h.entity.js';
import { subYears } from 'date-fns';
import axios from 'axios';

export interface ITrainingDataPayload {
  matches: Match[];
  h2hData: HeadToHead[];
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class IaService {
  private matchRepository: Repository<Match>;
  private h2hRepository: Repository<HeadToHead>;

  constructor() {
    this.matchRepository = AppDataSource.getRepository(Match);
    this.h2hRepository = AppDataSource.getRepository(HeadToHead);
  }

  public async getDataForTraining(): Promise<ITrainingDataPayload> {
    console.log('Montando pacote de dados para treinamento da IA...');
    const allMatches = await this.matchRepository.find({
      where: { status: MatchStatus.FINAL }, order: { date: 'ASC' }, relations: ['championship'],
    });
    console.log(` -> ${allMatches.length} partidas da temporada encontradas.`);
    const allH2hRecords = await this.h2hRepository.find();
    const twoYearsAgo = subYears(new Date(), 2);
    const filteredH2h = allH2hRecords.map(h2h => {
      const recentMatches = h2h.matches.filter(match => new Date(match.date) >= twoYearsAgo);
      h2h.matches = recentMatches;
      return h2h;
    }).filter(h2h => h2h.matches.length > 0);
    console.log(` -> ${filteredH2h.length} registros de H2H com confrontos nos últimos 2 anos.`);
    return { matches: allMatches, h2hData: filteredH2h };
  }


  public async getPrediction(homeTeamId: number, awayTeamId: number, championshipId: number): Promise<any> {
    console.log(`Iniciando predição para: Home ${homeTeamId} vs Away ${awayTeamId}`);
    
    const teamIds = [homeTeamId, awayTeamId];
    const allMatchesForTeams = await this.matchRepository.find({
      where: [{ homeTeamEspnId: In(teamIds) }, { awayTeamEspnId: In(teamIds) }],
      relations: ['championship'],
    });

    const championshipIds = new Set(allMatchesForTeams.map(m => m.championship.id));
    championshipIds.add(championshipId);
    const relevantChampIds = Array.from(championshipIds);
    console.log(` -> Contexto de ${relevantChampIds.length} campeonato(s) relevante(s) será usado.`);

    const contextualMatches = await this.matchRepository.find({
      where: {
        championship: { id: In(relevantChampIds) },
        status: MatchStatus.FINAL,
      },
      relations: ['championship'],
      order: { date: 'ASC' },
    });
    console.log(` -> Enviando ${contextualMatches.length} partidas históricas para contexto.`);

    const sortedTeamIds = [homeTeamId, awayTeamId].sort((a, b) => a - b);
    const h2hRecord = await this.h2hRepository.findOneBy({
      team1EspnId: sortedTeamIds[0],
      team2EspnId: sortedTeamIds[1],
    });
    console.log(` -> Registro H2H ${h2hRecord ? 'encontrado' : 'não encontrado'}.`);

    const payload = {
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      matches: contextualMatches,
      h2h_data: h2hRecord ? [h2hRecord] : [],
    };
    
    const IA_URL = process.env.IA_URL || 'http://localhost:8000/predict';
    
    try {
      console.log(`[Tentativa 1] Enviando requisição de predição para ${IA_URL}...`);
      const response = await axios.post(IA_URL, payload, { timeout: 15000 });
      console.log('Predição recebida da IA com sucesso na primeira tentativa!');
      return response.data;
    } catch (error: any) {
      if (error.code === 'EAI_AGAIN' || error.code === 'ECONNABORTED') {
        console.warn(`[Tentativa 1 Falhou] Erro de cold start detectado (${error.code}). Aquecendo o serviço e tentando novamente...`);
        
        await sleep(5000);

        try {
          console.log(`[Tentativa 2] Reenviando requisição de predição para ${IA_URL}...`);
          const response = await axios.post(IA_URL, payload, { timeout: 30000 });
          console.log('Predição recebida da IA com sucesso na segunda tentativa!');
          return response.data;
        } catch (retryError: any) {
          console.error('[Tentativa 2 Falhou] O serviço de IA não respondeu mesmo após a retentativa.');
          throw retryError; 
        }
      } else {
        console.error('[Tentativa 1 Falhou] Erro não relacionado a cold start.');
        throw error;
      }
    }
  }
}

export default new IaService();