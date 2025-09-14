import { Request, Response } from 'express';
import PoolService from './pool.service';

class PoolController {
  public async create(req: Request, res: Response): Promise<Response> {
    try {
      const {
        name,
        maxParticipants,
        betDeadlineHours,
        baseChampionshipId,
        private: isPrivate,
        points,
        entryFee,
        userId
      } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'O ID do usuário criador é obrigatório.' });
      }

      if (!name || !maxParticipants || !baseChampionshipId || !points) {
        return res.status(400).json({ error: 'Dados incompletos para criar o bolão.' });
      }

      const newPool = await PoolService.create({
        name,
        maxParticipants,
        betDeadlineHours,
        baseChampionshipId,
        private: isPrivate,
        points,
        entryFee
      }, userId); 

      return res.status(201).json(newPool);
    } catch (error: any) {
      return res.status(500).json({ error: 'Falha ao criar o bolão.', details: error.message });
    }
  }
}

export default new PoolController();

