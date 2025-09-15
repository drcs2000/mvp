import 'dotenv/config';
import 'reflect-metadata';
import express, { Request, Response } from 'express';
import { AppDataSource } from './database/data-source';
import authRouter from './modules/auth/auth.routes';
import poolRouter from './modules/pool/pool.routes';
import matchesRouter from './modules/matches/matches.routes';
import championshipsRouter from './modules/championships/championships.routes';
import SchedulerService from './services/scheduler.service';
import StandingsService from './modules/standings/standings.routes';

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
    app.use('/pool', poolRouter);
    app.use('/matches', matchesRouter);
    app.use('/championships', championshipsRouter);
    app.use('/standings', StandingsService);

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      
      SchedulerService.start();
    });

  })
  .catch((error) => {
    console.error("❌ Erro ao conectar com o banco de dados:", error);
  });
