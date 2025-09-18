import { Router } from 'express';
import MatchController from './matches.controller';

const matchesRouter = Router();

matchesRouter.post('/save-match-data', MatchController.saveMatchData);
matchesRouter.get('/championship/:apiFootballId', MatchController.findByChampionship);
matchesRouter.get('/team', MatchController.findByTeam);
matchesRouter.get('/last-games/:championshipId/:team1Id/:team2Id', MatchController.getLastGames);
matchesRouter.get('/h2h/:team1Id/:team2Id', MatchController.getH2H);

export default matchesRouter;
