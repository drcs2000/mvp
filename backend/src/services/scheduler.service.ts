import cron from 'node-cron';
import MatchesService from '../modules/matches/matches.service';
import { AppDataSource } from '../database/data-source';
import { Championship } from '../entities/championship.entity';
import ExternalAPIService from './external-api.service';

class SchedulerService {
  private championshipRepository = AppDataSource.getRepository(Championship);

  public start() {
    console.log('✔ Agendador de tarefas iniciado.');

    cron.schedule('*/15 * * * *', this.updateScoresJob, {
      timezone: "America/Sao_Paulo"
    });
  }

  private updateScoresJob = async () => {
    console.log('⏰ [Job Agendado] A executar tarefa de atualização de placares via ESPN...');
    try {
      const championshipsToUpdate = await this.championshipRepository.createQueryBuilder("championship")
        .where("championship.apiEspnSlug IS NOT NULL")
        .getMany();

      if (championshipsToUpdate.length === 0) {
        console.log('[Job Agendado] Nenhum campeonato com slug da ESPN encontrado para atualizar.');
        return;
      }
      
      console.log(`[Job Agendado] Encontrados ${championshipsToUpdate.length} campeonatos para verificar.`);

      for (const championship of championshipsToUpdate) {
        if (!championship.apiEspnSlug) continue;

        console.log(`-- A verificar ${championship.name} (slug: ${championship.apiEspnSlug})`);
        
        try {
          const scoreboardData = await ExternalAPIService.getEspnScoreboard(championship.apiEspnSlug);
        
          if (scoreboardData && scoreboardData.events && scoreboardData.events.length > 0) {
            const result = await MatchesService.updateMatchesFromEspn(championship.apiFootballId, scoreboardData.events);
            console.log(`-- ${championship.name}: ${result.updated} jogos atualizados, ${result.notFound} não encontrados.`);
          } else {
            console.log(`-- Sem jogos hoje para ${championship.name}.`);
          }
        } catch (apiError: any) {
          console.error(`-- Falha ao buscar dados para a liga ${championship.name} (slug: ${championship.apiEspnSlug}). Erro: ${apiError.message}`);
        }
      }
      
      console.log('[Job Agendado] Tarefa de atualização concluída.');
    } catch (error) {
      console.error('[Job Agendado] Ocorreu um erro geral ao atualizar os placares:', error);
    }
  }
}

export default new SchedulerService();