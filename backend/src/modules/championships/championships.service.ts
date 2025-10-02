import { AppDataSource } from '../../database/data-source';
import {
  Championship,
  ChampionshipType,
} from '../../entities/championship.entity';
import {
  FindOptionsWhere
} from 'typeorm';

interface IEspnLeague {
  id: string;
  slug: string;
  name: string;
  abbreviation: string;
  isTournament: boolean;
  logos: { href: string; rel: string[] }[];
}

class ChampionshipService {
  private championshipRepository = AppDataSource.getRepository(Championship);

  public async sync(
    championshipsData: IEspnLeague[],
  ): Promise<{ created: number; updated: number; skipped: number }> {
    let createdCount = 0;
    let updatedCount = 0;

    for (const data of championshipsData) {
      let championship = await this.championshipRepository.findOneBy({
        apiEspnSlug: data.slug,
      });

      if (!championship) {
        championship = this.championshipRepository.create();
        createdCount++;
      } else {
        updatedCount++;
      }

      championship.apiEspnId = parseInt(data.id, 10);
      championship.apiEspnSlug = data.slug;
      championship.name = data.name;
      championship.abbreviation = data.abbreviation;
      championship.type = data.isTournament
        ? ChampionshipType.CUP
        : ChampionshipType.LEAGUE;

      const defaultLogo = data.logos.find((logo) =>
        logo.rel.includes('default'),
      );
      championship.logoUrl = defaultLogo ? defaultLogo.href : '';

      await this.championshipRepository.save(championship);
    }

    return { created: createdCount, updated: updatedCount, skipped: 0 };
  }

  /**
   * Retorna todos os campeonatos, com a opção de filtrar por tipo.
   */
  public async getAll(filters?: {
    type?: ChampionshipType;
  }): Promise<Championship[]> {
    const whereClause: FindOptionsWhere<Championship> = {};

    if (filters?.type) {
      whereClause.type = filters.type;
    }

    return this.championshipRepository.find({
      where: whereClause,
      order: {
        name: 'ASC',
      },
    });
  }

  public async getById(id: number): Promise<Championship | null> {
    return this.championshipRepository.findOneBy({ id });
  }
}

export default new ChampionshipService();