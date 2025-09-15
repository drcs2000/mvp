import { Router } from 'express';
import ChampionshipController from './championships.controller';

const championshipsRouter = Router();

championshipsRouter.post('/seed', ChampionshipController.seed);
championshipsRouter.get('/', ChampionshipController.getAll);

export default championshipsRouter;
