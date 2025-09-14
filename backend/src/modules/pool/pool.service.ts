import { AppDataSource } from '../../database/data-source';
import { Pool } from '../../entities/pool.entity';
import { PoolParticipant, PoolRole } from '../../entities/pool-participant.entity';

interface ICreatePoolDTO {
  name: string;
  maxParticipants: number;
  betDeadlineHours: number;
  baseChampionshipId: number;
  private: boolean;
  points: object;
  entryFee: number;
}

class PoolService {
  public async create(poolData: ICreatePoolDTO, adminUserId: number): Promise<Pool> {
    return AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const newPool = transactionalEntityManager.create(Pool, poolData);
      await transactionalEntityManager.save(newPool);

      const adminParticipant = transactionalEntityManager.create(PoolParticipant, {
        poolId: newPool.id,
        userId: adminUserId,
        role: PoolRole.ADMIN,
      });
      await transactionalEntityManager.save(adminParticipant);

      return newPool;
    });
  }
}

export default new PoolService();

