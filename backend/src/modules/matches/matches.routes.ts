import { Router } from 'express';
import MatchController from './matches.controller.js';

const matchesRouter = Router();

matchesRouter.get('/championship/:championshipId', MatchController.getMatchesByChampionship);
matchesRouter.get('/team/:teamId', MatchController.findByTeam);
matchesRouter.get('/last-games', MatchController.getLastGames);
matchesRouter.get('/h2h/:team1Id/:team2Id', MatchController.getH2H);

export default matchesRouter;
