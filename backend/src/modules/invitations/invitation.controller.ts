import { Request, Response } from 'express';
import InvitationService from './invitation.service.js';
import { decodeId } from '../../utils/hashid.helper.js';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    name: string;
  };
}

class InvitationsController {
  /**
   * Cria um novo convite para um usuário já existente na plataforma.
   * Rota: POST /pools/:poolId/invitations
   */
  public create = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const { poolId: encodedPoolId } = req.params;
      const { inviteeId } = req.body;
      const inviterId = req.user.id;

      // Decodifica o ID do bolão que vem da URL
      const decodedPoolId = decodeId(encodedPoolId);

      // Valida se o ID do bolão é válido após a decodificação
      if (!decodedPoolId) {
        return res.status(400).json({ message: 'O ID do bolão fornecido é inválido.' });
      }

      if (!inviteeId) {
        return res.status(400).json({ message: 'O ID do convidado é obrigatório.' });
      }

      const createInvitationDto = {
        poolId: decodedPoolId, // Usa o ID decodificado
        inviterId,
        inviteeId: Number(inviteeId),
      };

      const newInvitation = await InvitationService.create(createInvitationDto);

      return res.status(201).json(newInvitation);

    } catch (error: any) {
      return this.handleError(error, res);
    }
  };

  /**
   * Aceita um convite pendente. Apenas o usuário convidado pode aceitar.
   * Rota: POST /invitations/:invitationId/accept
   */
  public accept = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const { invitationId } = req.params;
      const userId = req.user.id; // ID do usuário que está aceitando

      const result = await InvitationService.accept(invitationId, userId);

      return res.status(200).json({ message: 'Convite aceito com sucesso!', participant: result });

    } catch (error: any) {
      return this.handleError(error, res);
    }
  };

  /**
   * Recusa um convite pendente. Apenas o usuário convidado pode recusar.
   * Rota: POST /invitations/:invitationId/decline
   */
  public decline = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const { invitationId } = req.params;
      const userId = req.user.id;

      await InvitationService.decline(invitationId, userId);

      return res.status(200).json({ message: 'Convite recusado com sucesso.' });
    } catch (error: any) {
      return this.handleError(error, res);
    }
  }

  /**
   * Lista todos os convites pendentes para o usuário autenticado.
   * Rota: GET /invitations/pending
   */
  public listPending = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user.id;
      const pendingInvitations = await InvitationService.findPendingByUserId(userId);
      return res.status(200).json(pendingInvitations);
    } catch (error: any) {
      return this.handleError(error, res);
    }
  };

  // Função auxiliar para centralizar o tratamento de erros
  private handleError(error: any, res: Response): Response {
    if (error.name === 'NotFoundException' || (error.name === 'AppError' && error.statusCode === 404)) {
      return res.status(404).json({ message: error.message });
    }
    if (error.name === 'ConflictException' || (error.name === 'AppError' && error.statusCode === 409)) {
      return res.status(409).json({ message: error.message });
    }
    if (error.name === 'UnauthorizedException' || (error.name === 'AppError' && error.statusCode === 403)) {
      return res.status(403).json({ message: error.message });
    }

    console.error(error);
    return res.status(500).json({ message: 'Erro interno no servidor.' });
  }
}

export default new InvitationsController();