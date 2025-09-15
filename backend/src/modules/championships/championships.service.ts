import { AppDataSource } from '../../database/data-source';
import { Championship, ChampionshipType } from '../../entities/championship.entity';

class ChampionshipService {
  private championshipRepository = AppDataSource.getRepository(Championship);

  public async seed(championshipsData: any[]): Promise<{ created: number, skipped: number }> {
    let createdCount = 0;
    let skippedCount = 0;

    for (const data of championshipsData) {
      const { league, country, apiEspnId, apiEspnSlug } = data;

      const existingChampionship = await this.championshipRepository.findOneBy({
        apiFootballId: league.id,
      });

      if (existingChampionship) {
        skippedCount++;
        continue;
      }

      const newChampionship = this.championshipRepository.create({
        apiFootballId: league.id,
        apiEspnId: apiEspnId || null,
        apiEspnSlug: apiEspnSlug || null,
        name: league.name,
        type: league.type as ChampionshipType,
        leagueLogoUrl: league.logo,
        countryName: country.name,
        countryFlagUrl: country.flag,
      });

      await this.championshipRepository.save(newChampionship);
      createdCount++;
    }

    return { created: createdCount, skipped: skippedCount };
  }

  public async getAll(): Promise<Championship[]> {
    return this.championshipRepository.find();
  }
}

export default new ChampionshipService();
