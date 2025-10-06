import { Request, Response } from 'express';
import StandingsService from './standings.service.js';

class StandingsController {
  public getStandings = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { championshipId } = req.params;
      const parsedId = parseInt(championshipId, 10);

      if (isNaN(parsedId)) {
        return res.status(400).json({ message: "O ID do campeonato é obrigatório e deve ser um número." });
      }

      const standings = await StandingsService.getStandings(parsedId);
      return res.status(200).json(standings);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: "Falha ao buscar a tabela de classificação.", details: error.message });
    }
  }

  public updateStandings = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { championshipId } = req.params;
      const parsedId = parseInt(championshipId, 10);

      if (isNaN(parsedId)) {
        return res.status(400).json({ message: "O ID do campeonato é obrigatório e deve ser um número." });
      }

      await StandingsService.updateStandings(parsedId);

      return res.status(200).json({ message: "Tabela de classificação sincronizada com sucesso." });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: "Falha ao sincronizar a tabela de classificação.", details: error.message });
    }
  }
}

export default new StandingsController();