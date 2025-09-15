import { Router } from 'express';
import StandingsController from './standings.controller';

const standingsRouter = Router();

standingsRouter.get('/:apiFootballId', StandingsController.getStandings);
standingsRouter.post('/:apiFootballId', StandingsController.updateStandings);

export default standingsRouter;