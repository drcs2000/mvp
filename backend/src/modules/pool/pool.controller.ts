import { Request, Response } from 'express';
import PoolService from './pool.service';
import { encodeId, decodeId } from '../../utils/hashid.helper';
import { Pool } from '../../entities/pool.entity';

class PoolController {
  private transformPoolResponse(pool: Pool) {
    const participants = pool.participants?.map(p => ({
      userId: p.userId,
      userName: p.user?.name,
      role: p.role
    })) || [];

    const { participants: _, ...poolData } = pool;

    return {
      ...poolData,
      id: encodeId(pool.id),
      participants: participants
    };
  }

  public create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.user.id;
      
      const {
        name,
        maxParticipants,
        betDeadlineHours,
        baseChampionshipId,
        private: isPrivate,
        points,
        entryFee
      } = req.body;

      if (!name || !maxParticipants || !baseChampionshipId || !points) {
        return res.status(400).json({ error: 'Dados incompletos para criar o bolão.' });
      }

      const newPoolEntity = await PoolService.create({
        name,
        maxParticipants,
        betDeadlineHours,
        baseChampionshipId,
        private: isPrivate,
        points,
        entryFee
      }, userId);

      const responsePool = this.transformPoolResponse(newPoolEntity);

      return res.status(201).json(responsePool);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: 'Falha ao criar o bolão.', details: error.message });
    }
  };

  public findAllPublic = async (req: Request, res: Response): Promise<Response> => {
    try {
      const pools = await PoolService.findAllPublic();
      const responsePools = pools.map(pool => this.transformPoolResponse(pool));
      return res.status(200).json(responsePools);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: 'Falha ao buscar bolões públicos.', details: error.message });
    }
  };

  public findMyPools = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.user.id;
      const pools = await PoolService.findForUser(userId);
      const responsePools = pools.map(pool => this.transformPoolResponse(pool));
      return res.status(200).json(responsePools);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: 'Falha ao buscar seus bolões.', details: error.message });
    }
  };

  public findOne = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { poolId } = req.params;
      
      const decodedId = decodeId(poolId);
      if (decodedId === null) {
        return res.status(400).json({ error: 'ID de bolão inválido.' });
      }

      const pool = await PoolService.findOne(decodedId);
      if (!pool) {
        return res.status(404).json({ error: 'Bolão não encontrado.' });
      }

      const responsePool = this.transformPoolResponse(pool);
      return res.status(200).json(responsePool);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: 'Falha ao buscar o bolão.', details: error.message });
    }
  };
}

export default new PoolController();
