import { parentPort } from 'worker_threads';
import { AppDataSource } from '../database/data-source.js';
import ExternalApiService, { IEspnEvent } from '../services/external-api.service.js';
import MatchService from '../modules/matches/matches.service.js';
import { Championship } from '../entities/championship.entity.js';
import { Standings } from '../entities/standings.entity.js';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runFullSyncJob() {
  try {
    console.log(`⏰ [WORKER-SYNC] Iniciando sincronização completa da temporada...`);
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log(`[WORKER-SYNC] Conexão com o banco de dados inicializada.`);
    }

    const championshipRepository = AppDataSource.getRepository(Championship);
    const standingsRepository = AppDataSource.getRepository(Standings);
    
    const championships = await championshipRepository.find();
    if (championships.length === 0) {
      return { message: 'Nenhum campeonato encontrado para sincronizar.' };
    }
    console.log(`[WORKER-SYNC] Encontrados ${championships.length} campeonatos para processar.`);

    for (const championship of championships) {
      console.log(`\n--- Sincronizando ${championship.name} ---`);
      
      const teamsInStandings = await standingsRepository.find({
        where: { championship: { id: championship.id } },
      });
      
      if (!teamsInStandings || teamsInStandings.length === 0) {
        console.log(` -> Nenhum time encontrado na tabela de classificação para ${championship.name}. Pulando.`);
        continue;
      }
      console.log(` -> Encontrados ${teamsInStandings.length} times. Buscando calendários...`);
      
      const allEventsMap = new Map<string, IEspnEvent>();

      for (const team of teamsInStandings) {
        const teamScheduleEvents = await ExternalApiService.getScheduleForTeam(
          championship.apiEspnSlug,
          String(team.teamEspnId)
        );

        for (const event of teamScheduleEvents) {
          allEventsMap.set(event.id, event);
        }
        
        await sleep(250);
      }
      
      const uniqueEvents = Array.from(allEventsMap.values());
      
      if (uniqueEvents.length === 0) {
        console.log(` -> Nenhum evento encontrado na API para os times de ${championship.name}.`);
        continue;
      }
      console.log(` -> Encontrados ${uniqueEvents.length} eventos únicos para o campeonato.`);

      const { created, updated } = await MatchService.updateMatches(championship, uniqueEvents);

      console.log(` -> ${created} partidas criadas e ${updated} atualizadas.`);
    }

    return { message: 'Sincronização completa da temporada finalizada com sucesso.' };

  } catch (error) {
    console.error('[WORKER-SYNC] Erro catastrófico:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log(`[WORKER-SYNC] Conexão com o banco de dados fechada.`);
    }
  }
}

runFullSyncJob()
  .then(result => parentPort?.postMessage(result))
  .catch(error => parentPort?.postMessage({ error: error.message }));