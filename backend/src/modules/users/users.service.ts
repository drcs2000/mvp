import bcrypt from 'bcryptjs';
import { AppDataSource } from '../../database/data-source.js';
import { User } from '../../entities/user.entity.js';
import { Bet } from '../../entities/bet.entity.js';
import { Invitation } from '../../entities/invitation.entity.js';

type UserBetSummary = {
  matchDescription: string;
  matchDate: Date;
  betPlaced: string; 
  result: string | null;
  pointsEarned: number | null;
};

type UserPoolSummary = {
  id: number;
  name: string;
  role: 'admin' | 'participant';
  totalPoints: number;
  bets: UserBetSummary[];
};

type UserStats = {
  totalPools: number;
  totalBets: number;
  totalPoints: number;
};

type UserInvitationSummary = {
  poolName: string;
  relatedUserName: string;
  status: 'pending' | 'accepted' | 'expired' | 'declined' | 'canceled';
  createdAt: Date;
};

type UserProfileDetails = Omit<User, 'passwordHash' | 'pools'> & {
  pools: UserPoolSummary[];
  stats: UserStats;
  invitations: {
    sent: UserInvitationSummary[];
    received: UserInvitationSummary[];
  };
};

interface UserUpdatePayload {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

class UserService {
  private userRepository = AppDataSource.getRepository(User);
  private betRepository = AppDataSource.getRepository(Bet);
  private invitationRepository = AppDataSource.getRepository(Invitation);

  public async getAllUsers(): Promise<Omit<User, 'passwordHash'>[]> {
    const users = await this.userRepository.find();
    return users.map(user => {
      const { passwordHash, ...userProfile } = user;
      return userProfile;
    });
  }

  public async getUserById(userId: number): Promise<UserProfileDetails | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        pools: {
          pool: true,
        },
      },
    });

    if (!user) {
      return null;
    }

    const allUserBets = await this.betRepository.find({
      where: { user: { id: userId } },
      relations: ['pool', 'match'],
    });

    const pointsByPool = new Map<number, number>();
    const betsByPool = new Map<number, UserBetSummary[]>();
    let totalPointsOverall = 0;

    for (const bet of allUserBets) {
      const poolId = bet.pool.id;
      const pointsEarned = bet.pointsEarned || 0;

      const currentPoints = pointsByPool.get(poolId) || 0;
      pointsByPool.set(poolId, currentPoints + pointsEarned);
      totalPointsOverall += pointsEarned;

      if (!betsByPool.has(poolId)) {
        betsByPool.set(poolId, []);
      }
      betsByPool.get(poolId)!.push({
        matchDescription: `${bet.match.homeTeamName} vs ${bet.match.awayTeamName}`,
        matchDate: bet.match.date,
        betPlaced: `${bet.homeScoreBet} - ${bet.awayScoreBet}`,
        result: (bet.match.homeScore !== null && bet.match.awayScore !== null)
          ? `${bet.match.homeScore} - ${bet.match.awayScore}`
          : null,
        pointsEarned: bet.pointsEarned,
      });
    }

    const sentInvitations = await this.invitationRepository.find({
      where: { inviter: { id: userId } },
      relations: ['pool', 'invitee'],
    });

    const receivedInvitations = await this.invitationRepository.find({
      where: { invitee: { id: userId } },
      relations: ['pool', 'inviter'],
    });

    const { passwordHash, pools, ...userProfile } = user;

    const response: UserProfileDetails = {
      ...userProfile,
      pools: pools.map(participant => {
        const poolId = participant.pool.id;
        const betsForPool = betsByPool.get(poolId) || [];

        return {
          id: poolId,
          name: participant.pool.name,
          role: participant.role,
          totalPoints: pointsByPool.get(poolId) || 0,
          bets: betsForPool.sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()),
        };
      }).sort((a, b) => b.totalPoints - a.totalPoints),

      stats: {
        totalPools: pools.length,
        totalBets: allUserBets.length,
        totalPoints: totalPointsOverall,
      },

      invitations: {
        sent: sentInvitations.map(inv => ({
          poolName: inv.pool.name,
          relatedUserName: inv.invitee.name,
          status: inv.status,
          createdAt: inv.createdAt,
        })),
        received: receivedInvitations.map(inv => ({
          poolName: inv.pool.name,
          relatedUserName: inv.inviter.name,
          status: inv.status,
          createdAt: inv.createdAt,
        })),
      },
    };

    return response;
  }

  public async updateUser(userId: number, updateData: UserUpdatePayload): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      return null;
    }

    const dataToUpdate: Partial<User> = {};

    if (updateData.newPassword && updateData.currentPassword) {
      const isPasswordValid = await bcrypt.compare(updateData.currentPassword, user.passwordHash);

      if (!isPasswordValid) {
        throw new Error('Senha atual incorreta.');
      }

      dataToUpdate.passwordHash = await bcrypt.hash(updateData.newPassword, 10);
    } else if (updateData.newPassword && !updateData.currentPassword) {
      throw new Error('A senha atual é necessária para definir uma nova senha.');
    }

    // 2. Lógica para atualização de nome
    if (updateData.name !== undefined) {
      dataToUpdate.name = updateData.name;
    }

    // 3. Lógica para atualização de e-mail
    if (updateData.email !== undefined && updateData.email !== user.email) {
      const existingUserWithEmail = await this.userRepository.findOne({ where: { email: updateData.email } });
      if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
        throw new Error('Email já está em uso por outro usuário');
      }
      dataToUpdate.email = updateData.email;
    }

    // Verifica se há dados para atualizar
    if (Object.keys(dataToUpdate).length === 0) {
      throw new Error('Nenhum dado válido fornecido para atualização.');
    }

    // Executa a atualização no banco de dados
    await this.userRepository.update(userId, dataToUpdate);

    // Busca e retorna o usuário atualizado sem o hash da senha
    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'name', 'email', 'createdAt']
    });

    return updatedUser;
  }
}

export default new UserService();

