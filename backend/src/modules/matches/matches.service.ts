import { In, Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source.js';
import { Bet } from '../../entities/bet.entity.js';
import { Championship } from '../../entities/championship.entity.js';
import { HeadToHead } from '../../entities/h2h.entity.js';
import { Match, MatchStatus } from '../../entities/match.entity.js';
import { Pool } from '../../entities/pool.entity.js';
import { IEspnEvent } from '../../services/external-api.service.js';
import { formatInTimeZone } from 'date-fns-tz';

export interface IPointsSystem {
  full: number;
  partial: number;
  goal: number;
  result: number;
}

class MatchService {
  private matchRepository: Repository<Match>;
  private h2hRepository: Repository<HeadToHead>;
  private betRepository: Repository<Bet>;

  constructor() {
    this.matchRepository = AppDataSource.getRepository(Match);
    this.h2hRepository = AppDataSource.getRepository(HeadToHead);
    this.betRepository = AppDataSource.getRepository(Bet);
  }

  private addLocalTime(matches: Match[], timezone: string | undefined): any[] {
    const timeZone = timezone || 'UTC';
    return matches.map(match => ({
      ...match,
      localTime: formatInTimeZone(new Date(match.date), timeZone, 'HH:mm'),
    }));
  }

  public async getMatches(championshipId: number, userTimezone?: string): Promise<any[]> {
    const matches = await this.matchRepository.find({
      where: { championship: { id: championshipId } },
      order: { date: 'ASC' },
    });

    if (matches.length === 0) {
      return [];
    }

    const results = this.addLocalTime(matches, userTimezone);

    return results;
  }

  public async findByTeam(teamEspnId: number, userTimezone?: string): Promise<any[]> {
    const matches = await this.matchRepository.find({
      where: [
        { homeTeamEspnId: teamEspnId },
        { awayTeamEspnId: teamEspnId },
      ],
      order: { date: 'ASC' },
    });
    return this.addLocalTime(matches, userTimezone);
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

  public async updateMatchesFromCron(events: IEspnEvent[]): Promise<{ created: number; updated: number; finishedChampionships: Set<number> }> {
    let createdCount = 0;
    let updatedCount = 0;
    const finishedChampionships = new Set<number>();

    if (events.length === 0) {
      return { created: 0, updated: 0, finishedChampionships };
    }

    const eventIds = events.map(event => parseInt(event.id, 10));
    const existingMatches = await this.matchRepository.find({
      where: { apiEspnId: In(eventIds) },
      relations: ['championship'],
    });

    const matchesToSave: Match[] = [];
    const matchesToUpdateBets: Match[] = [];

    let inferredChampionship: Championship | null = existingMatches.length > 0 ? existingMatches[0].championship : null;

    for (const event of events) {
      const competition = event.competitions?.[0];
      if (!competition) continue;

      const homeTeam = competition.competitors.find(c => c.homeAway === 'home');
      const awayTeam = competition.competitors.find(c => c.homeAway === 'away');
      if (!homeTeam?.team?.id || !awayTeam?.team?.id) continue;

      let match = existingMatches.find(m => m.apiEspnId === parseInt(event.id, 10));
      let isNewMatch = false;

      if (!match) {
        if (!inferredChampionship) {
          console.warn(` -> Não foi possível inferir o campeonato para o novo evento ${event.id}. Pulando.`);
          continue;
        }
        isNewMatch = true;
        match = this.matchRepository.create();
        match.apiEspnId = parseInt(event.id, 10);
        match.championship = inferredChampionship;
        createdCount++;
      }

      const newStatus = this.mapEspnStatus(competition.status.type);

      console.log(newStatus)

      const homeScoreValue = homeTeam.score?.value ?? homeTeam.score;
      const awayScoreValue = awayTeam.score?.value ?? awayTeam.score;
      const newHomeScore = homeScoreValue != null ? parseInt(String(homeScoreValue), 10) : null;
      const newAwayScore = awayScoreValue != null ? parseInt(String(awayScoreValue), 10) : null;

      const apiDate = new Date(event.date);

      const hasChanged = isNewMatch ||
        match.status !== newStatus ||
        match.homeScore !== newHomeScore ||
        match.awayScore !== newAwayScore ||
        match.date.getTime() !== apiDate.getTime();

      if (hasChanged) {
        if (!isNewMatch) {
          updatedCount++;
        }

        match.date = apiDate;
        match.venueName = competition.venue?.fullName || null;
        match.venueCity = competition.venue?.address?.city || null;
        match.round = event.week?.text || null;
        match.homeTeamEspnId = parseInt(homeTeam.team.id, 10);
        match.homeTeamName = homeTeam.team.displayName;
        match.awayTeamEspnId = parseInt(awayTeam.team.id, 10);
        match.awayTeamName = awayTeam.team.displayName;
        match.homeTeamLogoUrl = `https://a.espncdn.com/i/teamlogos/soccer/500/${homeTeam.team.id}.png`;
        match.awayTeamLogoUrl = `https://a.espncdn.com/i/teamlogos/soccer/500/${awayTeam.team.id}.png`;
        match.status = newStatus;
        match.homeScore = newHomeScore;
        match.awayScore = newAwayScore;
        match.apiEspnStatusDetail = competition.status.type.detail;

        matchesToSave.push(match);

        if (newStatus === MatchStatus.FINAL) {
          finishedChampionships.add(match.championship.id);
          matchesToUpdateBets.push(match);
        }
      }
    }

    if (matchesToSave.length > 0) {
      await this.matchRepository.save(matchesToSave);
      console.log(` -> ${createdCount} partidas criadas e ${updatedCount} atualizadas no banco de dados.`);
    }

    for (const match of matchesToUpdateBets) {
      console.log(`  -> Jogo ${match.apiEspnId} [${match.championship.name}] finalizado. Acionando atualização de H2H e Apostas.`);
      await this.updateH2HForMatch(match);
      await this.updateBetsForFinishedMatch(match);
    }

    return { created: createdCount, updated: updatedCount, finishedChampionships };
  }

  public async updateBetsForFinishedMatch(match: Match): Promise<void> {
    if (match.status !== MatchStatus.FINAL || typeof match.homeScore !== 'number' || typeof match.awayScore !== 'number') {
      console.warn(`  -> Cálculo de pontos para o jogo ${match.id} ignorado: partida não está finalizada.`);
      return;
    }

    const bets = await this.betRepository.find({
      where: { match: { id: match.id } },
      relations: ['pool'],
    });

    if (bets.length === 0) {
      console.log(`  -> Nenhuma aposta encontrada para o jogo ${match.id}.`);
      return;
    }

    for (const bet of bets) {
      const points = this.calculatePoints(bet, match, bet.pool);
      bet.pointsEarned = points;
    }

    await this.betRepository.save(bets);
    console.log(`  -> Pontos calculados para ${bets.length} aposta(s) do jogo ${match.id}.`);
  }

  public async updateH2HForMatch(match: Match): Promise<void> {
    if (typeof match.homeScore !== 'number' || typeof match.awayScore !== 'number') {
      console.log(`  -> H2H para jogo ${match.apiEspnId} pulado: placar não finalizado.`);
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
      case 'STATUS_FINAL_AET':
      case 'STATUS_FULL_TIME':
        return MatchStatus.FINAL;
      case 'STATUS_FIRST_HALF':
      case 'STATUS_SECOND_HALF':
      case 'STATUS_HALFTIME':
      case 'HALFTIME':
      case 'STATUS_HALF_TIME':
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