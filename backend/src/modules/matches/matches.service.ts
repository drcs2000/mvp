import { In, Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source.js';
import { Bet } from '../../entities/bet.entity.js';
import { Championship } from '../../entities/championship.entity.js';
import { HeadToHead, IH2HMatch, IH2HSummary } from '../../entities/h2h.entity.js';
import { Match, MatchStatus } from '../../entities/match.entity.js';
import { Pool } from '../../entities/pool.entity.js';
import { IEspnEvent } from '../../services/external-api.service.js';

export interface IPointsSystem {
  full: number;
  partial: number;
  goal: number;
  result: number;
}

class MatchService {
  private matchRepository: Repository<Match>;
  private h2hRepository: Repository<HeadToHead>;

  constructor() {
    this.matchRepository = AppDataSource.getRepository(Match);
    this.h2hRepository = AppDataSource.getRepository(HeadToHead);
  }

  public async getMatches(championshipId: number): Promise<Match[]> {
    return this.matchRepository.find({
      where: { championship: { id: championshipId } },
      order: { date: 'ASC' },
    });
  }

  public async findByTeam(teamEspnId: number): Promise<Match[]> {
    return this.matchRepository.find({
      where: [
        { homeTeamEspnId: teamEspnId },
        { awayTeamEspnId: teamEspnId },
      ],
      order: { date: 'ASC' },
    });
  }

  public async getLastGamesByTeams(teamIds: number[], limit: number = 5): Promise<{ [key: number]: Match[] }> {
    const gamesByTeam: { [key: number]: Match[] } = {};
    for (const teamId of teamIds) {
      const games = await this.matchRepository.find({
        where: [
          { homeTeamEspnId: teamId, status: MatchStatus.FINAL },
          { awayTeamEspnId: teamId, status: MatchStatus.FINAL },
        ],
        order: { date: 'DESC' },
        take: limit,
      });
      gamesByTeam[teamId] = games;
    }
    return gamesByTeam;
  }

  public async getH2H(team1EspnId: number, team2EspnId: number): Promise<HeadToHead | null> {
    const ids = [team1EspnId, team2EspnId].sort((a, b) => a - b);
    const [id1, id2] = ids;

    return this.h2hRepository.findOneBy({ team1EspnId: id1, team2EspnId: id2 });
  }

  public async updateMatches(championship: Championship, events: IEspnEvent[]): Promise<{ created: number, updated: number }> {
    let createdCount = 0;
    let updatedCount = 0;

    for (const event of events) {
      try {
        if (!event.competitions || event.competitions.length === 0) continue;
        const competition = event.competitions[0];
        const homeTeam = competition.competitors.find((c: any) => c.homeAway === 'home');
        const awayTeam = competition.competitors.find((c: any) => c.homeAway === 'away');
        if (!homeTeam?.team?.id || !awayTeam?.team?.id) continue;

        let match = await this.matchRepository.findOneBy({ apiEspnId: parseInt(event.id, 10) });
        if (!match) {
          match = this.matchRepository.create();
          createdCount++;
        } else {
          updatedCount++;
        }

        match.championship = championship;
        match.apiEspnId = parseInt(event.id, 10);
        match.date = new Date(event.date);
        match.venueName = competition.venue?.fullName || null;
        match.venueCity = competition.venue?.address?.city || null;
        match.round = event.week?.text || null;
        match.homeTeamEspnId = parseInt(homeTeam.team.id, 10);
        match.homeTeamName = homeTeam.team.displayName;
        match.awayTeamEspnId = parseInt(awayTeam.team.id, 10);
        match.awayTeamName = awayTeam.team.displayName;
        match.homeTeamLogoUrl = `https://a.espncdn.com/i/teamlogos/soccer/500/${homeTeam.team.id}.png`;
        match.awayTeamLogoUrl = `https://a.espncdn.com/i/teamlogos/soccer/500/${awayTeam.team.id}.png`;

        const homeScoreValue = homeTeam.score?.value ?? homeTeam.score;
        const awayScoreValue = awayTeam.score?.value ?? awayTeam.score;
        match.homeScore = homeScoreValue != null ? parseInt(String(homeScoreValue), 10) : null;
        match.awayScore = awayScoreValue != null ? parseInt(String(awayScoreValue), 10) : null;

        match.status = this.mapEspnStatus(competition.status.type);
        match.apiEspnStatusDetail = competition.status.type.detail;

        await this.matchRepository.save(match);
      } catch (error) {
        console.error(`Falha ao processar evento ${event.id}:`, error);
      }
    }
    return { created: createdCount, updated: updatedCount };
  }

  public calculatePoints(bet: Bet, match: Match, pool: Pool): number {
    if (typeof match.homeScore !== 'number' || typeof match.awayScore !== 'number') {
      return 0;
    }
    const pointsSystem = pool.points;
    const { homeScore, awayScore } = match;
    const { homeScoreBet, awayScoreBet } = bet;

    if (homeScoreBet === homeScore && awayScoreBet === awayScore) {
      return pointsSystem.full;
    }

    const matchWinner = homeScore > awayScore ? 'home' : awayScore > homeScore ? 'away' : 'draw';
    const betWinner = homeScoreBet > awayScoreBet ? 'home' : awayScoreBet > homeScoreBet ? 'away' : 'draw';

    if (betWinner === matchWinner) {
      if (homeScoreBet === homeScore || awayScoreBet === awayScore) {
        return pointsSystem.partial;
      }
      return pointsSystem.result;
    }

    if (homeScoreBet === homeScore || awayScoreBet === awayScore) {
      return pointsSystem.goal;
    }

    return 0;
  }

  public async updateMatchesFromCron(events: IEspnEvent[]): Promise<{ updated: number; finishedChampionships: Set<number> }> {
    let updatedCount = 0;
    const finishedChampionships = new Set<number>();

    if (events.length === 0) {
      return { updated: 0, finishedChampionships };
    }

    const eventIds = events.map(event => parseInt(event.id, 10));
    const existingMatches = await this.matchRepository.find({
      where: { apiEspnId: In(eventIds) },
      relations: ['championship'],
    });

    const matchesToSave: Match[] = [];

    for (const event of events) {
      const match = existingMatches.find(m => m.apiEspnId === parseInt(event.id, 10));
      if (!match) continue;

      const competition = event.competitions?.[0];
      if (!competition) continue;

      const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
      const awayTeam = competition.competitors.find(c => c.homeAway === 'away');
      if (!homeTeam || !awayTeam) continue;

      const newStatus = this.mapEspnStatus(competition.status.type);
      const homeScoreValue = homeTeam.score?.value ?? homeTeam.score;
      const awayScoreValue = awayTeam.score?.value ?? awayTeam.score;
      const newHomeScore = homeScoreValue != null ? parseInt(String(homeScoreValue), 10) : null;
      const newAwayScore = awayScoreValue != null ? parseInt(String(awayScoreValue), 10) : null;

      const wasFinished = match.status === MatchStatus.FINAL;
      const hasChanged = match.status !== newStatus || match.homeScore !== newHomeScore || match.awayScore !== newAwayScore;

      if (hasChanged) {
        match.status = newStatus;
        match.homeScore = newHomeScore;
        match.awayScore = newAwayScore;
        match.apiEspnStatusDetail = competition.status.type.detail;
        matchesToSave.push(match);
        updatedCount++;

        if (newStatus === MatchStatus.FINAL && !wasFinished) {
          finishedChampionships.add(match.championship.id);
          console.log(`  -> Jogo ${match.apiEspnId} [${match.championship.name}] finalizado. Acionando atualização de H2H e Standings.`);
          await this.updateH2HForMatch(match);
        }
      }
    }

    if (matchesToSave.length > 0) {
      await this.matchRepository.save(matchesToSave);
    }

    return { updated: updatedCount, finishedChampionships };
  }

  public async updateH2HForMatch(match: Match): Promise<void> {
    if (typeof match.homeScore !== 'number' || typeof match.awayScore !== 'number') {
      console.log(`  -> H2H para jogo ${match.apiEspnId} pulado: placar não finalizado.`);
      return;
    }

    const ids = [match.homeTeamEspnId, match.awayTeamEspnId].sort((a, b) => a - b);
    const [id1, id2] = ids;

    let h2h = await this.getH2H(id1, id2);

    if (!h2h) {
      h2h = this.h2hRepository.create({
        team1EspnId: id1,
        team2EspnId: id2,
        matches: [],
        summary: { team1Wins: 0, team2Wins: 0, draws: 0, totalMatches: 0 }
      });
    }

    const matchAlreadyExists = h2h.matches.some(m => m.apiEspnId === match.apiEspnId);

    if (!matchAlreadyExists) {
      h2h.matches.push({
        apiEspnId: match.apiEspnId,
        date: match.date.toISOString(),
        homeTeamEspnId: match.homeTeamEspnId,
        awayTeamEspnId: match.awayTeamEspnId,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        venue: match.venueName,
      });

      h2h.summary.totalMatches++;
      const homeId = match.homeTeamEspnId;
      const awayId = match.awayTeamEspnId;

      if (match.homeScore > match.awayScore) {
        if (homeId === id1) h2h.summary.team1Wins++;
        else h2h.summary.team2Wins++;
      } else if (match.awayScore > match.homeScore) {
        if (awayId === id1) h2h.summary.team1Wins++;
        else h2h.summary.team2Wins++;
      } else {
        h2h.summary.draws++;
      }

      await this.h2hRepository.save(h2h);
    }
  }

  private mapEspnStatus(status: { name: string; detail: string }): MatchStatus {
    switch (status.name) {
      case 'STATUS_FINAL':
      case 'STATUS_FINAL_PEN':
      case 'STATUS_FULL_TIME':
        return MatchStatus.FINAL;
      case 'STATUS_FIRST_HALF':
      case 'STATUS_SECOND_HALF':
      case 'STATUS_IN_PROGRESS':
        return MatchStatus.IN_PROGRESS;
      case 'STATUS_SCHEDULED':
        return MatchStatus.SCHEDULED;
      case 'STATUS_POSTPONED':
        return MatchStatus.POSTPONED;
      case 'STATUS_CANCELED':
        return MatchStatus.CANCELED;
      default:
        return MatchStatus.SCHEDULED;
    }
  }
}

export default new MatchService();