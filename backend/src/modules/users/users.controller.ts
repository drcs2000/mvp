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
      return res.status(500).json({ message: 'Ocorreu um erro interno ao buscar os usuários.' });
    }
  }

  /**
   * Lida com a requisição para buscar um usuário específico pelo ID.
   */
  public async getUserById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = parseInt(id, 10);

      if (isNaN(userId)) {
        return res.status(400).json({ message: 'ID de usuário inválido.' });
      }

      const user = await UserService.getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      return res.status(200).json(user);
    } catch (error: any) {
      console.error(`Erro ao buscar usuário com ID ${req.params.id}:`, error);
      return res.status(500).json({ message: 'Ocorreu um erro interno ao buscar o usuário.' });
    }
  }

  /**
   * Lida com a requisição para atualizar as informações de um usuário.
   */
  public async updateUser(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userId = parseInt(id, 10);
      const updateData = req.body;

      if (isNaN(userId)) {
        return res.status(400).json({ message: 'ID de usuário inválido.' });
      }

      if (!updateData || Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
      }

      // Validação de campos permitidos
      const allowedFields = ['name', 'email', 'currentPassword', 'newPassword'];
      const invalidFields = Object.keys(updateData).filter(field => !allowedFields.includes(field));

      if (invalidFields.length > 0) {
        return res.status(400).json({
          message: `Campos não permitidos para atualização: ${invalidFields.join(', ')}.`
        });
      }

      // Lógica para quando a senha é alterada
      if (updateData.newPassword && !updateData.currentPassword) {
        return res.status(400).json({
          message: 'A senha atual é obrigatória para definir uma nova senha.'
        });
      }

      const updatedUser = await UserService.updateUser(userId, updateData);

      if (!updatedUser) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      const userProfile = await UserService.getUserById(userId);

      return res.status(200).json(userProfile);

    } catch (error: any) {
      console.error(`Erro ao atualizar usuário com ID ${req.params.id}:`, error);

      if (error.message === 'Senha atual incorreta.') {
        return res.status(403).json({ message: 'A senha atual fornecida está incorreta.' });
      }

      if (error.message === 'Email já está em uso por outro usuário') {
        return res.status(409).json({
          message: 'Este email já está em uso por outro usuário.'
        });
      }

      if (error.message.includes('Nenhum dado válido fornecido para atualização')) {
        return res.status(400).json({
          message: error.message
        });
      }

      return res.status(500).json({
        message: 'Ocorreu um erro interno ao atualizar o usuário.'
      });
    }
  }
}

export default new UserController();
