import 'reflect-metadata';
import { AppDataSource } from '../database/data-source'
import { Match } from '../entities/match.entity';
import { Standings } from '../entities/standings.entity';
import { IsNull } from 'typeorm';

async function populateTeamIds(): Promise<void> {
    console.log('Iniciando o povoamento dos IDs das equipes na tabela de partidas...');

    await AppDataSource.initialize();

    const matchRepository = AppDataSource.getRepository(Match);
    const standingsRepository = AppDataSource.getRepository(Standings);

    const allStandings = await standingsRepository.find({
        select: ['teamName', 'teamApiId'],
    });

    const teamNameToIdMap = new Map<string, number>();
    allStandings.forEach(standing => {
        teamNameToIdMap.set(standing.teamName.toLowerCase(), standing.teamApiId);
    });

    const matchesToUpdate = await matchRepository.find({
        where: [
            { homeTeamApiId: IsNull() },
            { awayTeamApiId: IsNull() },
        ]
    });

    if (matchesToUpdate.length === 0) {
        console.log('Todas as partidas já têm os IDs das equipes. Nenhuma atualização necessária.');
        await AppDataSource.destroy();
        return;
    }

    const updatedMatches: Match[] = [];

    for (const match of matchesToUpdate) {
        let updated = false;

        if (match.homeTeamApiId === null || match.homeTeamApiId === undefined) {
            const homeTeamId = teamNameToIdMap.get(match.homeTeamName.toLowerCase());
            if (homeTeamId) {
                match.homeTeamApiId = homeTeamId;
                updated = true;
            } else {
                console.warn(`ID do time da casa não encontrado para: ${match.homeTeamName}`);
            }
        }

        if (match.awayTeamApiId === null || match.awayTeamApiId === undefined) {
            const awayTeamId = teamNameToIdMap.get(match.awayTeamName.toLowerCase());
            if (awayTeamId) {
                match.awayTeamApiId = awayTeamId;
                updated = true;
            } else {
                console.warn(`ID do time visitante não encontrado para: ${match.awayTeamName}`);
            }
        }

        if (updated) {
            updatedMatches.push(match);
        }
    }

    if (updatedMatches.length > 0) {
        await matchRepository.save(updatedMatches);
        console.log(`Povoamento concluído. ${updatedMatches.length} partidas foram atualizadas.`);
    } else {
        console.log('Nenhuma partida pôde ser atualizada.');
    }

    await AppDataSource.destroy();
}

populateTeamIds().catch(error => {
    console.error('Ocorreu um erro durante o povoamento:', error);
    AppDataSource.destroy();
});