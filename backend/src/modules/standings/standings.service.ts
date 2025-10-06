import { AppDataSource } from '../../database/data-source.js';
import { Standings } from '../../entities/standings.entity.js';
import { Championship } from '../../entities/championship.entity.js';
import { Repository } from 'typeorm';
import ExternalApiService from '../../services/external-api.service.js';

export interface IEspnStandingEntry {
  team: {
    id: string;
    displayName: string;
    logos?: { href: string }[];
  };
  stats: { name: string; value: number }[];
}

export interface IEspnStandingsPayload {
  name: string;
  season?: { type: { name: string } };
  children?: {
    name: string;
    standings: { entries: IEspnStandingEntry[] };
  }[];
  standings?: {
    entries: IEspnStandingEntry[];
  };
}

class StandingsService {
  private standingsRepository: Repository<Standings>;
  private championshipRepository: Repository<Championship>;

  constructor() {
    this.standingsRepository = AppDataSource.getRepository(Standings);
    this.championshipRepository = AppDataSource.getRepository(Championship);
  }

  public async getStandings(championshipId: number): Promise<Standings[]> {
    return this.standingsRepository.find({
      where: {
        championship: { id: championshipId },
      },
      order: {
        rank: 'ASC',
      },
    });
  }

  /**
   * Atualiza a classificação de um campeonato, buscando dados da API
   * e aplicando as regras de descrição da tabela 'championship_rules'.
   */
  public async updateStandings(championshipId: number): Promise<void> {
    const championship = await this.championshipRepository.findOne({
      where: { id: championshipId },
      relations: ['standingRules'], // Carrega as regras junto com o campeonato
    });

    if (!championship) {
      throw new Error(`Campeonato com ID ${championshipId} não encontrado.`);
    }

    const apiStandingsPayload: IEspnStandingsPayload = await ExternalApiService.getStandings(championship.apiEspnSlug);
    const standingsToSave: Partial<Standings>[] = [];
    const rules = championship.standingRules || [];
    
    // Função auxiliar para processar cada time da classificação
    const processEntry = (entry: IEspnStandingEntry, groupName: string | null) => {
      const statsMap = new Map(entry.stats.map(stat => [stat.name, stat.value]));
      const rank = statsMap.get('rank') ?? 0;
      
      // Encontra a regra aplicável com base no rank do time
      const applicableRule = rules.find(rule => rank >= rule.minRank && rank <= rule.maxRank);

      standingsToSave.push({
        teamEspnId: parseInt(entry.team.id, 10),
        teamName: entry.team.displayName,
        teamLogoUrl: entry.team.logos?.[0]?.href || '',
        rank,
        points: statsMap.get('points') ?? 0,
        played: statsMap.get('gamesPlayed') ?? 0,
        win: statsMap.get('wins') ?? 0,
        draw: statsMap.get('ties') ?? 0,
        lose: statsMap.get('losses') ?? 0,
        goalsFor: statsMap.get('pointsFor') ?? 0,
        goalsAgainst: statsMap.get('pointsAgainst') ?? 0,
        goalsDiff: statsMap.get('pointDifferential') ?? 0,
        description: applicableRule?.description || null, // Aplica a descrição da regra encontrada
        round: groupName,
      });
    };

    // Lida com o formato de copas (com 'children' para cada grupo)
    if (apiStandingsPayload.children && apiStandingsPayload.children.length > 0) {
      for (const group of apiStandingsPayload.children) {
        group.standings?.entries?.forEach(entry => processEntry(entry, group.name));
      }
    } 
    // Lida com o formato de ligas (sem 'children')
    else if (apiStandingsPayload.standings?.entries) {
      const phaseName = apiStandingsPayload.season?.type?.name || apiStandingsPayload.name;
      apiStandingsPayload.standings.entries.forEach(entry => processEntry(entry, phaseName));
    }

    if (standingsToSave.length > 0) {
      const payload = standingsToSave.map(s => ({ ...s, championship }));
      await this.standingsRepository.upsert(payload, ['championship', 'teamEspnId']);
    }
  }
}

export default new StandingsService();