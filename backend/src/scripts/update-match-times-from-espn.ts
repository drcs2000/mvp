import 'dotenv/config';
import { AppDataSource } from '../database/data-source.js';
import { Championship } from '../entities/championship.entity.js';
import { Match } from '../entities/match.entity.js';
import ExternalAPIService, { IEspnEvent } from '../services/external-api.service.js';

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

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function getEspnTimestamp(eventDate: string): string | null {
  const match = eventDate.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}(?::\d{2})?)/);
  if (!match) return null;

  const seconds = match[2].length === 5 ? `${match[2]}:00` : match[2];
  return `${match[1]} ${seconds}`;
}

async function fetchEventsAroundDates(leagueSlug: string, dates: Date[]): Promise<Map<number, IEspnEvent>> {
  const datesToFetch = new Set<string>();
  const eventsById = new Map<number, IEspnEvent>();

  for (const date of dates) {
    datesToFetch.add(formatEspnDate(addDays(date, -1)));
    datesToFetch.add(formatEspnDate(date));
    datesToFetch.add(formatEspnDate(addDays(date, 1)));
  }

  for (const dateString of datesToFetch) {
    const events = await ExternalAPIService.getMatchesByDateString(leagueSlug, dateString);
    for (const event of events) {
      const eventId = parseInt(event.id, 10);
      if (Number.isFinite(eventId)) {
        eventsById.set(eventId, event);
      }
    }
  }

  return eventsById;
}

async function updateChampionshipTimes(championship: Championship): Promise<void> {
  const matchRepository = AppDataSource.getRepository(Match);
  const matches = await matchRepository.find({
    where: { championship: { id: championship.id } },
    order: { date: 'ASC' },
  });

  if (matches.length === 0) {
    console.log(` -> ${championship.name}: sem jogos no banco.`);
    return;
  }

  const uniqueDates = Array.from(
    new Map(matches.map(match => [formatEspnDate(match.date), match.date])).values(),
  );

  console.log(` -> ${championship.name}: ${matches.length} jogos, ${uniqueDates.length} datas base.`);
  const eventsById = await fetchEventsAroundDates(championship.apiEspnSlug, uniqueDates);

  let updated = 0;
  let missing = 0;

  for (const match of matches) {
    const event = eventsById.get(match.apiEspnId);
    const espnTimestamp = event ? getEspnTimestamp(event.date) : null;

    if (!espnTimestamp) {
      missing++;
      continue;
    }

    await matchRepository.query(
      'UPDATE "matches" SET "date" = $1::timestamp, "updated_at" = now() WHERE "id" = $2',
      [espnTimestamp, match.id],
    );
    updated++;
  }

  console.log(`    ${updated} horarios atualizados; ${missing} jogos nao encontrados na ESPN.`);
}

async function run() {
  const slug = getArgValue('slug');

  try {
    AppDataSource.setOptions({ logging: false });
    await AppDataSource.initialize();
    console.log('Conexao com o banco estabelecida.');

    const championshipRepository = AppDataSource.getRepository(Championship);
    const championships = slug
      ? await championshipRepository.find({ where: { apiEspnSlug: slug }, order: { name: 'ASC' } })
      : await championshipRepository.find({ order: { name: 'ASC' } });

    if (championships.length === 0) {
      throw new Error(slug ? `Campeonato nao encontrado: ${slug}` : 'Nenhum campeonato encontrado.');
    }

    for (const championship of championships) {
      await updateChampionshipTimes(championship);
    }

    console.log('Padronizacao de horarios finalizada.');
  } catch (error) {
    console.error('Erro ao padronizar horarios:', error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Conexao com o banco fechada.');
    }
  }
}

run();
