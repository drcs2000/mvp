import { Router } from 'express';
import BetsController from './bets.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const betsRouter = Router();

betsRouter.get('/', authMiddleware, BetsController.getBets);
betsRouter.post('/pools/:poolId/matches/:matchId', authMiddleware, BetsController.createOrUpdateBet);
betsRouter.get('/pools/:poolId', authMiddleware, BetsController.getAllBetsByPool);
betsRouter.post('/pools/:poolId/sync', BetsController.syncPoolPoints);

export default betsRouter;