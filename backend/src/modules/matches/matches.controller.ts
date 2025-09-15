import { Request, Response } from 'express';
import MatchService from './matches.service';

class MatchController {
  public saveMatchData = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { espnId, apiFootballId, fixtures } = req.body;

      if (!espnId || !apiFootballId || !fixtures || !Array.isArray(fixtures)) {
        return res.status(400).json({ message: "espnId, apiFootballId and fixtures array are required" });
      }

      const matches = await MatchService.saveMatchData(espnId, apiFootballId, fixtures);
      return res.status(200).json(matches);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to save match data" });
    }
  }

  public findByChampionship = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { apiFootballId } = req.params;
      if (!apiFootballId) {
        return res.status(400).json({ message: "O ID do campeonato é obrigatório." });
      }

      const matches = await MatchService.findByChampionship(Number(apiFootballId));
      return res.status(200).json(matches);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Falha ao buscar jogos do campeonato." });
    }
  }

  public findByTeam = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name } = req.query;
      if (!name) {
        return res.status(400).json({ message: "O nome do time é obrigatório." });
      }

      const matches = await MatchService.findByTeam(String(name));
      return res.status(200).json(matches);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Falha ao buscar jogos do time." });
    }
  }
}

export default new MatchController();

