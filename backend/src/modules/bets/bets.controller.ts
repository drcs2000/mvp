import { Request, Response } from 'express'
import BetsService from './bets.service'
import { decodeId } from '../../utils/hashid.helper'

class BetsController {
  public createOrUpdateBet = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado." })
      }

      const { poolId, matchId } = req.params
      const { homeScoreBet, awayScoreBet } = req.body

      if (homeScoreBet === undefined || awayScoreBet === undefined) {
        return res.status(400).json({ message: "Placares para casa (homeScoreBet) e visitante (awayScoreBet) são obrigatórios." })
      }

      const decodedPoolId = decodeId(poolId)
      if (decodedPoolId === null) {
        return res.status(400).json({ message: "ID do bolão inválido." })
      }

      const betData = {
        userId,
        poolId: decodedPoolId,
        matchId: Number(matchId),
        homeScoreBet: Number(homeScoreBet),
        awayScoreBet: Number(awayScoreBet),
      }

      const result = await BetsService.createOrUpdateBet(betData)
      return res.status(200).json(result)
    } catch (error: any) {
      console.error(error)
      if (error.message.includes("prazo")) {
        return res.status(403).json({ message: error.message })
      }
      return res.status(500).json({ message: "Falha ao salvar o palpite." })
    }
  }

  public getBets = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { userId, poolId } = req.query
      const loggedInUserId = req.user?.id

      let decodedPoolId = undefined
      if (poolId) {
        decodedPoolId = decodeId(String(poolId))
        if (decodedPoolId === null) {
          return res.status(400).json({ message: "ID do bolão inválido." })
        }
      }

      const filters = {
        userId: userId ? Number(userId) : loggedInUserId,
        poolId: decodedPoolId,
      }

      const bets = await BetsService.findBets(filters)
      return res.status(200).json(bets)
    } catch (error: any) {
      console.error(error)
      return res.status(500).json({ message: "Falha ao buscar os palpites." })
    }
  }

  public getAllBetsByPool = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { poolId } = req.params

      const decodedPoolId = decodeId(poolId)
      if (decodedPoolId === null) {
        return res.status(400).json({ message: "ID do bolão inválido." })
      }

      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado." })
      }

      const bets = await BetsService.findAllBetsByPool(decodedPoolId, userId)
      return res.status(200).json(bets)

    } catch (error: any) {
      console.error(error)
      if (error.message.includes("não é participante")) {
        return res.status(403).json({ message: error.message })
      }
      return res.status(500).json({ message: "Falha ao buscar os palpites do bolão." })
    }
  }

  public syncPoolPoints = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { poolId } = req.params

      const decodedPoolId = decodeId(poolId)
      if (decodedPoolId === null) {
        return res.status(400).json({ message: "ID do bolão inválido." })
      }

      await BetsService.syncPoolPoints(decodedPoolId)

      return res.status(200).json({ message: "Pontuações do bolão sincronizadas com sucesso." })
    } catch (error: any) {
      console.error(error)
      // Pode ser útil ter mensagens de erro mais específicas vindas do serviço
      if (error.message.includes("Bolão não encontrado")) {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes("API externa indisponível")) {
        return res.status(503).json({ message: error.message });
      }
      return res.status(500).json({ message: "Ocorreu um erro ao sincronizar as pontuações." })
    }
  }
}

export default new BetsController()