import { Router } from 'express';
import BetsController from './bets.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const betsRouter = Router();

betsRouter.get('/', authMiddleware, BetsController.getBets);
betsRouter.post('/pools/:poolId/matches/:matchId', authMiddleware, BetsController.createOrUpdateBet);

export default betsRouter;