import { Router } from 'express';
import UserController from './users.controller';

const usersRouter = Router();

usersRouter.get('/', UserController.getAllUsers);

export default usersRouter;