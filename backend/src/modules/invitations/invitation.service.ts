import { Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source';
import { Invitation, InvitationStatus } from '../../entities/invitation.entity';
import { Pool } from '../../entities/pool.entity';
import { User } from '../../entities/user.entity';
import { PoolParticipant } from '../../entities/pool-participant.entity';

class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

type CreateInvitationDto = {
  poolId: number;
  inviterId: number;
  inviteeId: number;
}

class InvitationService {
  private invitationRepository: Repository<Invitation>;
  private poolRepository: Repository<Pool>;
  private participantRepository: Repository<PoolParticipant>;
  private userRepository: Repository<User>;

  constructor() {
    this.invitationRepository = AppDataSource.getRepository(Invitation);
    this.poolRepository = AppDataSource.getRepository(Pool);
    this.participantRepository = AppDataSource.getRepository(PoolParticipant);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async create(createDto: CreateInvitationDto): Promise<Invitation> {
    const { poolId, inviterId, inviteeId } = createDto;

    if (inviterId === inviteeId) {
      throw new AppError('Você não pode convidar a si mesmo.', 400);
    }

    const [pool, invitee] = await Promise.all([
      this.poolRepository.findOneBy({ id: poolId }),
      this.userRepository.findOneBy({ id: inviteeId })
    ]);

    if (!pool) {
      throw new AppError(`Bolão com ID ${poolId} não encontrado.`, 404);
    }
    if (!invitee) {
      throw new AppError(`Usuário convidado com ID ${inviteeId} não encontrado.`, 404);
    }

    const inviterIsParticipant = await this.participantRepository.findOneBy({
      pool: { id: poolId },
      user: { id: inviterId },
    });
    if (!inviterIsParticipant) {
      throw new AppError('Você não tem permissão para convidar para este bolão.', 403);
    }

    const existingParticipant = await this.participantRepository.findOneBy({
      pool: { id: poolId },
      user: { id: inviteeId },
    });
    if (existingParticipant) {
      throw new AppError(`O usuário ${invitee.name} já participa deste bolão.`, 409);
    }

    const pendingInvitation = await this.invitationRepository.findOneBy({
      pool: { id: poolId },
      invitee: { id: inviteeId },
      status: InvitationStatus.PENDING,
    });
    if (pendingInvitation) {
      throw new AppError(`Já existe um convite pendente para ${invitee.name} neste bolão.`, 409);
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const newInvitation = this.invitationRepository.create({
      pool,
      inviter: { id: inviterId } as User,
      invitee: { id: inviteeId } as User,
      expiresAt,
      status: InvitationStatus.PENDING,
    });

    await this.invitationRepository.save(newInvitation);

    return newInvitation;
  }

  async accept(invitationId: string, userId: number): Promise<PoolParticipant> {
    const invitation = await this.invitationRepository.findOne({
      where: {
        id: invitationId,
        invitee: { id: userId },
        status: InvitationStatus.PENDING
      },
      relations: ['pool', 'invitee']
    });

    if (!invitation) {
      throw new AppError('Convite não encontrado, já aceito ou você não tem permissão.', 404);
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = InvitationStatus.EXPIRED;
      await this.invitationRepository.save(invitation);
      throw new AppError('Este convite expirou.', 410); // 410 Gone
    }

    return AppDataSource.manager.transaction(async (transactionalEntityManager) => {
      const newParticipant = transactionalEntityManager.create(PoolParticipant, {
        pool: invitation.pool,
        user: invitation.invitee,
      });
      await transactionalEntityManager.save(newParticipant);

      invitation.status = InvitationStatus.ACCEPTED;
      await transactionalEntityManager.save(invitation);

      return newParticipant;
    });
  }

  async decline(invitationId: string, userId: number): Promise<Invitation> {
    const invitation = await this.invitationRepository.findOne({
      where: {
        id: invitationId,
        invitee: { id: userId },
        status: InvitationStatus.PENDING
      }
    });

    if (!invitation) {
      throw new AppError('Convite não encontrado, já respondido ou você não tem permissão.', 404);
    }

    invitation.status = InvitationStatus.DECLINED;
    return this.invitationRepository.save(invitation);
  }

  async findPendingByUserId(userId: number): Promise<Invitation[]> {
    return this.invitationRepository.find({
      where: {
        invitee: { id: userId },
        status: InvitationStatus.PENDING,
      },
      relations: ['pool', 'inviter'],
      order: {
        createdAt: 'DESC'
      }
    });
  }
}

export default new InvitationService();