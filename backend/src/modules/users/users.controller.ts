import { Request, Response } from 'express';
import UserService from './users.service';

class UserController {
  
  /**
   * Lida com a requisição para buscar todos os usuários.
   */
  public async getAllUsers(req: Request, res: Response): Promise<Response> {
    try {
      const users = await UserService.getAllUsers();
      return res.status(200).json(users);
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      return res.status(500).json({ error: 'Ocorreu um erro interno ao buscar os usuários.' });
    }
  }
}

export default new UserController();