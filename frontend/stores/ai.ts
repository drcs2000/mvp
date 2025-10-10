import { defineStore } from 'pinia';
import { ref } from 'vue';

export type PredictionResult = {
  predicao_texto: string;
  placar_predito: string;
  home_score_predito: number;
  away_score_predito: number;
  codigo_predicao: number;
  probabilidades: {
    empate: number;
    vitoria_casa: number;
    vitoria_visitante: number;
  };
};

export const useAiStore = defineStore('ia', () => {
  const prediction = ref<PredictionResult | null>(null);
  const isLoading = ref(false);
  const error = ref<unknown | null>(null);

  const config = useRuntimeConfig();
  const apiBaseUrl = config.public.apiBaseUrl;


  /**
   * Busca uma predição da IA para uma partida específica.
   * @param homeTeamId ID do time da casa.
   * @param awayTeamId ID do time visitante.
   * @param championshipId ID do campeonato em que a partida ocorre.
   */
  async function fetchPrediction(homeTeamId: number, awayTeamId: number, championshipId: number) {
    isLoading.value = true;
    error.value = null;
    prediction.value = null;

    try {
      const url = import.meta.dev  ? `/api/ia/predict/${homeTeamId}/${awayTeamId}/${championshipId}`  : `${apiBaseUrl}/ia/predict/${homeTeamId}/${awayTeamId}/${championshipId}`;

      const result = await $fetch<PredictionResult>(url, {
        method: 'GET'
      });
      
      prediction.value = result;

    } catch (err: unknown) {
      console.error('Erro ao buscar predição da IA:', err);
      error.value = err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    prediction,
    isLoading,
    error,
    fetchPrediction,
  };
});