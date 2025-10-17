import path from 'path';
import url from 'url';
import { Worker } from 'worker_threads';
import StandingsService from '../standings/standings.service.js';
import ChampionshipService from '../championships/championships.service.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

type StandingUpdateResult = { status: 'fulfilled'; id: number; } | { status: 'rejected'; id: number; reason: any; };

class JobService {
  private championshipsToUpdateStandings: Set<number> = new Set();
  private isUpdateScoresJobRunning = false;
  private isUpdateStandingsJobRunning = false;

  public triggerUpdateScoresWorker = () => {
    if (this.isUpdateScoresJobRunning) {
      console.log('🟡 [JOB DE PARTIDAS] O job anterior ainda está em execução. Pulando.');
      return;
    }
    console.log('🚀 [JOB DE PARTIDAS] Disparando worker para atualização de placares...');
    this.isUpdateScoresJobRunning = true;
    const workerPath = path.join(__dirname, '../../jobs/update-scores.worker.js'); // Ajuste o caminho se necessário
    const worker = new Worker(workerPath);

    worker.on('message', (result) => {
      if (result.error) {
        console.error('[JOB DE PARTIDAS] Worker retornou um erro:', result.error);
        return;
      }
      if (result.finishedChampionships && result.finishedChampionships.length > 0) {
        result.finishedChampionships.forEach((id: number) => this.championshipsToUpdateStandings.add(id));
        console.log(`[JOB DE PARTIDAS] Worker finalizou. Campeonatos [${result.finishedChampionships}] adicionados à fila.`);
      }
    });
    worker.on('error', (error) => {
      console.error('[JOB DE PARTIDAS] Erro fatal no worker:', error);
      this.isUpdateScoresJobRunning = false;
    });
    worker.on('exit', (code) => {
      if (code !== 0) console.error(`[JOB DE PARTIDAS] Worker parou com código de saída ${code}`);
      this.isUpdateScoresJobRunning = false;
    });
  }

  public updateStandingsJob = async () => {
    // if (this.championshipsToUpdateStandings.size === 0) return;
    if (this.isUpdateStandingsJobRunning) {
      console.log('🟡 [JOB DE CLASSIFICAÇÃO] O job anterior ainda está em execução. Pulando.');
      return;
    }
    this.isUpdateStandingsJobRunning = true;
    console.log(`⏰ [JOB DE CLASSIFICAÇÃO FORÇADO] Buscando todos os campeonatos para atualizar...`);

    try {
      const championships = await ChampionshipService.getAll();
      if (!championships || championships.length === 0) {
        console.log('[JOB DE CLASSIFICAÇÃO FORÇADO] Nenhum campeonato encontrado no banco de dados.');
        return;
      }

      const idsToProcess = championships.map(c => c.id);
      console.log(` -> Atualizando classificações para os campeonatos: [${idsToProcess.join(', ')}]`);

      const promises = idsToProcess.map((championshipId): Promise<StandingUpdateResult> =>
        StandingsService.updateStandings(championshipId)
          .then(() => ({ status: 'fulfilled' as const, id: championshipId }))
          .catch(error => ({ status: 'rejected' as const, id: championshipId, reason: error }))
      );

      await Promise.all(promises);

      console.log('[JOB DE CLASSIFICAÇÃO FORÇADO] Tarefa concluída.');

    } catch (error) {
      console.error('[JOB DE CLASSIFICAÇÃO FORÇADO] Ocorreu um erro catastrófico:', error);
    } finally {
      this.isUpdateStandingsJobRunning = false;
    }
  }

  public triggerFullSyncWorker = () => {
    console.log('🚀 [JOB DE SYNC COMPLETO] Disparando worker...');
    const workerPath = path.join(__dirname, '../../jobs/sync-full-season.worker.js');
    const worker = new Worker(workerPath);
    worker.on('message', (result) => console.log('[JOB DE SYNC COMPLETO] Worker finalizou:', result));
    worker.on('error', (error) => console.error('[JOB DE SYNC COMPLETO] Erro fatal no worker:', error));
    worker.on('exit', (code) => { if (code !== 0) console.error(`[JOB DE SYNC COMPLETO] Worker parou com código ${code}`) });
  }
}

export default new JobService();