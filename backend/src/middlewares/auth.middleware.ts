import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface IUserPayload {
  id: number;
  name: string;
  email: string; 
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user: {
        id: number;
        name: string;
        email: string; 
      }
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const parts = authorization.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token mal formatado.' });
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token mal formatado.' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as IUserPayload;

    req.user = { id: decoded.id, name: decoded.name, email: decoded.email }; 

    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};