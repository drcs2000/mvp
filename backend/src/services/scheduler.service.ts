import cron from 'node-cron';
import MatchService from '../modules/matches/matches.service';
import StandingsService from '../modules/standings/standings.service';
import { AppDataSource } from '../database/data-source';
import ExternalApiService from './external-api.service';

class SchedulerService {
  // Uma lista em memória para "anotar" os campeonatos que precisam de atualização.
  private championshipsToUpdateStandings: Set<number> = new Set();

  public start() {
    console.log('✔ Agendador de tarefas iniciado.');

    // Job 1: Atualiza os placares a cada 15 minutos.
    cron.schedule('*/15 * * * *', this.updateScoresJob, {
      timezone: "America/Sao_Paulo"
    });

    // Job 2: Atualiza as classificações a cada hora, no minuto 5 (ex: 13:05, 14:05).
    cron.schedule('5 * * * *', this.updateStandingsJob, {
      timezone: "America/Sao_Paulo"
    });
  }

  // JOB 1: Roda a cada 15 minutos
  private updateScoresJob = async () => {
    console.log(`⏰ [JOB DE PARTIDAS] Executando...`);
    try {
      if (!AppDataSource.isInitialized) await AppDataSource.initialize();

      const todaysEvents = await ExternalApiService.getFullDailyScoreboard();
      if (todaysEvents.length === 0) {
        console.log('[JOB DE PARTIDAS] Nenhum jogo encontrado hoje na API.');
        return;
      }
      
      const result = await MatchService.updateMatchesFromCron(todaysEvents);
      console.log(`[JOB DE PARTIDAS] ${result.updated} partidas foram atualizadas.`);

      // Se algum jogo terminou, adiciona o ID do campeonato na lista de espera.
      if (result.finishedChampionships.size > 0) {
        result.finishedChampionships.forEach(id => this.championshipsToUpdateStandings.add(id));
        console.log(`[JOB DE PARTIDAS] Campeonatos [${[...result.finishedChampionships]}] adicionados à fila de atualização de classificação.`);
      }
    } catch (error) {
      console.error('[JOB DE PARTIDAS] Erro:', error);
    }
  }
  
  // JOB 2: Roda a cada hora
  private updateStandingsJob = async () => {
    if (this.championshipsToUpdateStandings.size === 0) {
      console.log('⏰ [JOB DE CLASSIFICAÇÃO] Nenhuma classificação para atualizar no momento.');
      return;
    }

    console.log(`⏰ [JOB DE CLASSIFICAÇÃO] Atualizando classificações para os campeonatos: [${[...this.championshipsToUpdateStandings]}]`);
    
    // Cria uma cópia da lista e limpa a original para o próximo ciclo
    const idsToProcess = new Set(this.championshipsToUpdateStandings);
    this.championshipsToUpdateStandings.clear();

    for (const championshipId of idsToProcess) {
      try {
        console.log(`  -> Atualizando classificação para o campeonato ID ${championshipId}...`);
        await StandingsService.updateStandings(championshipId);
        console.log(`  -> Classificação para ID ${championshipId} atualizada com sucesso.`);
      } catch (error) {
        console.error(`  -> Falha ao atualizar classificação para ID ${championshipId}:`, error);
      }
    }
    console.log('[JOB DE CLASSIFICAÇÃO] Tarefa concluída.');
  }
}

export default new SchedulerService();