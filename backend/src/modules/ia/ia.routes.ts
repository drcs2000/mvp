import { Router } from 'express';
import IaController from './ia.controller.js';

const iaRouter = Router();

iaRouter.get('/train', IaController.getTrainModel);
iaRouter.get('/predict/:homeTeamId/:awayTeamId/:championshipId', IaController.predictMatch);

export default iaRouter;