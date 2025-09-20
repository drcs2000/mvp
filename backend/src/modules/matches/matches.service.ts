import { AppDataSource } from '../../database/data-source';
import { Match, MatchStatus } from '../../entities/match.entity';
import { Bet } from '../../entities/bet.entity';
import { Head2Head } from '../../entities/h2h.entity';
import { Not, In } from 'typeorm';
import standingsService from '../standings/standings.service';
import ExternalAPIService from '../../services/external-api.service';
import { ExternalApiH2HMatch } from '../../types/api-sports.types';

function normalizeName(name: string | null | undefined): string {
  if (!name) {
    return '';
  }
  return name
    .toLowerCase()
    .normalize("NFD") // Remove acentos
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '') // Mantém apenas letras e números
    .trim();
}

class MatchService {
  private matchRepository = AppDataSource.getRepository(Match);
  private betRepository = AppDataSource.getRepository(Bet);
  private h2hRepository = AppDataSource.getRepository(Head2Head);

  private h2hCache = new Map<string, Head2Head>();

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
      case 'STATUS_FIRST_HALF':
        return MatchStatus.IN_PLAY_1ST_HALF;
      case 'STATUS_SECOND_HALF':
        return MatchStatus.IN_PLAY_2ND_HALF;
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

  public async updateMatchesFromEspn(
    championshipApiFootballId: number,
    espnEvents: any[]
  ): Promise<{ updated: number; notFound: number }> {
    const stats = { updated: 0, notFound: 0 };
    const updatedMatches: Match[] = [];
    const finishedStatuses = [MatchStatus.FINISHED, MatchStatus.POSTPONED, MatchStatus.CANCELLED];

    let updatableMatches = await this.matchRepository.find({
      where: {
        apiFootballId: championshipApiFootballId,
        status: Not(In(finishedStatuses)),
      }
    });

    if (updatableMatches.length === 0) {
      return { updated: 0, notFound: espnEvents.length };
    }

    for (const event of espnEvents) {
      const competition = event.competitions[0];
      if (!competition) continue;

      const homeCompetitor = competition.competitors.find((c: any) => c.homeAway === 'home');
      const awayCompetitor = competition.competitors.find((c: any) => c.homeAway === 'away');
      if (!homeCompetitor || !awayCompetitor) continue;

      const espnHomeName = normalizeName(homeCompetitor.team.displayName);
      const espnAwayName = normalizeName(awayCompetitor.team.displayName);

      let matchToUpdate = updatableMatches.find(match => {
        const dbHomeName = normalizeName(match.homeTeamName);
        const dbAwayName = normalizeName(match.awayTeamName);
        const homeMatch = dbHomeName.includes(espnHomeName) || espnHomeName.includes(dbHomeName);
        const awayMatch = dbAwayName.includes(espnAwayName) || espnAwayName.includes(dbAwayName);
        return homeMatch && awayMatch;
      });

      if (!matchToUpdate) {
        const espnStadium = normalizeName(competition?.venue?.fullName);
        const espnEventDate = new Date(competition.date);

        if (espnStadium) {
          matchToUpdate = updatableMatches.find(match => {
            const dbStadium = normalizeName(match.stadium);

            const isSameDay = match.date.getUTCFullYear() === espnEventDate.getUTCFullYear() &&
              match.date.getUTCMonth() === espnEventDate.getUTCMonth() &&
              match.date.getUTCDate() === espnEventDate.getUTCDate();

            const stadiumMatch = dbStadium && (dbStadium.includes(espnStadium) || espnStadium.includes(dbStadium));

            return isSameDay && stadiumMatch;
          });
        }
      }

      if (matchToUpdate) {
        updatableMatches = updatableMatches.filter(match => match.id !== matchToUpdate.id);

        const newDate = new Date(competition.date);
        const espnStatusName = competition.status.type.name;
        const newStatus = this.getStatusFromEspnEvent(espnStatusName, competition.status.period);
        const homeScore = parseInt(homeCompetitor.score, 10) || 0;
        const awayScore = parseInt(awayCompetitor.score, 10) || 0;
        const hasDateChanged = matchToUpdate.date.getTime() !== newDate.getTime();

        if (
          matchToUpdate.homeScore !== homeScore ||
          matchToUpdate.awayScore !== awayScore ||
          matchToUpdate.status !== newStatus ||
          hasDateChanged
        ) {
          matchToUpdate.homeScore = homeScore;
          matchToUpdate.awayScore = awayScore;
          matchToUpdate.status = newStatus;
          if (hasDateChanged) {
            matchToUpdate.date = newDate;
          }
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
        const referenceMatch = newlyFinishedMatches[0];
        const roundBaseName = referenceMatch.round.split(' - ')[0];
        await standingsService.recalculateStandings(championshipApiFootballId, roundBaseName);

        const allBetsToUpdate: Bet[] = [];
        for (const finishedMatch of newlyFinishedMatches) {
          if (finishedMatch.homeTeamApiId && finishedMatch.awayTeamApiId) {
            console.log(`Atualizando H2H para a partida: ${finishedMatch.homeTeamName} vs ${finishedMatch.awayTeamName}`);
            const newH2HMatchEntry: Partial<Match> = {
              apiFootballFixtureId: finishedMatch.apiFootballFixtureId,
              date: finishedMatch.date,
              stadium: finishedMatch.stadium,
              homeTeamApiId: finishedMatch.homeTeamApiId,
              homeTeamName: finishedMatch.homeTeamName,
              homeTeamLogoUrl: finishedMatch.homeTeamLogoUrl,
              awayTeamApiId: finishedMatch.awayTeamApiId,
              awayTeamName: finishedMatch.awayTeamName,
              awayTeamLogoUrl: finishedMatch.awayTeamLogoUrl,
              homeScore: finishedMatch.homeScore,
              awayScore: finishedMatch.awayScore,
              status: finishedMatch.status,
              round: finishedMatch.round
            };
            await this.addMatchToH2H(
              finishedMatch.homeTeamApiId,
              finishedMatch.awayTeamApiId,
              newH2HMatchEntry
            );
          }

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

  public async getLastGamesByTeamIds(championshipId: number, teamIds: number[], limit: number = 5): Promise<{ [key: number]: Match[] }> {
    const gamesByTeam: { [key: number]: Match[] } = {};
    for (const teamId of teamIds) {
      let games: Match[] = [];
      games = await this.matchRepository.find({
        where: [
          { homeTeamApiId: teamId, apiFootballId: championshipId, status: MatchStatus.FINISHED },
          { awayTeamApiId: teamId, apiFootballId: championshipId, status: MatchStatus.FINISHED },
        ],
        order: { date: 'DESC' },
        take: limit,
      });
      if (games.length < limit) {
        const remainingLimit = limit - games.length;
        const generalGames = await this.matchRepository.find({
          where: [
            { homeTeamApiId: teamId, status: MatchStatus.FINISHED },
            { awayTeamApiId: teamId, status: MatchStatus.FINISHED },
          ],
          order: { date: 'DESC' },
          take: remainingLimit,
        });
        const existingGameIds = new Set(games.map(g => g.id));
        const newGames = generalGames.filter(g => !existingGameIds.has(g.id));
        games = [...games, ...newGames];
      }
      gamesByTeam[teamId] = games;
    }
    return gamesByTeam;
  }

  public async findH2H(team1Id: number, team2Id: number): Promise<Head2Head | null> {
    const cacheKey = [team1Id, team2Id].sort((a, b) => a - b).join(':');

    if (this.h2hCache.has(cacheKey)) {
      return this.h2hCache.get(cacheKey)!;
    }

    let h2hData = await this.h2hRepository.findOne({
      where: [
        { team1Id, team2Id },
        { team1Id: team2Id, team2Id: team1Id },
      ],
    });

    if (!h2hData) {
      try {
        const externalApiMatches = await ExternalAPIService.getH2H(team1Id, team2Id);

        const formattedMatches = (externalApiMatches as ExternalApiH2HMatch[]).map((match) => {
          const newMatch = new Match();
          newMatch.apiFootballFixtureId = match.fixture.id;
          newMatch.date = new Date(match.fixture.date);
          newMatch.stadium = match.fixture.venue.name;
          newMatch.homeTeamApiId = match.teams.home.id;
          newMatch.homeTeamName = match.teams.home.name;
          newMatch.homeTeamLogoUrl = match.teams.home.logo;
          newMatch.awayTeamApiId = match.teams.away.id;
          newMatch.awayTeamName = match.teams.away.name;
          newMatch.awayTeamLogoUrl = match.teams.away.logo;
          newMatch.homeScore = match.goals.home;
          newMatch.awayScore = match.goals.away;
          newMatch.status = match.fixture.status.short as MatchStatus;
          newMatch.round = match.league.round;
          return newMatch;
        });

        h2hData = this.h2hRepository.create({
          team1Id: team1Id,
          team2Id: team2Id,
          matches: formattedMatches,
          lastUpdated: new Date(),
        });

        await this.h2hRepository.save(h2hData);
        this.h2hCache.set(cacheKey, h2hData);

      } catch (error) {
        console.error("Falha ao buscar H2H da API externa:", error);
        return null;
      }
    }

    return h2hData;
  }

  public async addMatchToH2H(team1Id: number, team2Id: number, newMatchData: Partial<Match>): Promise<Head2Head | null> {
    const h2hRecord = await this.h2hRepository.findOne({
      where: [
        { team1Id, team2Id },
        { team1Id: team2Id, team2Id: team1Id },
      ],
    });

    if (!h2hRecord) {
      return null;
    }

    h2hRecord.matches.unshift(newMatchData as Match);
    h2hRecord.lastUpdated = new Date();

    const updatedRecord = await this.h2hRepository.save(h2hRecord);

    const cacheKey = [team1Id, team2Id].sort((a, b) => a - b).join(':');
    this.h2hCache.delete(cacheKey);

    return updatedRecord;
  }
}

export default new MatchService();