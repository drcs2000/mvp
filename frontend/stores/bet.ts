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

export const useBetsStore = defineStore('bets', () => {
  const bets = ref<Bet[]>([]);
  const allPoolBets = ref<{ [poolId: string]: Bet[] }>({});
  const loading = ref(false);

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
    } catch (error: any) {
      console.error('Erro ao buscar palpites:', error);
      bets.value = [];
      return { success: false, error: error.data?.message || 'Falha ao buscar palpites' };
    } finally {
      loading.value = false;
    }
  }

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
        await fetchBets({ poolId });
      }

      if (allPoolBets.value && allPoolBets.value[poolId]) {
        const betIndexInPool = allPoolBets.value[poolId].findIndex(bet => bet.matchId === matchId);
        if (betIndexInPool !== -1) {
          allPoolBets.value[poolId][betIndexInPool] = updatedBet;
        } else {
          allPoolBets.value[poolId].push(updatedBet);
        }
      }

      return { success: true, data: updatedBet };
    } catch (error: any) {
      console.error('Erro ao salvar o palpite:', error);
      const errorMessage = error.data?.message || 'Falha ao salvar palpite';
      return { success: false, error: errorMessage };
    } finally {
      loading.value = false;
    }
  }
  
  async function fetchAllBetsByPool(poolId: string) {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated || !authStore.token) {
      const errorMsg = 'Você precisa estar logado para ver os palpites.';
      return { success: false, error: errorMsg, data: null };
    }

    loading.value = true;
    try {
      const fetchedBets = await $fetch<Bet[]>(`/api/bets/pools/${poolId}`, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });
      
      if (!allPoolBets.value) {
        allPoolBets.value = {};
      }
      allPoolBets.value[poolId] = fetchedBets;

      return { success: true, data: fetchedBets };
    } catch (error: any) {
      console.error('Erro ao buscar todos os palpites do bolão:', error);
      const errorMessage = error.data?.message || 'Falha ao buscar palpites do bolão';
      return { success: false, error: errorMessage, data: null };
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