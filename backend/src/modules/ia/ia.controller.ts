import { Request, Response } from 'express';
import IaService from './ia.service.js';

class IaController {
    public getTrainModel = async (req: Request, res: Response): Promise<Response> => {
        try {
            const trainingDataPackage = await IaService.getDataForTraining();
            return res.status(200).json(trainingDataPackage);
        } catch (error: any) {
            console.error('Falha ao buscar dados para o treinamento da IA:', error);
            return res.status(500).json({
                message: "Falha ao buscar o conjunto de dados de treinamento.",
                details: error.message
            });
        }
    }

    public predictMatch = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { homeTeamId, awayTeamId, championshipId } = req.params;

            const parsedHomeId = parseInt(homeTeamId, 10);
            const parsedAwayId = parseInt(awayTeamId, 10);
            const parsedChampId = parseInt(championshipId, 10);

            if (isNaN(parsedHomeId) || isNaN(parsedAwayId) || isNaN(parsedChampId)) {
                return res.status(400).json({ message: 'Os IDs dos times e do campeonato devem ser números válidos.' });
            }

            const prediction = await IaService.getPrediction(parsedHomeId, parsedAwayId, parsedChampId);

            return res.status(200).json(prediction);

        } catch (error: any) {
            // Log mais detalhado no seu terminal
            console.error('Falha ao processar a predição. Erro completo:', error);

            // Envia um detalhe mais útil na resposta da API
            const details = error.code || error.message || 'Erro desconhecido na comunicação com a IA.';

            return res.status(500).json({
                message: 'Falha ao obter a predição do serviço de IA.',
                details: details
            });
        }
    }
}

export default new IaController();