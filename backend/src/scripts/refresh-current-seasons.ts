import 'dotenv/config';
import { In, LessThan, Not } from 'typeorm';
import { AppDataSource } from '../database/data-source.js';
import { CalendarType, Championship } from '../entities/championship.entity.js';
import { Match } from '../entities/match.entity.js';
import { Standings } from '../entities/standings.entity.js';
import MatchService from '../modules/matches/matches.service.js';
import StandingsService from '../modules/standings/standings.service.js';
import ExternalAPIService, { IEspnEvent } from '../services/external-api.service.js';

const TEAM_SCHEDULE_CONCURRENCY = 6;

function eventDate(event: IEspnEvent): Date {
  return new Date(event.date);
}

function getCurrentSeasonYear(championship: Championship): number {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  if (championship.calendar === CalendarType.EUROPEU) {
    return month >= 7 ? year : year - 1;
  }

  return year;
}

function getDominantEventSeason(events: IEspnEvent[]): number | null {
  const counts = new Map<number, number>();

  for (const event of events) {
    if (!event.season?.year) continue;
    counts.set(event.season.year, (counts.get(event.season.year) || 0) + 1);
  }

  let dominantSeason: number | null = null;
  let dominantCount = 0;

  for (const [season, count] of counts.entries()) {
    if (count > dominantCount || (count === dominantCount && season > (dominantSeason || 0))) {
      dominantSeason = season;
      dominantCount = count;
    }
  }

  return dominantSeason;
}

function shouldReplaceChampionshipMatches(championship: Championship, events: IEspnEvent[]): boolean {
  if (events.length === 0) return false;

  const now = new Date();
  const hasFutureGames = events.some(event => eventDate(event) >= now);
  const dominantSeason = getDominantEventSeason(events);
  const currentSeason = getCurrentSeasonYear(championship);

  if (championship.calendar === CalendarType.BRASILEIRO) {
    return hasFutureGames && (dominantSeason === null || dominantSeason >= currentSeason);
  }

  return hasFutureGames && dominantSeason !== null && dominantSeason >= currentSeason;
}

async function collectScheduleEvents(championship: Championship): Promise<IEspnEvent[]> {
  const standingsRepository = AppDataSource.getRepository(Standings);

  try {
    await StandingsService.updateStandings(championship.id);
    console.log('  -> Standings atualizados.');
  } catch (error) {
    console.warn('  -> Nao consegui atualizar standings, usando times ja salvos:', error);
  }

  const teams = await standingsRepository.find({
    where: { championship: { id: championship.id } },
  });

  if (teams.length === 0) {
    console.log('  -> Nenhum time em standings. Sem calendario para montar.');
    return [];
  }

  const eventsById = new Map<string, IEspnEvent>();

  for (let index = 0; index < teams.length; index += TEAM_SCHEDULE_CONCURRENCY) {
    const batch = teams.slice(index, index + TEAM_SCHEDULE_CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(team => ExternalAPIService.getScheduleForTeam(
        championship.apiEspnSlug,
        String(team.teamEspnId),
      )),
    );

    for (const teamEvents of batchResults) {
      for (const event of teamEvents) {
        eventsById.set(event.id, event);
      }
    }
  }

  return Array.from(eventsById.values()).sort((a, b) => eventDate(a).getTime() - eventDate(b).getTime());
}

async function replaceWithCurrentCalendar(championship: Championship, events: IEspnEvent[]): Promise<void> {
  const matchRepository = AppDataSource.getRepository(Match);
  const eventIds = events.map(event => parseInt(event.id, 10)).filter(Number.isFinite);

  if (eventIds.length === 0) {
    console.log('  -> Calendario retornou eventos sem IDs validos. Pulando limpeza.');
    return;
  }

  const deleteResult = await matchRepository.delete({
    championship: { id: championship.id },
    apiEspnId: Not(In(eventIds)),
    date: LessThan(new Date()),
  });

  const { created, updated } = await MatchService.updateMatchesFromCron(events, championship);
  console.log(`  -> Removidas ${deleteResult.affected || 0} partidas antigas.`);
  console.log(`  -> ${created} partidas criadas e ${updated} atualizadas.`);
}

async function updateExistingMatchesFromFetchedEvents(championship: Championship, events: IEspnEvent[]): Promise<void> {
  const matchRepository = AppDataSource.getRepository(Match);
  const eventIds = events.map(event => parseInt(event.id, 10)).filter(Number.isFinite);

  if (eventIds.length === 0) {
    console.log('  -> Sem eventos da ESPN para atualizar jogos existentes.');
    return;
  }

  const existingMatches = await matchRepository.find({
    select: { apiEspnId: true },
    where: {
      championship: { id: championship.id },
      apiEspnId: In(eventIds),
    },
  });

  const existingApiIds = new Set(existingMatches.map(match => match.apiEspnId));
  const eventsForExistingMatches = events.filter(event => existingApiIds.has(parseInt(event.id, 10)));

  if (eventsForExistingMatches.length === 0) {
    console.log('  -> Nenhum evento retornado corresponde a jogos ja existentes.');
    return;
  }

  const { updated, finishedChampionships } = await MatchService.updateMatchesFromCron(eventsForExistingMatches);
  console.log(`  -> ${updated} partidas existentes atualizadas.`);

  if (!finishedChampionships.has(championship.id)) {
    return;
  }

  try {
    await StandingsService.updateStandings(championship.id);
    console.log('  -> Standings atualizados apos jogos finalizados.');
  } catch (error) {
    console.error('  -> Erro ao atualizar standings apos jogos finalizados:', error);
  }
}

async function refreshChampionship(championship: Championship): Promise<void> {
  console.log(`\n=== ${championship.name} (${championship.apiEspnSlug}) ===`);

  const events = await collectScheduleEvents(championship);
  const dominantSeason = getDominantEventSeason(events);
  console.log(`  -> ESPN retornou ${events.length} eventos. Temporada detectada: ${dominantSeason ?? 'desconhecida'}.`);

  if (shouldReplaceChampionshipMatches(championship, events)) {
    console.log('  -> Calendario vigente/futuro encontrado. Limpando temporadas antigas deste campeonato.');
    await replaceWithCurrentCalendar(championship, events);
    return;
  }

  console.log('  -> Nao encontrei calendario novo/futuro confiavel. Vou apenas atualizar jogos existentes.');
  await updateExistingMatchesFromFetchedEvents(championship, events);
}

async function run() {
  try {
    AppDataSource.setOptions({ logging: false });
    await AppDataSource.initialize();
    console.log('Conexao com o banco estabelecida.');

    const championships = await AppDataSource.getRepository(Championship).find({
      order: { name: 'ASC' },
    });

    console.log(`Encontrados ${championships.length} campeonatos no banco.`);

    for (const championship of championships) {
      await refreshChampionship(championship);
    }

    console.log('\nScript finalizado com sucesso.');
  } catch (error) {
    console.error('Erro critico ao atualizar temporadas:', error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Conexao com o banco fechada.');
    }
  }
}

run();
