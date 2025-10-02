import { Router } from 'express';
import ChampionshipController from './championships.controller';

const championshipsRouter = Router();

championshipsRouter.post('/seed', ChampionshipController.sync);
championshipsRouter.get('/', ChampionshipController.getAll);

export default championshipsRouter;
