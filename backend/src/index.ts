import 'dotenv/config';
import 'reflect-metadata';
import express, { Request, Response } from 'express';
import { AppDataSource } from './database/data-source';

import authRouter from './modules/auth/auth.routes';
import poolRouter from './modules/pool/pool.routes';
import matchesRouter from './modules/matches/matches.routes';
import championshipsRouter from './modules/championships/championships.routes';
import StandingsRouter from './modules/standings/standings.routes';
import BetsRouter from './modules/bets/bets.routes';
import InvitationRouter from './modules/invitations/invitation.routes';
import usersRouter from './modules/users/users.routes';

import SchedulerService from './services/scheduler.service';

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Conexão com o banco de dados estabelecida com sucesso!");

    const app = express();
    const PORT = process.env.PORT || 3000;

    app.use(express.json({ limit: '10mb' }));

    app.get('/', (req: Request, res: Response) => {
      return res.json({ message: 'API do Bolão está no ar!' });
    });

    app.use('/auth', authRouter);
    app.use('/pools', poolRouter);
    app.use('/matches', matchesRouter);
    app.use('/championships', championshipsRouter);
    app.use('/standings', StandingsRouter);
    app.use('/bets', BetsRouter);
    app.use('/invitations', InvitationRouter);
    app.use('/users', usersRouter);

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);

      SchedulerService.start();
    });

  })
  .catch((error) => {
    console.error("❌ Erro ao conectar com o banco de dados:", error);
  });
