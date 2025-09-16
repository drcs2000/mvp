import { AppDataSource } from '../../database/data-source';
import { Standings } from '../../entities/standings.entity';
import { Championship } from '../../entities/championship.entity';
import { Match, MatchStatus } from '../../entities/match.entity';

const normalizeName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s/g, '');
};
class StandingsService {
  private standingsRepository = AppDataSource.getRepository(Standings);
  private championshipRepository = AppDataSource.getRepository(Championship);
  private matchRepository = AppDataSource.getRepository(Match);

  public async getStandingsByChampionshipId(apiFootballId: number): Promise<Standings[]> {
    return this.standingsRepository.find({
      where: {
        championshipApiFootballId: apiFootballId,
      },
      order: {
        rank: 'ASC',
      },
      relations: {
        championship: true,
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

  public async recalculateStandings(championshipId: number): Promise<void> {
    const finishedMatches = await this.matchRepository.find({
      where: {
        apiFootballId: championshipId,
        status: MatchStatus.FINISHED,
      },
      order: {
        date: 'ASC',
      }
    });

    const teamsStats = new Map<number | string, any>();
    const teamsInfo = new Map<number | string, any>();

    for (const match of finishedMatches) {
      const homeTeamKey = match.homeTeamApiId ?? normalizeName(match.homeTeamName);
      const awayTeamKey = match.awayTeamApiId ?? normalizeName(match.awayTeamName);

      if (!teamsStats.has(homeTeamKey)) {
        teamsStats.set(homeTeamKey, { played: 0, win: 0, draw: 0, lose: 0, goalsFor: 0, goalsAgainst: 0, points: 0, form: '' });
        teamsInfo.set(homeTeamKey, { name: match.homeTeamName, logo: match.homeTeamLogoUrl, apiId: match.homeTeamApiId });
      }
      if (!teamsStats.has(awayTeamKey)) {
        teamsStats.set(awayTeamKey, { played: 0, win: 0, draw: 0, lose: 0, goalsFor: 0, goalsAgainst: 0, points: 0, form: '' });
        teamsInfo.set(awayTeamKey, { name: match.awayTeamName, logo: match.awayTeamLogoUrl, apiId: match.awayTeamApiId });
      }

      const homeStats = teamsStats.get(homeTeamKey);
      const awayStats = teamsStats.get(awayTeamKey);

      homeStats.played++;
      awayStats.played++;
      homeStats.goalsFor += match.homeScore ?? 0;
      homeStats.goalsAgainst += match.awayScore ?? 0;
      awayStats.goalsFor += match.awayScore ?? 0;
      awayStats.goalsAgainst += match.homeScore ?? 0;

      if ((match.homeScore ?? 0) > (match.awayScore ?? 0)) {
        homeStats.win++;
        homeStats.points += 3;
        awayStats.lose++;
        homeStats.form += 'W';
        awayStats.form += 'L';
      } else if ((match.homeScore ?? 0) < (match.awayScore ?? 0)) {
        awayStats.win++;
        awayStats.points += 3;
        homeStats.lose++;
        homeStats.form += 'L';
        awayStats.form += 'W';
      } else {
        homeStats.draw++;
        homeStats.points += 1;
        awayStats.draw++;
        awayStats.points += 1;
        homeStats.form += 'D';
        awayStats.form += 'D';
      }
    }

    teamsStats.forEach(stats => {
      stats.form = stats.form.slice(-5);
    });

    let standingsList = Array.from(teamsStats.entries()).map(([teamKey, stats]) => {
      const teamInfo = teamsInfo.get(teamKey);
      return {
        championshipApiFootballId: championshipId,
        teamApiId: teamInfo.apiId || null,
        teamName: teamInfo.name,
        teamLogoUrl: teamInfo.logo,
        ...stats,
        goalsDiff: stats.goalsFor - stats.goalsAgainst,
        lastUpdate: new Date(),
      };
    });

    standingsList.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalsDiff !== a.goalsDiff) return b.goalsDiff - a.goalsDiff;
      return b.goalsFor - a.goalsFor;
    });

    const championship = await this.championshipRepository.findOne({
      where: { apiFootballId: championshipId },
      relations: ['standingRules'],
    });

    for (let i = 0; i < standingsList.length; i++) {
      const teamStanding = standingsList[i];
      teamStanding.rank = i + 1;

      if (championship && championship.standingRules) {
        const rule = championship.standingRules.find(r => teamStanding.rank >= r.minRank && teamStanding.rank <= r.maxRank);
        teamStanding.description = rule ? rule.description : null;
      } else {
        teamStanding.description = null;
      }
    }

    await this.standingsRepository.upsert(
      standingsList,
      ['championshipApiFootballId', 'teamApiId']
    );
  }
}

export default new StandingsService();