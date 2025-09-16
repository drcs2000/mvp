import { AppDataSource } from '../../database/data-source';
import { Pool } from '../../entities/pool.entity';
import { PoolParticipant, PoolRole } from '../../entities/pool-participant.entity';
import { Bet } from '../../entities/bet.entity';

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
    const pools = await this.poolRepository
      .createQueryBuilder("pool")
      .leftJoin("pool.participants", "participants")
      .where("participants.userId = :userId", { userId })
      .leftJoinAndSelect("pool.participants", "allParticipants")
      .leftJoinAndSelect("allParticipants.user", "user")
      .getMany();
    return pools;
  }

  public async findOne(poolId: number): Promise<Pool | null> {
    return this.poolRepository.findOne({
      where: { id: poolId },
      relations: ['participants', 'participants.user'],
    });
  }

  public async joinPool(poolId: number, userId: number): Promise<Pool> {
    return AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const pool = await transactionalEntityManager.findOne(Pool, {
        where: { id: poolId },
        relations: ['participants'],
      });

      if (!pool) {
        throw new Error('Bolão não encontrado.');
      }

      if (pool.private) {
        throw new Error('Este bolão é privado e não pode ser acessado diretamente.');
      }

      const isParticipant = pool.participants.some(p => p.userId === userId);
      if (isParticipant) {
        throw new Error('Você já é um participante deste bolão.');
      }

      const newParticipant = transactionalEntityManager.create(PoolParticipant, {
        poolId,
        userId,
        role: PoolRole.PARTICIPANT,
      });
      await transactionalEntityManager.save(newParticipant);

      return await transactionalEntityManager.findOneOrFail(Pool, {
        where: { id: poolId },
        relations: ['participants', 'participants.user'],
      });
    });
  }

  public async delete(poolId: number, requestingUserId: number): Promise<void> {
    return AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const pool = await transactionalEntityManager.findOne(Pool, {
        where: { id: poolId },
        relations: ['participants'],
      });

      if (!pool) {
        throw new Error('Bolão não encontrado.');
      }

      const admin = pool.participants.find(p => p.role === PoolRole.ADMIN);

      if (!admin || admin.userId !== requestingUserId) {
        throw new Error('Apenas o administrador pode excluir o bolão.');
      }

      await transactionalEntityManager.delete(Bet, { pool: { id: poolId } });
      await transactionalEntityManager.delete(PoolParticipant, { poolId: poolId });
      await transactionalEntityManager.remove(pool);
    });
  }
}

export default new PoolService();
