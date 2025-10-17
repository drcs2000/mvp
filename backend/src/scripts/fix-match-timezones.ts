// src/scripts/force-resync-all-dates.ts
import 'dotenv/config';
import { AppDataSource } from '../database/data-source.js';
import ExternalApiService, { IEspnEvent } from '../services/external-api.service.js';
import { Match } from '../entities/match.entity.js';
import { Championship } from '../entities/championship.entity.js';
import { Standings } from '../entities/standings.entity.js';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runForceResyncScript() {
  console.log('🚀 INICIANDO SCRIPT DE FORÇA-BRUTA PARA SINCRONIZAÇÃO DE DATAS...');
  console.warn('AVISO: Este script irá sobrescrever TODAS as datas de jogos com os valores da API da ESPN.');

  try {
    await AppDataSource.initialize();
    console.log('✅ Conexão com o banco de dados estabelecida.');

    const championshipRepository = AppDataSource.getRepository(Championship);
    const standingsRepository = AppDataSource.getRepository(Standings);
    const matchRepository = AppDataSource.getRepository(Match);
    
    // 1. Busca todos os campeonatos
    const championships = await championshipRepository.find();
    console.log(`[!] Encontrados ${championships.length} campeonatos para processar.`);

    for (const championship of championships) {
      console.log(`\n--- Processando ${championship.name} ---`);
      
      // 2. Busca todos os times para o campeonato
      const teamsInStandings = await standingsRepository.find({
        where: { championship: { id: championship.id } },
      });
      
      if (!teamsInStandings || teamsInStandings.length === 0) {
        console.log(` -> Nenhum time na classificação. Pulando.`);
        continue;
      }
      
      const allEventsMap = new Map<string, IEspnEvent>();

      // 3. Busca o calendário completo (passado e futuro) de cada time
      for (const team of teamsInStandings) {
        const teamScheduleEvents = await ExternalApiService.getScheduleForTeam(
          championship.apiEspnSlug,
          String(team.teamEspnId)
        );
        for (const event of teamScheduleEvents) {
          allEventsMap.set(event.id, event);
        }
        await sleep(250);
      }
      
      const uniqueEvents = Array.from(allEventsMap.values());
      if (uniqueEvents.length === 0) {
        console.log(` -> Nenhum evento encontrado na API para este campeonato.`);
        continue;
      }
      console.log(` -> ${uniqueEvents.length} eventos únicos encontrados na API.`);

      // 4. Busca TODAS as partidas do campeonato no nosso banco
      const existingMatches = await matchRepository.find({ where: { championship: { id: championship.id } } });
      const existingMatchesMap = new Map(existingMatches.map(m => [m.apiEspnId, m]));

      const matchesToUpdate: Match[] = [];

      // 5. O CORAÇÃO DA LÓGICA: Compara e atualiza
      for (const event of uniqueEvents) {
        const eventId = parseInt(event.id, 10);
        const existingMatch = existingMatchesMap.get(eventId);
        const apiDate = new Date(event.date); // A data UTC correta da API

        if (existingMatch) {
          // Se o jogo existe, verifica se a data no banco é diferente da data da API
          if (existingMatch.date.getTime() !== apiDate.getTime()) {
            console.log(`  -> CORRIGINDO DATA para o jogo ${eventId}: ${existingMatch.date.toISOString()} -> ${apiDate.toISOString()}`);
            existingMatch.date = apiDate;
            matchesToUpdate.push(existingMatch);
          }
        } else {
          // Se o jogo não existe, ele será criado pela função updateMatches
          // (aqui estamos focando apenas em corrigir datas existentes)
        }
      }

      if (matchesToUpdate.length > 0) {
        console.log(` -> ${matchesToUpdate.length} datas de jogos serão corrigidas...`);
        await matchRepository.save(matchesToUpdate);
        console.log(` -> Datas corrigidas com sucesso.`);
      } else {
        console.log(` -> Nenhuma data precisou de correção para este campeonato.`);
      }
    }

    console.log('\n🎉 Script de sincronização de datas concluído!');

  } catch (error) {
    console.error('❌ Ocorreu um erro crítico durante a execução do script:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Conexão com o banco de dados fechada.');
    }
  }
}

runForceResyncScript();