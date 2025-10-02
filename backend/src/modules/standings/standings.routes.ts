import { Router } from 'express';
import StandingsController from './standings.controller';

const standingsRouter = Router();

standingsRouter.get('/:championshipId', StandingsController.getStandings);
standingsRouter.post('/update/:championshipId', StandingsController.updateStandings);

export default standingsRouter;