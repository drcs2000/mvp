import path from 'path';
import url from 'url';
import { Worker } from 'worker_threads';
import StandingsService from '../standings/standings.service.js';

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
    if (this.championshipsToUpdateStandings.size === 0) return;
    if (this.isUpdateStandingsJobRunning) {
      console.log('🟡 [JOB DE CLASSIFICAÇÃO] O job anterior ainda está em execução. Pulando.');
      return;
    }
    this.isUpdateStandingsJobRunning = true;
    console.log(`⏰ [JOB DE CLASSIFICAÇÃO] Atualizando [${[...this.championshipsToUpdateStandings]}]`);
    
    const idsToProcess = new Set(this.championshipsToUpdateStandings);
    this.championshipsToUpdateStandings.clear();

    const promises = Array.from(idsToProcess).map((championshipId): Promise<StandingUpdateResult> => 
      StandingsService.updateStandings(championshipId)
        .then(() => ({ status: 'fulfilled' as const, id: championshipId }))
        .catch(error => ({ status: 'rejected' as const, id: championshipId, reason: error }))
    );
    
    const results = await Promise.all(promises);
    results.forEach(result => {
      if (result.status === 'fulfilled') console.log(` -> Sucesso na atualização da ID ${result.id}.`);
      else if (result.status === 'rejected') console.error(` -> Falha na atualização da ID ${result.id}:`, result.reason);
    });
    
    console.log('[JOB DE CLASSIFICAÇÃO] Tarefa concluída.');
    this.isUpdateStandingsJobRunning = false;
  }
}

export default new JobService();