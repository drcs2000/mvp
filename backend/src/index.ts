import 'dotenv/config';
import express, { Request, Response } from 'express';
import { AppDataSource } from './database/data-source';
import authRouter from './modules/auth/auth.routes';
import poolRouter from './modules/pool/pool.routes';

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Conexão com o banco de dados estabelecida com sucesso!");

    const app = express();
    const PORT = process.env.PORT || 3000;

    app.use(express.json());

    app.get('/', (req: Request, res: Response) => {
      return res.json({ message: 'API do Bolão está no ar!' });
    });
    
    app.use('/auth', authRouter);
    app.use('/pool', poolRouter);

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });

  })
  .catch((error) => {
    console.error("❌ Erro ao conectar com o banco de dados:", error);
  });