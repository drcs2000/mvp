import { Request, Response } from 'express';
import MatchService from './matches.service';
import ChampionshipService from '../championships/championships.service';
import ExternalApiService from '../../services/external-api.service';

class MatchController {
  public getMatchesByChampionship = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { championshipId } = req.params;
      const parsedId = parseInt(championshipId, 10);

      if (isNaN(parsedId)) {
        return res.status(400).json({ message: "O ID do campeonato deve ser um número." });
      }

      const matches = await MatchService.getMatches(parsedId);
      return res.status(200).json(matches);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: "Falha ao buscar jogos do campeonato.", details: error.message });
    }
  }

  public findByTeam = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { teamId } = req.params;
      const matches = await MatchService.findByTeam(Number(teamId));
      return res.status(200).json(matches);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: "Falha ao buscar jogos do time.", details: error.message });
    }
  }

  public getLastGames = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { teamIds } = req.query;

      if (!teamIds || typeof teamIds !== 'string') {
        return res.status(400).json({ message: 'O parâmetro "teamIds" (separado por vírgulas) é obrigatório.' });
      }

      const parsedTeamIds = teamIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));

      if (parsedTeamIds.length === 0) {
        return res.status(400).json({ message: 'Forneça IDs de times válidos.' });
      }

      const lastGames = await MatchService.getLastGamesByTeams(parsedTeamIds);
      return res.status(200).json(lastGames);

    } catch (error: any) {
      console.error('Erro ao buscar os últimos jogos:', error);
      return res.status(500).json({ message: 'Erro interno do servidor.', details: error.message });
    }
  }

  public getH2H = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { team1Id, team2Id } = req.params;
      const parsedTeam1Id = parseInt(team1Id, 10);
      const parsedTeam2Id = parseInt(team2Id, 10);

      if (isNaN(parsedTeam1Id) || isNaN(parsedTeam2Id)) {
        return res.status(400).json({ message: 'Os IDs dos times devem ser números válidos.' });
      }

      const h2hData = await MatchService.getH2H(parsedTeam1Id, parsedTeam2Id);

      if (!h2hData) {
        return res.status(404).json({ message: "Histórico de confrontos não populado." });
      }

      return res.status(200).json(h2hData);
    } catch (error: any) {
      console.error('Erro ao buscar o histórico H2H:', error);
      return res.status(500).json({ message: 'Erro interno do servidor.', details: error.message });
    }
  }
}

export default new MatchController();