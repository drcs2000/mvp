import { Request, Response, NextFunction } from 'express';

export function jobAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const secret = req.headers['x-internal-secret'];

  if (!secret || secret !== process.env.INTERNAL_JOB_SECRET) {
    return res.status(403).json({ message: 'Acesso não autorizado.' });
  }

  next();
}