import 'dotenv/config';
import { LessThanOrEqual, Not } from 'typeorm';
import { AppDataSource } from '../database/data-source.js';
import {
  CalendarType,
  Championship,
  ChampionshipType,
} from '../entities/championship.entity.js';
import { Match, MatchStatus } from '../entities/match.entity.js';
import ExternalAPIService, { IEspnEvent } from '../services/external-api.service.js';
import MatchService from '../modules/matches/matches.service.js';
import StandingsService from '../modules/standings/standings.service.js';

const WORLD_CUP_SLUG = 'fifa.world';
const WORLD_CUP_LOGO_URL = 'https://a.espncdn.com/i/leaguelogos/soccer/500/4.png';

const WORLD_CUP_RANGES: Record<string, { start: string; end: string }> = {
  '2022': { start: '2022-11-20', end: '2022-12-18' },
  '2026': { start: '2026-06-11', end: '2026-07-19' },
};

function getArgValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find(arg => arg.startsWith(prefix))?.slice(prefix.length);
}

function formatEspnDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function parseDateOnly(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

async function upsertWorldCup(): Promise<Championship> {
  const championshipRepository = AppDataSource.getRepository(Championship);
  let championship = await championshipRepository.findOneBy({ apiEspnSlug: WORLD_CUP_SLUG });

  if (!championship) {
    championship = championshipRepository.create({ apiEspnSlug: WORLD_CUP_SLUG });
  }

  championship.apiEspnId = championship.apiEspnId ?? null;
  championship.name = 'FIFA World Cup';
  championship.abbreviation = 'WC';
  championship.type = ChampionshipType.CUP;
  championship.calendar = CalendarType.EUROPEU;
  championship.logoUrl = championship.logoUrl || WORLD_CUP_LOGO_URL;

  return championshipRepository.save(championship);
}

async function fetchWorldCupEvents(startDate: Date, endDate: Date): Promise<IEspnEvent[]> {
  const eventsById = new Map<string, IEspnEvent>();

  for (
    const cursor = new Date(startDate);
    cursor <= endDate;
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  ) {
    const dateString = formatEspnDate(cursor);
    console.log(`  -> Buscando Copa do Mundo em ${dateString}`);

    const events = await ExternalAPIService.getMatchesByDateString(WORLD_CUP_SLUG, dateString);
    for (const event of events) {
      eventsById.set(event.id, event);
    }
  }

  return Array.from(eventsById.values());
}

async function seedWorldCup(): Promise<Championship> {
  const year = getArgValue('year') || process.env.WORLD_CUP_YEAR || '2026';
  const range = WORLD_CUP_RANGES[year];

  if (!range) {
    throw new Error(`Ano da Copa nao configurado: ${year}. Use --year=2022 ou --year=2026.`);
  }

  console.log(`Garantindo campeonato Copa do Mundo (${year})...`);
  const championship = await upsertWorldCup();

  console.log(`Importando jogos da Copa do Mundo de ${range.start} ate ${range.end}...`);
  const events = await fetchWorldCupEvents(parseDateOnly(range.start), parseDateOnly(range.end));

  if (events.length === 0) {
    console.log('  -> Nenhum jogo retornado pela ESPN para a Copa do Mundo.');
    return championship;
  }

  const { created, updated } = await MatchService.updateMatches(championship, events);
  console.log(`  -> Copa do Mundo: ${created} partidas criadas e ${updated} atualizadas.`);

  try {
    await StandingsService.updateStandings(championship.id);
    console.log('  -> Classificacao da Copa do Mundo atualizada.');
  } catch (error) {
    console.warn('  -> Classificacao da Copa do Mundo nao foi atualizada:', error);
  }

  return championship;
}

async function updatePastWorldCupMatches(championship: Championship): Promise<void> {
  console.log('Atualizando partidas ja vencidas da Copa do Mundo...');

  const matchRepository = AppDataSource.getRepository(Match);
  const outdatedMatches = await matchRepository.find({
    where: {
      championship: { id: championship.id },
      date: LessThanOrEqual(new Date()),
      status: Not(MatchStatus.FINAL),
    },
    relations: ['championship'],
  });

  if (outdatedMatches.length === 0) {
    console.log('  -> Nenhuma partida passada pendente da Copa encontrada.');
    return;
  }

  console.log(`  -> Encontradas ${outdatedMatches.length} partidas passadas da Copa para verificar.`);

  const requestsToMake = new Map<string, Date>();
  for (const match of outdatedMatches) {
    const dateString = match.date.toISOString().split('T')[0];
    requestsToMake.set(dateString, match.date);
  }

  let shouldUpdateStandings = false;

  for (const [dateString, date] of requestsToMake.entries()) {
    console.log(`  -> Buscando dados da Copa para ${dateString}`);
    const events = await ExternalAPIService.getMatchesByDate(WORLD_CUP_SLUG, date);

    if (events.length === 0) {
      console.log('     - Nenhum evento retornado.');
      continue;
    }

    const { updated, finishedChampionships } = await MatchService.updateMatchesFromCron(events);
    console.log(`     - ${updated} partidas atualizadas.`);
    shouldUpdateStandings ||= finishedChampionships.has(championship.id);
  }

  if (shouldUpdateStandings) {
    try {
      console.log('  -> Atualizando standings da Copa do Mundo');
      await StandingsService.updateStandings(championship.id);
    } catch (error) {
      console.error('     - Erro ao atualizar standings da Copa do Mundo:', error);
    }
  }
}

async function run() {
  try {
    AppDataSource.setOptions({ logging: false });
    await AppDataSource.initialize();
    console.log('Conexao com o banco estabelecida.');

    const championship = await seedWorldCup();
    await updatePastWorldCupMatches(championship);

    console.log('Script finalizado com sucesso.');
  } catch (error) {
    console.error('Erro critico ao executar script:', error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Conexao com o banco fechada.');
    }
  }
}

run();
