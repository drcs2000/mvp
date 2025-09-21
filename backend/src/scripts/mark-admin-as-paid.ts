import 'reflect-metadata';
import { AppDataSource } from '../database/data-source';
import { PoolParticipant, PoolRole } from '../entities/pool-participant.entity';
import { Not } from 'typeorm';

async function markAdminsAsPaid(): Promise<void> {
  console.log('🚀 Iniciando script para marcar administradores de bolão como pagos...');

  try {
    await AppDataSource.initialize();
    console.log('Conexão com o banco de dados estabelecida.');

    const participantRepository = AppDataSource.getRepository(PoolParticipant);

    const adminsToUpdate = await participantRepository.find({
      where: {
        role: PoolRole.ADMIN,
        paid: Not(true),
      },
    });

    if (adminsToUpdate.length === 0) {
      console.log('✅ Nenhum administrador precisava de atualização. Tudo certo!');
      return;
    }

    console.log(`Encontrados ${adminsToUpdate.length} administrador(es) para atualizar...`);

    for (const admin of adminsToUpdate) {
      admin.paid = true;
    }

    await participantRepository.save(adminsToUpdate);
    console.log(`\n🎉 Sucesso! ${adminsToUpdate.length} administrador(es) foram marcados como pagos.`);

  } catch (error) {
    console.error('❌ Ocorreu um erro durante a execução do script:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Conexão com o banco de dados encerrada.');
    }
  }
}

markAdminsAsPaid();
