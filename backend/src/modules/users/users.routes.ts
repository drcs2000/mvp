import { Router } from 'express';
import UserController from './users.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const usersRouter = Router();

usersRouter.get('/', authMiddleware, UserController.getAllUsers);
usersRouter.get('/:id', UserController.getUserById);
usersRouter.put('/:id', authMiddleware, UserController.updateUser);

export default usersRouter;