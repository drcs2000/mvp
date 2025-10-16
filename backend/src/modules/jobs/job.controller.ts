import { Request, Response } from 'express';
import JobService from './job.service.js';

class JobController {
  public triggerUpdateScores = async (req: Request, res: Response): Promise<Response> => {
    try {
      JobService.triggerUpdateScoresWorker();
      return res.status(202).json({ message: 'Job de atualização de placares disparado em segundo plano.' });
    } catch (error: any) {
      return res.status(500).json({ message: 'Falha ao disparar o job.', details: error.message });
    }
  }

  public triggerUpdateStandings = async (req: Request, res: Response): Promise<Response> => {
    try {
      JobService.updateStandingsJob();
      return res.status(202).json({ message: 'Job de atualização de classificações disparado em segundo plano.' });
    } catch (error: any) {
      return res.status(500).json({ message: 'Falha ao disparar o job.', details: error.message });
    }
  }

  public triggerFullSync = async (req: Request, res: Response): Promise<Response> => {
  JobService.triggerFullSyncWorker();
  return res.status(202).json({ message: 'Job de sincronização completa disparado em segundo plano.' });
}
}

export default new JobController();