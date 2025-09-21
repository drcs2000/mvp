import { Router } from 'express';
import PoolsController from './pool.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const poolsRouter = Router();

poolsRouter.post('/', authMiddleware, PoolsController.create);
poolsRouter.get('/', PoolsController.findAllPublic);
poolsRouter.get('/my-pools', authMiddleware, PoolsController.findMyPools);
poolsRouter.get('/:poolId', PoolsController.findOne);
poolsRouter.post('/:poolId/join', authMiddleware, PoolsController.joinPool);
poolsRouter.post('/:poolId/:userId/payment', authMiddleware, PoolsController.confirmPayment)
poolsRouter.delete('/:poolId', authMiddleware, PoolsController.delete);
poolsRouter.delete('/:poolId/participants/:userId', authMiddleware, PoolsController.removeParticipant);

export default poolsRouter;
