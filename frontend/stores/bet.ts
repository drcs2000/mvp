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
  // A bet object from the server has nested properties
  match: {
    id: number;
    // ...other match properties
  };
  pool: {
    id: number;
    // ...other pool properties
  };
}

export const useBetsStore = defineStore('bets', () => {
  const bets = ref<Bet[]>([]);
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

      // Find the bet in the local state
      const existingBet = bets.value.find(bet => bet.matchId === matchId && bet.poolId === poolId);

      // If the bet exists, just update its score properties
      if (existingBet) {
        existingBet.homeScoreBet = updatedBet.homeScoreBet;
        existingBet.awayScoreBet = updatedBet.awayScoreBet;
      } else {
        // If the bet doesn't exist, we need to fetch it to get the nested 'match' object
        // The simple fix is to refetch all bets to ensure everything is in sync
        await fetchBets({ poolId });
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

  return {
    bets,
    loading,
    fetchBets,
    createOrUpdateBet,
  };
});