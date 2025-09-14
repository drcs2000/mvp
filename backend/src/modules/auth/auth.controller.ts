import { Request, Response } from 'express';
import AuthService from './auth.service';

class AuthController {
  
  public async register(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
      }

      const result = await AuthService.register({ name, email, password });
      
      return res.status(201).json(result);

    } catch (error: any) {
      if (error.message.includes('cadastrado')) {
        return res.status(409).json({ error: error.message });
      }
      return res.status(400).json({ error: error.message });
    }
  }

  public async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
      }
      const token = await AuthService.login(email, password);
      return res.status(200).json({ token });
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }

  public async logout(req: Request, res: Response): Promise<Response> {
    return res.status(200).json({ message: 'Logout realizado com sucesso.' });
  }
}

export default new AuthController();