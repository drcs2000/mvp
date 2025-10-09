import { parentPort } from 'worker_threads';
import { AppDataSource } from '../database/data-source.js';
import ExternalApiService, { IEspnEvent } from '../services/external-api.service.js';
import MatchService from '../modules/matches/matches.service.js';
import ChampionshipService from '../modules/championships/championships.service.js';

async function runUpdateScoresJob() {
  try {
    console.log(`⏰ [WORKER] Executando...`);
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log(`[WORKER] Conexão com o banco de dados inicializada.`);
    }

    const championships = await ChampionshipService.getAll();
    const slugs: string[] = championships.map(c => c.apiEspnSlug).filter(Boolean);

    if (slugs.length === 0) {
      return { message: 'Nenhum campeonato com slug encontrado no DB.' };
    }
    console.log(`[WORKER] Buscando jogos para ${slugs.length} campeonatos...`);

    const promises = slugs.map(slug => ExternalApiService.getTodaysMatches(slug));
    const results = await Promise.allSettled(promises);

    let allEvents: IEspnEvent[] = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allEvents = allEvents.concat(result.value);
      } else {
        console.error(`[WORKER] Falha ao buscar slug '${slugs[index]}':`, result.reason.message);
      }
    });

    if (allEvents.length === 0) {
      return { message: 'Nenhuma partida encontrada para os slugs monitorados.' };
    }

    const result = await MatchService.updateMatchesFromCron(allEvents);
    console.log(`[WORKER] ${result.updated} partidas foram atualizadas.`);
    
    return { finishedChampionships: [...result.finishedChampionships] };
    
  } catch (error) {
    console.error('[WORKER] Erro:', error);
    throw error;
  }
}

runUpdateScoresJob()
  .then(result => {
    parentPort?.postMessage(result);
  })
  .catch(error => {
    parentPort?.postMessage({ error: error.message });
  });