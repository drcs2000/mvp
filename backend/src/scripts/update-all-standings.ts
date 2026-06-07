import 'dotenv/config';
import { AppDataSource } from '../database/data-source.js';
import { Championship } from '../entities/championship.entity.js';
import StandingsService from '../modules/standings/standings.service.js';

async function run() {
  try {
    AppDataSource.setOptions({ logging: false });
    await AppDataSource.initialize();
    console.log('Conexao com o banco estabelecida.');

    const championships = await AppDataSource.getRepository(Championship).find({
      order: { name: 'ASC' },
    });

    console.log(`Atualizando standings de ${championships.length} campeonatos...`);

    for (const championship of championships) {
      try {
        console.log(` -> ${championship.name} (${championship.apiEspnSlug})`);
        await StandingsService.updateStandings(championship.id);
      } catch (error) {
        console.error(`    Falha ao atualizar ${championship.name}:`, error);
      }
    }

    console.log('Atualizacao de standings finalizada.');
  } catch (error) {
    console.error('Erro critico ao atualizar standings:', error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Conexao com o banco fechada.');
    }
  }
}

run();
