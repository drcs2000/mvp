import { Router } from 'express';
import InvitationsController from './invitation.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const invitationRoutes = Router();

invitationRoutes.post('/pools/:poolId/invitations', authMiddleware, InvitationsController.create);
invitationRoutes.get('/pending', authMiddleware, InvitationsController.listPending);
invitationRoutes.post('/:invitationId/accept', authMiddleware, InvitationsController.accept);
invitationRoutes.post('/:invitationId/decline', authMiddleware, InvitationsController.decline);

export default invitationRoutes;