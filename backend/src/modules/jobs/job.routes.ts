import { Router } from 'express';
import JobController from './job.controller.js';
import { jobAuthMiddleware } from '../../middlewares/job-auth.middleware.js';

const jobRouter = Router();

jobRouter.use(jobAuthMiddleware);

jobRouter.post('/trigger-update-scores', JobController.triggerUpdateScores);
jobRouter.post('/trigger-update-standings', JobController.triggerUpdateStandings);

export default jobRouter;