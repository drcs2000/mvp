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
  private poolRepository = AppDataSource.getRepository(Pool);

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

      // Recarrega o bolão para incluir a relação de participantes na resposta
      return await transactionalEntityManager.findOneOrFail(Pool, {
        where: { id: newPool.id },
        relations: ['participants', 'participants.user'],
      });
    });
  }

  public async findAllPublic(): Promise<Pool[]> {
    return this.poolRepository.find({
        where: { private: false },
        relations: ['participants', 'participants.user'],
    });
  }

  public async findForUser(userId: number): Promise<Pool[]> {
    return this.poolRepository.find({
        where: {
            participants: {
                userId: userId,
            },
        },
        relations: ['participants', 'participants.user'],
    });
  }
}

export default new PoolService();
