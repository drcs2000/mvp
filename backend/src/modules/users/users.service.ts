import { AppDataSource } from '../../database/data-source';
import { User } from '../../entities/user.entity';

type UserProfile = Omit<User, 'passwordHash'>;

class UserService {
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Busca todos os usuários cadastrados no sistema.
   * @returns Uma lista de usuários sem o hash da senha.
   */
  public async getAllUsers(): Promise<UserProfile[]> {
    const users = await this.userRepository.find();

    const usersWithoutPassword = users.map(user => {
      const { passwordHash, ...userProfile } = user;
      return userProfile;
    });

    return usersWithoutPassword;
  }
}

export default new UserService();