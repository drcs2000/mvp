import { Request, Response } from 'express';
import StandingsService from './standings.service';
import { AppDataSource } from '../../database/data-source';
import { Championship } from '../../entities/championship.entity';

class StandingsController {
  public getStandings = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { apiFootballId } = req.params;
      if (!apiFootballId) {
        return res.status(400).json({ message: "O ID do campeonato (apiFootballId) é obrigatório." });
      }

      const standings = await StandingsService.getStandingsByChampionshipId(Number(apiFootballId));
      return res.status(200).json(standings);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Falha ao buscar a tabela de classificação." });
    }
  }

  public updateStandings = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { apiFootballId } = req.params;
      const apiStandingsData = req.body.standings;

      if (!apiFootballId || !apiStandingsData || !Array.isArray(apiStandingsData)) {
        return res.status(400).json({ message: "O ID do campeonato (apiFootballId) e um array 'standings' são obrigatórios." });
      }

      const championshipRepository = AppDataSource.getRepository(Championship);
      const championship = await championshipRepository.findOneBy({
        apiFootballId: Number(apiFootballId),
      });
      
      if (!championship) {
        return res.status(404).json({ message: "Campeonato não encontrado." });
      }

      await StandingsService.updateStandingsFromApi(championship, apiStandingsData);
      
      return res.status(200).json({ message: "Tabela de classificação atualizada com sucesso." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Falha ao atualizar a tabela de classificação." });
    }
  }
}

export default new StandingsController();