import { parentPort } from 'worker_threads';
import { AppDataSource } from '../database/data-source.js';
import ExternalApiService, { IEspnEvent } from '../services/external-api.service.js';
import MatchService from '../modules/matches/matches.service.js';
import { Championship } from '../entities/championship.entity.js';

async function runUpdateScoresJob() {
  try {
    console.log(`⏰ [WORKER-PLACAR] Executando sincronização de placares ao vivo...`);
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log(`[WORKER-PLACAR] Conexão com o banco de dados inicializada.`);
    }

    const championshipRepository = AppDataSource.getRepository(Championship);
    
    const allChampionships = await championshipRepository.find();
    if (allChampionships.length === 0) {
      console.log('[WORKER-PLACAR] Nenhum campeonato encontrado no DB. Encerrando.');
      return { message: 'Nenhum campeonato para monitorar.' };
    }
    const slugs = allChampionships.map(c => c.apiEspnSlug);
    console.log(`[WORKER-PLACAR] Monitorando ${slugs.length} campeonatos...`);

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const datesToFetch = [today, yesterday];
    const promises: Promise<IEspnEvent[]>[] = [];

    for (const slug of slugs) {
      for (const date of datesToFetch) {
        promises.push(ExternalApiService.getMatchesByDate(slug, date));
      }
    }
    
    const results = await Promise.allSettled(promises);

    const allEventsMap = new Map<string, IEspnEvent>();
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        for (const event of result.value) {
          allEventsMap.set(event.id, event);
        }
      } else if (result.status === 'rejected') {
        console.error(`[WORKER-PLACAR] Falha ao buscar dados da API:`, result.reason?.message);
      }
    });

    const uniqueEvents = Array.from(allEventsMap.values());

    if (uniqueEvents.length === 0) {
        console.log('[WORKER-PLACAR] Nenhum evento encontrado na API para as datas e campeonatos monitorados.');
        return { message: 'Nenhum evento encontrado.' };
    }

    console.log(`[WORKER-PLACAR] Total de ${uniqueEvents.length} eventos únicos encontrados na API. Sincronizando com o banco de dados...`);

    const updateResult = await MatchService.updateMatchesFromCron(uniqueEvents);
    
    return { finishedChampionships: [...updateResult.finishedChampionships] };
    
  } catch (error) {
    console.error('[WORKER-PLACAR] Erro catastrófico durante a execução:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log(`[WORKER-PLACAR] Conexão com o banco de dados fechada.`);
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