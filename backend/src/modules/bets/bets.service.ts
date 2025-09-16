import { AppDataSource } from '../../database/data-source'
import { Bet } from '../../entities/bet.entity'
import { Match } from '../../entities/match.entity'
import { Pool } from '../../entities/pool.entity'
import { PoolParticipant } from '../../entities/pool-participant.entity'

class BetsService {
  private betRepository = AppDataSource.getRepository(Bet)
  private matchRepository = AppDataSource.getRepository(Match)
  private poolRepository = AppDataSource.getRepository(Pool)
  private poolParticipantRepository = AppDataSource.getRepository(PoolParticipant)

  public async createOrUpdateBet(data: { userId: number, poolId: number, matchId: number, homeScoreBet: number, awayScoreBet: number }) {
    const { userId, poolId, matchId, homeScoreBet, awayScoreBet } = data

    const match = await this.matchRepository.findOneBy({ id: matchId })
    const pool = await this.poolRepository.findOneBy({ id: poolId })

    if (!match || !pool) {
      throw new Error("Partida ou bolão não encontrados.")
    }

    const matchDate = new Date(match.date)
    const deadline = new Date(matchDate.getTime() - (pool.betDeadlineHours * 60 * 60 * 1000))

    if (new Date() > deadline) {
      throw new Error("O prazo para palpitar neste jogo já encerrou.")
    }

    const existingBet = await this.betRepository.findOne({
      where: {
        user: { id: userId },
        pool: { id: poolId },
        match: { id: matchId },
      }
    })

    if (existingBet) {
      existingBet.homeScoreBet = homeScoreBet
      existingBet.awayScoreBet = awayScoreBet
      return this.betRepository.save(existingBet)
    } else {
      const newBet = this.betRepository.create({
        user: { id: userId },
        pool: { id: poolId },
        match: { id: matchId },
        homeScoreBet,
        awayScoreBet
      })
      return this.betRepository.save(newBet)
    }
  }

  public async findBets(filters: { userId?: number, poolId?: number }) {
    const { userId, poolId } = filters

    const whereClause: any = {}
    if (userId) {
      whereClause.user = { id: userId }
    }
    if (poolId) {
      whereClause.pool = { id: poolId }
    }

    return this.betRepository.find({
      where: whereClause,
      relations: ['match', 'pool'],
      order: {
        match: {
          date: 'ASC'
        }
      }
    })
  }

  public async findAllBetsByPool(poolId: number, userId: number) {
    const isParticipant = await this.poolParticipantRepository.findOne({
      where: {
        pool: { id: poolId },
        user: { id: userId },
      }
    })

    if (!isParticipant) {
      throw new Error("Você não é participante deste bolão.")
    }

    return this.betRepository.createQueryBuilder('bet')
      .leftJoinAndSelect('bet.user', 'user')
      .leftJoinAndSelect('bet.match', 'match')
      .where('bet.poolId = :poolId', { poolId })
      .orderBy('match.date', 'ASC')
      .getMany();
  }
}

export default new BetsService()