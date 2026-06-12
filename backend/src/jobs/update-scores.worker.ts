import { parentPort } from 'worker_threads';
import { formatInTimeZone } from 'date-fns-tz';
import { AppDataSource } from '../database/data-source.js';
import { Championship } from '../entities/championship.entity.js';
import MatchService from '../modules/matches/matches.service.js';
import ExternalApiService, { IEspnEvent } from '../services/external-api.service.js';

const SCOREBOARD_TIMEZONE = 'America/Sao_Paulo';

async function runUpdateScoresJob() {
  try {
    console.log('[WORKER-PLACAR] Executando sincronizacao de placares ao vivo...');
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('[WORKER-PLACAR] Conexao com o banco de dados inicializada.');
    }

    const championshipRepository = AppDataSource.getRepository(Championship);
    const allChampionships = await championshipRepository.find();

    if (allChampionships.length === 0) {
      console.log('[WORKER-PLACAR] Nenhum campeonato encontrado no DB. Encerrando.');
      return { message: 'Nenhum campeonato para monitorar.' };
    }

    console.log(`[WORKER-PLACAR] Monitorando ${allChampionships.length} campeonatos...`);

    const now = Date.now();
    const dateStrings = [-1, 0, 1].map(offset =>
      formatInTimeZone(
        new Date(now + offset * 24 * 60 * 60 * 1000),
        SCOREBOARD_TIMEZONE,
        'yyyyMMdd',
      ),
    );
    const fetchTasks: { championship: Championship; promise: Promise<IEspnEvent[]> }[] = [];

    for (const championship of allChampionships) {
      for (const dateString of dateStrings) {
        fetchTasks.push({
          championship,
          promise: ExternalApiService.getMatchesByDateString(championship.apiEspnSlug, dateString),
        });
      }
    }

    const results = await Promise.allSettled(fetchTasks.map(task => task.promise));
    const eventsByChampionship = new Map<number, Map<string, IEspnEvent>>();

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const championshipId = fetchTasks[index].championship.id;
        const championshipEvents = eventsByChampionship.get(championshipId) || new Map<string, IEspnEvent>();

        for (const event of result.value) {
          championshipEvents.set(event.id, event);
        }
        eventsByChampionship.set(championshipId, championshipEvents);
      } else if (result.status === 'rejected') {
        console.error('[WORKER-PLACAR] Falha ao buscar dados da API:', result.reason?.message);
      }
    });

    const totalEvents = Array.from(eventsByChampionship.values())
      .reduce((total, events) => total + events.size, 0);

    if (totalEvents === 0) {
      console.log('[WORKER-PLACAR] Nenhum evento encontrado na API para as datas e campeonatos monitorados.');
      return { message: 'Nenhum evento encontrado.' };
    }

    console.log(`[WORKER-PLACAR] Total de ${totalEvents} eventos unicos encontrados na API. Sincronizando com o banco de dados...`);

    const finishedChampionships = new Set<number>();
    for (const championship of allChampionships) {
      const events = Array.from(eventsByChampionship.get(championship.id)?.values() || []);
      if (events.length === 0) continue;

      const updateResult = await MatchService.updateMatchesFromCron(events, championship);
      updateResult.finishedChampionships.forEach(id => finishedChampionships.add(id));
    }

    const repairedBets = await MatchService.syncUnscoredFinishedBets();
    console.log(`[WORKER-PLACAR] ${repairedBets} aposta(s) finalizada(s) sem pontos foram reparadas.`);

    return { finishedChampionships: [...finishedChampionships] };
  } catch (error) {
    console.error('[WORKER-PLACAR] Erro catastrofico durante a execucao:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('[WORKER-PLACAR] Conexao com o banco de dados fechada.');
    }
  }
}

runUpdateScoresJob()
  .then(result => {
    parentPort?.postMessage(result);
  })
  .catch(error => {
    parentPort?.postMessage({ error: error.message });
  });
