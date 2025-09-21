import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

export interface Bet {
  id: number;
  userId: number;
  poolId: number;
  matchId: number;
  homeScoreBet: number;
  awayScoreBet: number;
  match: {
    id: number;
  };
  pool: {
    id: number;
  };
  user: {
    id: number;
  };
}

/**
 * Extrai de forma segura a mensagem de erro de uma resposta da API.
 * @param error O erro capturado.
 * @param defaultMessage A mensagem padrão a ser retornada se nenhuma mensagem for encontrada.
 * @returns A mensagem de erro.
 */
function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    typeof (error as { data: unknown }).data === 'object' &&
    (error as { data: unknown }).data !== null
  ) {
    const errorData = (error as { data: { message?: unknown } }).data;
    if (typeof errorData.message === 'string') {
      return errorData.message;
    }
  }
  return defaultMessage;
}

export const useBetsStore = defineStore('bets', () => {
  const bets = ref<Bet[]>([]);
  const allPoolBets = ref<{ [poolId: string]: Bet[] }>({}); 
  const loading = ref(false);

  /**
   * Busca palpites com base nos parâmetros fornecidos (userId, poolId).
   * @param params Objeto opcional para filtrar os palpites por `userId` ou `poolId`.
   * @returns Um objeto indicando sucesso ou falha, com os dados dos palpites ou uma mensagem de erro.
   */
  async function fetchBets(params?: { userId?: number; poolId?: number }) {
    const authStore = useAuthStore();
    loading.value = true;
    try {
      const fetchedBets = await $fetch<Bet[]>('/api/bets', {
        params,
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });
      bets.value = fetchedBets;
      return { success: true, data: fetchedBets };
    } catch (e: unknown) {
      console.error('Erro ao buscar palpites:', e);
      bets.value = [];
      const message = getErrorMessage(e, 'Falha ao buscar palpites');
      return { success: false, error: message };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Cria ou atualiza um palpite, atualizando os estados locais 'bets' e 'allPoolBets'.
   * @param poolId O ID do bolão.
   * @param matchId O ID da partida.
   * @param homeScoreBet O palpite de gols para o time da casa.
   * @param awayScoreBet O palpite de gols para o time visitante.
   * @returns Um objeto indicando sucesso ou falha, com os dados do palpite atualizado ou uma mensagem de erro.
   */
  async function createOrUpdateBet(poolId: number, matchId: number, homeScoreBet: number, awayScoreBet: number) {
    const authStore = useAuthStore();
    loading.value = true;
    try {
      const updatedBet = await $fetch<Bet>(`/api/bets/pools/${poolId}/matches/${matchId}`, {
        method: 'POST',
        body: {
          homeScoreBet,
          awayScoreBet,
        },
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });

      const existingBet = bets.value.find(bet => bet.matchId === matchId && bet.poolId === poolId);
      if (existingBet) {
        existingBet.homeScoreBet = updatedBet.homeScoreBet;
        existingBet.awayScoreBet = updatedBet.awayScoreBet;
      } else {
        await fetchBets({ poolId, userId: authStore.user?.id });
      }

      if (allPoolBets.value[poolId]) {
        const betIndexInPool = allPoolBets.value[poolId].findIndex(bet => bet.id === updatedBet.id);
        if (betIndexInPool !== -1) {
          allPoolBets.value[poolId][betIndexInPool] = updatedBet;
        } else {
          allPoolBets.value[poolId].push(updatedBet);
        }
      }

      return { success: true, data: updatedBet };
    } catch (e: unknown) {
      console.error('Erro ao salvar o palpite:', e);
      const message = getErrorMessage(e, 'Falha ao salvar palpite');
      return { success: false, error: message };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Busca todos os palpites de um bolão, utilizando 'allPoolBets' como cache.
   * @param poolId O ID do bolão.
   * @returns Um objeto indicando sucesso ou falha, com os dados dos palpites ou uma mensagem de erro.
   */
  async function fetchAllBetsByPool(poolId: string) {
    if (allPoolBets.value[poolId]) {
      return { success: true, data: allPoolBets.value[poolId] };
    }

    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      return { success: false, error: 'Você precisa estar logado para ver os palpites.' };
    }

    loading.value = true;
    try {
      const fetchedBets = await $fetch<Bet[]>(`/api/bets/pools/${poolId}`, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });

      allPoolBets.value[poolId] = fetchedBets;
      return { success: true, data: fetchedBets };
    } catch (e: unknown) {
      console.error('Erro ao buscar todos os palpites do bolão:', e);
      const message = getErrorMessage(e, 'Falha ao buscar palpites do bolão');
      return { success: false, error: message };
    } finally {
      loading.value = false;
    }
  }

  return {
    bets,
    allPoolBets,
    loading,
    fetchBets,
    createOrUpdateBet,
    fetchAllBetsByPool,
  };
});