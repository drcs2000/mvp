import { Router } from 'express';
import PoolsController from './pool.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const poolsRouter = Router();

poolsRouter.post('/', authMiddleware, PoolsController.create);
poolsRouter.get('/', PoolsController.findAllPublic);
poolsRouter.get('/my-pools', authMiddleware, PoolsController.findMyPools);

export default poolsRouter;
