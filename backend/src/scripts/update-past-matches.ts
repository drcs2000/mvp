import 'dotenv/config';
import { LessThan, Not } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Match, MatchStatus } from '../entities/match.entity';
import ExternalAPIService from '../services/external-api.service';
import MatchService from '../modules/matches/matches.service';
import StandingsService from '../modules/standings/standings.service';

/**
 * Script para encontrar e atualizar partidas no banco de dados que já ocorreram
 * mas não estão com o status 'FINAL', e depois atualizar a tabela de classificação
 * dos campeonatos afetados.
 */
async function runUpdateScript() {
  console.log('🚀 Iniciando script de atualização de partidas passadas...');

  try {
    // 1. Inicializa a conexão com o banco de dados
    await AppDataSource.initialize();
    console.log('✅ Conexão com o banco de dados estabelecida.');

    // 2. Busca por partidas desatualizadas
    console.log('🔍 Buscando partidas que já ocorreram e não foram finalizadas...');
    const outdatedMatches = await AppDataSource.getRepository(Match).find({
      where: {
        status: Not(MatchStatus.FINAL), // Status diferente de FINAL
        date: LessThan(new Date()),      // Data anterior a hoje
      },
      relations: ['championship'], // Carrega a relação com o campeonato para pegar o slug
    });

    if (outdatedMatches.length === 0) {
      console.log('👍 Nenhuma partida desatualizada encontrada. Trabalho concluído!');
      return;
    }

    console.log(`[!] Encontradas ${outdatedMatches.length} partidas para atualizar.`);

    // 3. Agrupa as partidas por data e campeonato para otimizar as chamadas à API
    const requestsToMake = new Map<string, { date: Date, slug: string }>();
    for (const match of outdatedMatches) {
      if (match.championship?.apiEspnSlug) {
        const dateString = match.date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        const key = `${match.championship.apiEspnSlug}:${dateString}`;
        if (!requestsToMake.has(key)) {
          requestsToMake.set(key, { date: match.date, slug: match.championship.apiEspnSlug });
        }
      }
    }
    
    const championshipsToUpdateStandings = new Set<number>();
    
    // 4. Executa as chamadas à API e atualiza os jogos
    console.log(`🌐 Fazendo ${requestsToMake.size} requisições para a API da ESPN...`);

    for (const [key, request] of requestsToMake.entries()) {
      console.log(`  -> Buscando dados para: ${key}`);
      const events = await ExternalAPIService.getMatchesByDate(request.slug, request.date);
      
      if (events && events.length > 0) {
        const { updated, finishedChampionships } = await MatchService.updateMatchesFromCron(events);
        console.log(`     - ${updated} partidas atualizadas.`);
        // Adiciona os IDs dos campeonatos que tiveram jogos finalizados ao set
        finishedChampionships.forEach(id => championshipsToUpdateStandings.add(id));
      } else {
        console.log(`     - Nenhum evento retornado pela API para ${key}.`);
      }
    }

    // 5. Atualiza a tabela de classificação (standings) para os campeonatos afetados
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
    process.exit(1); // Encerra o processo com código de erro
  } finally {
    // 6. Fecha a conexão com o banco de dados
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Conexão com o banco de dados fechada.');
    }
  }
}

// Executa a função principal
runUpdateScript();