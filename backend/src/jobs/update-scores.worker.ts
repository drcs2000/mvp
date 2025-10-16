import { parentPort } from 'worker_threads';
import { AppDataSource } from '../database/data-source.js';
import ExternalApiService, { IEspnEvent } from '../services/external-api.service.js';
import MatchService from '../modules/matches/matches.service.js';
import { In, LessThan } from 'typeorm';
import { Match, MatchStatus } from '../entities/match.entity.js';

async function runUpdateScoresJob() {
  try {
    console.log(`⏰ [WORKER] Executando atualização de placares...`);
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log(`[WORKER] Conexão com o banco de dados inicializada.`);
    }

    const matchRepository = AppDataSource.getRepository(Match);

    const relevantMatches = await matchRepository.find({
      where: [
        { status: In([MatchStatus.IN_PROGRESS, MatchStatus.HALFTIME]) },
        { status: MatchStatus.SCHEDULED, date: LessThan(new Date()) },
      ],
      relations: ['championship'],
    });

    if (relevantMatches.length === 0) {
      console.log('[WORKER] Nenhum jogo ativo ou recém-iniciado encontrado para atualizar.');
      return { message: 'Nenhuma partida ativa encontrada.' };
    }

    const activeSlugs = [...new Set(relevantMatches.map(match => match.championship.apiEspnSlug).filter(Boolean))];

    if (activeSlugs.length === 0) {
      console.log('[WORKER] Jogos relevantes encontrados, mas nenhum tem slug de campeonato associado.');
      return { message: 'Nenhum slug de campeonato para jogos ativos.' };
    }

    console.log(`[WORKER] Encontrados ${relevantMatches.length} jogos potencialmente ativos em ${activeSlugs.length} campeonatos. Buscando dados...`);

    const promises = activeSlugs.map(slug => ExternalApiService.getTodaysMatches(slug));
    const results = await Promise.allSettled(promises);

    let allEvents: IEspnEvent[] = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        allEvents.push(...result.value);
      } else if (result.status === 'rejected') {
        console.error(`[WORKER] Falha ao buscar dados para o slug '${activeSlugs[index]}':`, result.reason?.message);
      }
    });

    if (allEvents.length === 0) {
      console.warn('[WORKER] Nenhuma informação pôde ser buscada da API externa para os slugs ativos.');
      return { message: 'Não foi possível buscar dados ao vivo.' };
    }

    const updateResult = await MatchService.updateMatchesFromCron(allEvents);
    console.log(`[WORKER] ${updateResult.created} partidas criadas e ${updateResult.updated} atualizadas.`);

    return { finishedChampionships: [...updateResult.finishedChampionships] };

  } catch (error) {
    console.error('[WORKER] Erro catastrófico durante a execução:', error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log(`[WORKER] Conexão com o banco de dados fechada.`);
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