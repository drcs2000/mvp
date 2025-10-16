import 'dotenv/config';
import { LessThan, Not } from 'typeorm';
import { AppDataSource } from '../database/data-source.js';
import { Match, MatchStatus } from '../entities/match.entity.js';
import ExternalAPIService from '../services/external-api.service.js';
import MatchService from '../modules/matches/matches.service.js';
import StandingsService from '../modules/standings/standings.service.js';

async function runUpdateScript() {
  console.log('🚀 Iniciando script de atualização de partidas passadas...');

  try {
    await AppDataSource.initialize();
    console.log('✅ Conexão com o banco de dados estabelecida.');

    console.log('🔍 Buscando partidas que já ocorreram e não foram finalizadas...');
    const outdatedMatches = await AppDataSource.getRepository(Match).find({
      where: {
        status: Not(MatchStatus.FINAL),
        date: LessThan(new Date()),
      },
      relations: ['championship'],
    });

    if (outdatedMatches.length === 0) {
      console.log('👍 Nenhuma partida desatualizada encontrada. Trabalho concluído!');
      return;
    }

    console.log(`[!] Encontradas ${outdatedMatches.length} partidas para atualizar.`);

    const requestsToMake = new Map<string, { date: Date, slug: string }>();
    for (const match of outdatedMatches) {
      if (match.championship?.apiEspnSlug) {
        const dateString = match.date.toISOString().split('T')[0];
        const key = `${match.championship.apiEspnSlug}:${dateString}`;
        if (!requestsToMake.has(key)) {
          requestsToMake.set(key, { date: match.date, slug: match.championship.apiEspnSlug });
        }
      }
    }

    const championshipsToUpdateStandings = new Set<number>();

    console.log(`🌐 Fazendo ${requestsToMake.size} requisições para a API da ESPN...`);

    for (const [key, request] of requestsToMake.entries()) {
      console.log(`  -> Buscando dados para: ${key}`);
      const events = await ExternalAPIService.getMatchesByDate(request.slug, request.date);

      if (events && events.length > 0) {
        const { updated, finishedChampionships } = await MatchService.updateMatchesFromCron(events);
        console.log(`     - ${updated} partidas atualizadas.`);
        finishedChampionships.forEach(id => championshipsToUpdateStandings.add(id));
      } else {
        console.log(`     - Nenhum evento retornado pela API para ${key}.`);
      }
    }

    if (championshipsToUpdateStandings.size > 0) {
      console.log(`📊 Atualizando a classificação de ${championshipsToUpdateStandings.size} campeonato(s)...`);
      for (const championshipId of championshipsToUpdateStandings) {
        try {
          console.log(`  -> Atualizando standings para o campeonato ID: ${championshipId}`);
          await StandingsService.updateStandings(championshipId);
          console.log(`     - Classificação do campeonato ${championshipId} atualizada com sucesso.`);
        } catch (error) {
          console.error(`     - Erro ao atualizar standings para o campeonato ID ${championshipId}:`, error);
        }
      }
    } else {
      console.log('ℹ️ Nenhuma classificação para atualizar, pois nenhum jogo foi finalizado nesta execução.');
    }

    console.log('🎉 Script concluído com sucesso!');

  } catch (error) {
    console.error('❌ Ocorreu um erro crítico durante a execução do script:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Conexão com o banco de dados fechada.');
    }
  }
}

runUpdateScript();