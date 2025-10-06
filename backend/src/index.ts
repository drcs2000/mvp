import 'reflect-metadata';
import 'dotenv/config';
import express, { Request, Response } from 'express';
import { AppDataSource } from './database/data-source.js';

import authRouter from './modules/auth/auth.routes.js';
import poolRouter from './modules/pool/pool.routes.js';
import matchesRouter from './modules/matches/matches.routes.js';
import championshipsRouter from './modules/championships/championships.routes.js';
import StandingsRouter from './modules/standings/standings.routes.js';
import BetsRouter from './modules/bets/bets.routes.js';
import InvitationRouter from './modules/invitations/invitation.routes.js';
import usersRouter from './modules/users/users.routes.js';

import SchedulerService from './services/scheduler.service.js';

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
