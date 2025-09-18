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

  public getLastGames = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { championshipId, team1Id, team2Id } = req.params;

      const parsedChampionshipId = parseInt(championshipId, 10);
      const teamIds = [parseInt(team1Id, 10), parseInt(team2Id, 10)].filter(id => !isNaN(id));

      if (isNaN(parsedChampionshipId) || teamIds.length < 2) {
        return res.status(400).json({ message: 'Todos os IDs (campeonato e times) devem ser fornecidos e válidos.' });
      }

      const lastGames = await MatchService.getLastGamesByTeamIds(parsedChampionshipId, teamIds);
      return res.status(200).json(lastGames);

    } catch (error) {
      console.error('Erro ao buscar os últimos jogos:', error);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  public getH2H = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { team1Id, team2Id } = req.params;

      const parsedTeam1Id = parseInt(team1Id, 10);
      const parsedTeam2Id = parseInt(team2Id, 10);

      if (isNaN(parsedTeam1Id) || isNaN(parsedTeam2Id)) {
        return res.status(400).json({ message: 'Os IDs dos times devem ser fornecidos e válidos.' });
      }

      const h2hData = await MatchService.findH2H(parsedTeam1Id, parsedTeam2Id);

      if (!h2hData || !h2hData.matches || h2hData.matches.length === 0) {
        return res.status(404).json({ message: "Não fomos capazes de achar o histórico de confrontos desses times, pedimos desculpas" });
      }

      return res.status(200).json(h2hData.matches);

    } catch (error) {
      console.error('Erro ao buscar o histórico H2H:', error);
      return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }

  public addH2HMatch = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { team1Id, team2Id, newMatchData } = req.body;

      if (!team1Id || !team2Id || !newMatchData || typeof newMatchData !== 'object') {
        return res.status(400).json({ message: "Os IDs dos times e um objeto com os dados da partida (newMatchData) são obrigatórios." });
      }

      const updatedH2H = await MatchService.addMatchToH2H(team1Id, team2Id, newMatchData);

      if (!updatedH2H) {
        return res.status(404).json({ message: "Registro H2H para os times informados não foi encontrado." });
      }
      
      return res.status(200).json(updatedH2H);

    } catch (error) {
      console.error('Erro ao adicionar partida ao H2H:', error);
      return res.status(500).json({ message: 'Falha ao adicionar a partida ao histórico de confrontos.' });
    }
  }
}

export default new MatchController();
