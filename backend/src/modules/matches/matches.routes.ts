import { Router } from 'express';
import MatchController from './matches.controller';

const matchesRouter = Router();

matchesRouter.post('/save-match-data', MatchController.saveMatchData);
matchesRouter.get('/championship/:apiFootballId', MatchController.findByChampionship);
matchesRouter.get('/team', MatchController.findByTeam);

export default matchesRouter;

