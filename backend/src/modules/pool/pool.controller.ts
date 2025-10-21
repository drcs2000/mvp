import { Request, Response } from 'express'
import PoolService from './pool.service.js'
import { encodeId, decodeId } from '../../utils/hashid.helper.js'
import { Pool } from '../../entities/pool.entity.js'

class PoolController {
  private transformPoolResponse(pool: Pool) {
    const participants = pool.participants?.map(p => ({
      userId: p.userId,
      userName: p.user?.name,
      role: p.role,
      paid: p.paid
    })) || []

    const { participants: _, ...poolData } = pool

    return {
      ...poolData,
      id: encodeId(pool.id),
      participants: participants
    }
  }

  public create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.user.id

      const {
        name,
        maxParticipants,
        betDeadlineHours,
        baseChampionshipId,
        private: isPrivate,
        points,
        entryFee
      } = req.body

      if (!name || !maxParticipants || !baseChampionshipId || !points) {
        return res.status(400).json({ error: 'Dados incompletos para criar o bolão.' })
      }

      const newPoolEntity = await PoolService.create({
        name,
        maxParticipants,
        betDeadlineHours,
        baseChampionshipId,
        private: isPrivate,
        points,
        entryFee
      }, userId)

      const responsePool = this.transformPoolResponse(newPoolEntity)

      return res.status(201).json(responsePool)
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ error: 'Falha ao criar o bolão.', details: error.message })
    }
  }

  // MÉTODO ADICIONADO
  public update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { poolId } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const decodedPoolId = decodeId(poolId);
      if (decodedPoolId === null) {
        return res.status(400).json({ error: 'ID de bolão inválido.' });
      }

      const updatedPool = await PoolService.update(decodedPoolId, updateData, userId);
      
      const responsePool = this.transformPoolResponse(updatedPool);
      return res.status(200).json(responsePool);
    } catch (error: any) {
      console.error(error);
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('permissão')) {
        return res.status(403).json({ error: error.message });
      }
      if (error.message.includes('participantes')) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Falha ao atualizar o bolão.', details: error.message });
    }
  }

  public findAllPublic = async (req: Request, res: Response): Promise<Response> => {
    try {
      const pools = await PoolService.findAllPublic()
      const responsePools = pools.map(pool => this.transformPoolResponse(pool))
      return res.status(200).json(responsePools)
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ error: 'Falha ao buscar bolões públicos.', details: error.message })
    }
  }

  public findMyPools = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.user.id
      const pools = await PoolService.findForUser(userId)
      const responsePools = pools.map(pool => this.transformPoolResponse(pool))
      return res.status(200).json(responsePools)
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ error: 'Falha ao buscar seus bolões.', details: error.message })
    }
  }

  public findOne = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { poolId } = req.params

      const decodedId = decodeId(poolId)
      if (decodedId === null) {
        return res.status(400).json({ error: 'ID de bolão inválido.' })
      }

      const pool = await PoolService.findOne(decodedId)
      if (!pool) {
        return res.status(404).json({ error: 'Bolão não encontrado.' })
      }

      const responsePool = this.transformPoolResponse(pool)
      return res.status(200).json(responsePool)
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ error: 'Falha ao buscar o bolão.', details: error.message })
    }
  }

  public joinPool = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { poolId } = req.params
      const userId = req.user.id

      const decodedId = decodeId(poolId)
      if (decodedId === null) {
        return res.status(400).json({ error: 'ID de bolão inválido.' })
      }

      const pool = await PoolService.joinPool(decodedId, userId)

      const responsePool = this.transformPoolResponse(pool)
      return res.status(200).json(responsePool)
    } catch (error: any) {
      console.error(error)
      if (error.message.includes('Bolão não encontrado') || error.message.includes('não é público')) {
        return res.status(404).json({ error: error.message })
      }
      if (error.message.includes('já é um participante')) {
        return res.status(409).json({ error: error.message })
      }
      return res.status(500).json({ error: 'Falha ao entrar no bolão.', details: error.message })
    }
  }

  public delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { poolId } = req.params;
      const userId = req.user.id;

      const decodedPoolId = decodeId(poolId);
      if (decodedPoolId === null) {
        return res.status(400).json({ error: 'ID de bolão inválido.' });
      }

      await PoolService.delete(decodedPoolId, userId);

      return res.status(200).json({ message: 'Bolão excluído com sucesso.' });
    } catch (error: any) {
      console.error(error);

      if (error.message === 'Bolão não encontrado.') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Apenas o administrador pode excluir o bolão.') {
        return res.status(403).json({ error: error.message });
      }

      return res.status(500).json({ error: 'Falha ao excluir o bolão.', details: error.message });
    }
  }

  public removeParticipant = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { poolId, userId: targetUserIdString } = req.params;
      const requestingUserId = req.user.id;

      const decodedPoolId = decodeId(poolId);
      if (decodedPoolId === null) {
        return res.status(400).json({ error: 'ID de bolão inválido.' });
      }

      const targetUserId = parseInt(targetUserIdString, 10);
      if (isNaN(targetUserId)) {
        return res.status(400).json({ error: 'ID de usuário inválido.' });
      }

      await PoolService.removeParticipant(decodedPoolId, targetUserId, requestingUserId);
      return res.status(200).json({ message: 'Participante removido com sucesso.' });
    } catch (error: any) {
      console.error(error);

      if (error.message.includes('não encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('não tem permissão')) {
        return res.status(403).json({ error: error.message });
      }

      return res.status(500).json({ error: 'Falha ao remover o participante.', details: error.message });
    }
  }

  public confirmPayment = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { poolId, userId: targetUserIdString } = req.params;

      const decodedPoolId = decodeId(poolId);
      if (decodedPoolId === null) {
        return res.status(400).json({ error: 'ID de bolão inválido.' });
      }

      const targetUserId = parseInt(targetUserIdString, 10);
      if (isNaN(targetUserId)) {
        return res.status(400).json({ error: 'ID de usuário inválido.' });
      }
      
      await PoolService.confirmParticipantPayment(decodedPoolId, targetUserId);

      return res.status(200).json({ message: 'Pagamento do participante confirmado com sucesso.' });
    } catch (error: any) {
      console.error(error);

      if (error.message.includes('Participante não encontrado')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('já efetuou o pagamento')) {
        return res.status(409).json({ error: error.message }); // 409 Conflict
      }

      return res.status(500).json({ error: 'Falha ao confirmar o pagamento.', details: error.message });
    }
  }
}

export default new PoolController()
