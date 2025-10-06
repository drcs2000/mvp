import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../../database/data-source.js';
import { User } from '../../entities/user.entity.js';

class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  private generateToken(user: User): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('Segredo JWT não configurado no .env');
    }
    return jwt.sign({ id: user.id, name: user.name, email: user.email }, jwtSecret, { expiresIn: '1d' });
  }

  public async register(userData: { name: string, email: string, password: string }): Promise<{ user: Omit<User, 'passwordHash'>, token: string }> {
    const { name, email, password } = userData;

    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new Error('Este email já está cadastrado.');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({ name, email, passwordHash });
    await this.userRepository.save(newUser);

    const token = this.generateToken(newUser);

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword, token };
  }

  public async login(email: string, password: string): Promise<string> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new Error('Email ou senha inválidos.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Email ou senha inválidos.');
    }

    return this.generateToken(user);
  }
}

export default new AuthService();