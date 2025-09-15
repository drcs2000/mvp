import { AppDataSource } from '../../database/data-source';
import { Standings } from '../../entities/standings.entity';
import { Championship } from '../../entities/championship.entity';

class StandingsService {
  private standingsRepository = AppDataSource.getRepository(Standings);

  public async getStandingsByChampionshipId(apiFootballId: number): Promise<Standings[]> {
    return this.standingsRepository.find({
      where: {
        championshipApiFootballId: apiFootballId,
      },
      order: {
        rank: 'ASC',
      },
      relations: {
        championship: true, // Inclui dados do campeonato na resposta, se necessário
      }
    });
  }

  public async updateStandingsFromApi(championship: Championship, apiStandingsData: any[]): Promise<void> {
    if (!apiStandingsData || apiStandingsData.length === 0) {
      return;
    }

    const standingsPayload = apiStandingsData.map(standing => {
      return {
        championship: championship,
        championshipApiFootballId: championship.apiFootballId,
        teamApiId: standing.team.id,
        teamName: standing.team.name,
        teamLogoUrl: standing.team.logo,
        rank: standing.rank,
        points: standing.points,
        goalsDiff: standing.goalsDiff,
        form: standing.form,
        description: standing.description,
        played: standing.all.played,
        win: standing.all.win,
        draw: standing.all.draw,
        lose: standing.all.lose,
        goalsFor: standing.all.goals.for,
        goalsAgainst: standing.all.goals.against,
        lastUpdate: new Date(standing.update),
      };
    });

    await this.standingsRepository.upsert(
      standingsPayload,
      ['championshipApiFootballId', 'teamApiId']
    );
  }
}

export default new StandingsService();