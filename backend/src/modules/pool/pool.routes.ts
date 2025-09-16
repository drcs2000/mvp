import { Router } from 'express';
import PoolsController from './pool.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const poolsRouter = Router();

poolsRouter.post('/', authMiddleware, PoolsController.create);
poolsRouter.get('/', PoolsController.findAllPublic);
poolsRouter.get('/my-pools', authMiddleware, PoolsController.findMyPools);
poolsRouter.get('/:poolId', PoolsController.findOne);
poolsRouter.post('/:poolId/join', authMiddleware, PoolsController.joinPool);
poolsRouter.delete('/:poolId', authMiddleware, PoolsController.delete);

export default poolsRouter;
