import { Request, Response } from 'express';
import ChampionshipService from './championships.service';

class ChampionshipController {
  public seed = async (req: Request, res: Response): Promise<Response> => {
    try {
      const championshipsData = req.body;
      if (!Array.isArray(championshipsData)) {
        return res.status(400).json({ error: 'O corpo da requisição deve ser um array de campeonatos.' });
      }

      const result = await ChampionshipService.seed(championshipsData);
      return res.status(200).json({
        message: 'Semeação de campeonatos concluída.',
        ...result
      });
    } catch (error: any) {
      return res.status(500).json({ error: 'Falha ao semear campeonatos.', details: error.message });
    }
  }

  public getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const championships = await ChampionshipService.getAll();
      return res.status(200).json(championships);
    } catch (error: any) {
      return res.status(500).json({ error: 'Falha ao buscar campeonatos.', details: error.message });
    }
  }
}

export default new ChampionshipController();
