import { Router } from 'express';
import PoolController from './pool.controller';

const poolsRouter = Router();

poolsRouter.post('/', PoolController.create);

export default poolsRouter;
