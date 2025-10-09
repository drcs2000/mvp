import cron from 'node-cron';
import path from 'path';
import url from 'url';
import { Worker } from 'worker_threads';
import StandingsService from '../modules/standings/standings.service.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

type StandingUpdateResult =
  | { status: 'fulfilled'; id: number; }
  | { status: 'rejected'; id: number; reason: any; };

class SchedulerService {
  private championshipsToUpdateStandings: Set<number> = new Set();
  private isUpdateScoresJobRunning = false;

  public start() {
    console.log('✔ Agendador de tarefas iniciado.');

    cron.schedule('*/15 * * * *', this.triggerUpdateScoresWorker, {
      timezone: "America/Sao_Paulo"
    });

    cron.schedule('5 * * * *', this.updateStandingsJob, {
      timezone: "America/Sao_Paulo"
    });
  }

  private triggerUpdateScoresWorker = () => {
    if (this.isUpdateScoresJobRunning) {
      console.log('🟡 [JOB DE PARTIDAS] O job anterior ainda está em execução. Pulando.');
      return;
    }

    console.log('🚀 [JOB DE PARTIDAS] Disparando worker para atualização de placares...');
    this.isUpdateScoresJobRunning = true;

    const workerPath = path.join(__dirname, '../jobs/update-scores.worker.js');
    const worker = new Worker(workerPath);

    worker.on('message', (result) => {
      if (result.error) {
        console.error('[JOB DE PARTIDAS] Worker retornou um erro:', result.error);
        return;
      }
      if (result.finishedChampionships && result.finishedChampionships.length > 0) {
        result.finishedChampionships.forEach((id: number) => this.championshipsToUpdateStandings.add(id));
        console.log(`[JOB DE PARTIDAS] Worker finalizou. Campeonatos [${result.finishedChampionships}] adicionados à fila.`);
      } else {
        console.log('[JOB DE PARTIDAS] Worker finalizou sem novas atualizações.');
      }
    });

    worker.on('error', (error) => {
      console.error('[JOB DE PARTIDAS] Erro fatal no worker:', error);
      this.isUpdateScoresJobRunning = false;
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`[JOB DE PARTIDAS] Worker parou com código de saída ${code}`);
      }
      this.isUpdateScoresJobRunning = false;
    });
  }

  private updateStandingsJob = async () => {
    if (this.championshipsToUpdateStandings.size === 0) {
      return;
    }

    console.log(`⏰ [JOB DE CLASSIFICAÇÃO] Atualizando [${[...this.championshipsToUpdateStandings]}]`);

    const idsToProcess = new Set(this.championshipsToUpdateStandings);
    this.championshipsToUpdateStandings.clear();

    const promises = Array.from(idsToProcess).map((championshipId): Promise<StandingUpdateResult> => {
      console.log(`  -> Disparando atualização para ID ${championshipId}...`);
      return StandingsService.updateStandings(championshipId)
        .then(() => ({ status: 'fulfilled' as const, id: championshipId }))
        .catch(error => ({ status: 'rejected' as const, id: championshipId, reason: error }));
    });

    const results: StandingUpdateResult[] = await Promise.all(promises);

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        console.log(`  -> Classificação para ID ${result.id} atualizada com sucesso.`);
      } else if (result.status === 'rejected') {
        console.error(`  -> Falha ao atualizar classificação para ID ${result.id}:`, result.reason);
      }
    });

    console.log('[JOB DE CLASSIFICAÇÃO] Tarefa concluída.');
  }
}

export default new SchedulerService();