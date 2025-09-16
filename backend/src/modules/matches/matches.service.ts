import { AppDataSource } from '../../database/data-source';
import { Match, MatchStatus } from '../../entities/match.entity';
import { Bet } from '../../entities/bet.entity';
import { Not, In } from 'typeorm';
import standingsService from '../standings/standings.service';

function normalizeTeamName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

class MatchService {
  private matchRepository = AppDataSource.getRepository(Match);
  private betRepository = AppDataSource.getRepository(Bet);

  async saveMatchData(espnId: number, apiFootballId: number, fixtures: any[]): Promise<Match[]> {
    const savedMatches: Match[] = [];

    for (const matchData of fixtures) {
      const { fixture, teams, goals, league } = matchData;

      const newMatchData = {
        espnId,
        apiFootballId,
        apiFootballFixtureId: fixture.id,
        date: new Date(fixture.date),
        stadium: fixture.venue.name,
        homeTeamName: teams.home.name,
        homeTeamLogoUrl: teams.home.logo,
        awayTeamName: teams.away.name,
        awayTeamLogoUrl: teams.away.logo,
        homeScore: goals.home,
        awayScore: goals.away,
        status: fixture.status.short as MatchStatus,
        round: league.round,
      };

      await this.matchRepository.upsert(newMatchData, ["apiFootballFixtureId"]);

      const savedMatch = await this.matchRepository.findOneOrFail({ where: { apiFootballFixtureId: fixture.id } });
      savedMatches.push(savedMatch);
    }

    return savedMatches;
  }

  async findByChampionship(apiFootballId: number): Promise<Match[]> {
    return this.matchRepository.find({
      where: { apiFootballId },
      order: { date: 'ASC' }
    });
  }

  async findByTeam(teamName: string): Promise<Match[]> {
    return this.matchRepository.find({
      where: [
        { homeTeamName: teamName },
        { awayTeamName: teamName }
      ],
      order: { date: 'ASC' }
    });
  }

  private getStatusFromEspnEvent(espnStatus: string, period: number | null = null): MatchStatus {
    switch (espnStatus) {
      case 'STATUS_FINAL':
      case 'STATUS_FULL_TIME':
        return MatchStatus.FINISHED;
      case 'STATUS_IN_PROGRESS':
        if (period === 1) {
          return MatchStatus.IN_PLAY_1ST_HALF;
        } else if (period === 2) {
          return MatchStatus.IN_PLAY_2ND_HALF;
        }
        return MatchStatus.IN_PLAY_1ST_HALF;
      case 'STATUS_SECOND_HALF':
        return MatchStatus.IN_PLAY_2ND_HALF;
      case 'STATUS_FIRST_HALF':
        return MatchStatus.IN_PLAY_1ST_HALF;
      case 'STATUS_HALFTIME':
        return MatchStatus.HALF_TIME;
      case 'STATUS_SCHEDULED':
      case 'STATUS_PREGAME':
        return MatchStatus.NOT_STARTED;
      case 'STATUS_CANCELED':
        return MatchStatus.CANCELLED;
      case 'STATUS_POSTPONED':
        return MatchStatus.POSTPONED;
      default:
        return MatchStatus.NOT_STARTED;
    }
  }

  private calculatePoints(bet: Bet, match: Match): number {
    if (typeof match.homeScore !== 'number' || typeof match.awayScore !== 'number') {
      return 0;
    }

    const pointsSystem = bet.pool.points || { full: 25, partial: 12, result: 10, goal: 5 };

    const { homeScore, awayScore } = match;
    const { homeScoreBet, awayScoreBet } = bet;

    const matchWinner = homeScore > awayScore ? 'home' : awayScore > homeScore ? 'away' : 'draw';
    const betWinner = homeScoreBet > awayScoreBet ? 'home' : awayScoreBet > homeScoreBet ? 'away' : 'draw';

    if (homeScoreBet === homeScore && awayScoreBet === awayScore) {
      return pointsSystem.full;
    }
    if (betWinner === matchWinner && (homeScoreBet === homeScore || awayScoreBet === awayScore)) {
      return pointsSystem.partial;
    }
    if (betWinner === matchWinner) {
      return pointsSystem.result;
    }
    if (homeScoreBet === homeScore || awayScoreBet === awayScore) {
      return pointsSystem.goal;
    }

    return 0;
  }

  public async updateMatchesFromEspn(championshipApiFootballId: number, espnEvents: any[]): Promise<{ updated: number; notFound: number }> {
    const stats = { updated: 0, notFound: 0 };
    const updatedMatches: Match[] = [];

    const finishedStatuses = [MatchStatus.FINISHED, MatchStatus.POSTPONED, MatchStatus.CANCELLED];
    const updatableMatches = await this.matchRepository.find({
      where: {
        apiFootballId: championshipApiFootballId,
        status: Not(In(finishedStatuses)),
      }
    });

    if (updatableMatches.length === 0) {
      return { updated: 0, notFound: espnEvents.length };
    }

    const matchesMap = new Map<string, Match>();
    for (const match of updatableMatches) {
      const key = `${normalizeTeamName(match.homeTeamName)}:${normalizeTeamName(match.awayTeamName)}`;
      matchesMap.set(key, match);
    }

    for (const event of espnEvents) {
      const competition = event.competitions[0];
      if (!competition) continue;

      const homeCompetitor = competition.competitors.find((c: any) => c.homeAway === 'home');
      const awayCompetitor = competition.competitors.find((c: any) => c.homeAway === 'away');
      if (!homeCompetitor || !awayCompetitor) continue;

      const apiKey = `${normalizeTeamName(homeCompetitor.team.displayName)}:${normalizeTeamName(awayCompetitor.team.displayName)}`;
      const matchToUpdate = matchesMap.get(apiKey);

      if (matchToUpdate) {
        const espnStatusName = competition.status.type.name;
        const newStatus = this.getStatusFromEspnEvent(espnStatusName, competition.status.period);
        const homeScore = parseInt(homeCompetitor.score, 10) || 0;
        const awayScore = parseInt(awayCompetitor.score, 10) || 0;

        if (matchToUpdate.homeScore !== homeScore || matchToUpdate.awayScore !== awayScore || matchToUpdate.status !== newStatus) {
          matchToUpdate.homeScore = homeScore;
          matchToUpdate.awayScore = awayScore;
          matchToUpdate.status = newStatus;
          updatedMatches.push(matchToUpdate);
        }
      } else {
        stats.notFound++;
      }
    }

    stats.updated = updatedMatches.length;

    if (updatedMatches.length > 0) {
      await this.matchRepository.save(updatedMatches);

      const newlyFinishedMatches = updatedMatches.filter(match => match.status === MatchStatus.FINISHED);

      if (newlyFinishedMatches.length > 0) {
        await standingsService.recalculateStandings(championshipApiFootballId);

        const allBetsToUpdate: Bet[] = [];
        for (const finishedMatch of newlyFinishedMatches) {
          const betsForMatch = await this.betRepository.find({
            where: { match: { id: finishedMatch.id } },
            relations: ['pool'],
          });

          for (const bet of betsForMatch) {
            const points = this.calculatePoints(bet, finishedMatch);
            if (bet.pointsEarned !== points) {
              bet.pointsEarned = points;
              allBetsToUpdate.push(bet);
            }
          }
        }

        if (allBetsToUpdate.length > 0) {
          await this.betRepository.save(allBetsToUpdate);
        }
      }
    }

    return stats;
  }
}

export default new MatchService();
