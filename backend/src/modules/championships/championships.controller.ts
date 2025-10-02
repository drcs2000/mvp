import { Request, Response } from 'express';
import ChampionshipService from './championships.service';
import { ChampionshipType } from '../../entities/championship.entity';

class ChampionshipController {
  public sync = async (req: Request, res: Response): Promise<Response> => {
    try {
      const championshipsData = req.body;
      if (!Array.isArray(championshipsData)) {
        return res.status(400).json({ error: 'O corpo da requisição deve ser um array de campeonatos.' });
      }

      const result = await ChampionshipService.sync(championshipsData);
      return res.status(200).json({
        message: 'Sincronização de campeonatos concluída.',
        ...result
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Falha ao sincronizar campeonatos.', details: error.message });
    }
  }

  public getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { type } = req.query;
      const filters: { type?: ChampionshipType } = {};

      if (type && Object.values(ChampionshipType).includes(type as ChampionshipType)) {
        filters.type = type as ChampionshipType;
      }

      const championships = await ChampionshipService.getAll(filters);
      return res.status(200).json(championships);
    } catch (error: any) {
      return res.status(500).json({ error: 'Falha ao buscar campeonatos.', details: error.message });
    }
  }
}

export default new ChampionshipController();
