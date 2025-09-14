import { defineStore } from 'pinia';
import { ref } from 'vue';

interface Pool {
  id: string;
  name: string;
}

export const usePoolStore = defineStore('pools', () => {
  // STATE
  const pools = ref<Pool[]>([]);
  const currentPool = ref<Pool | null>(null);

  // ACTIONS
  async function createPool(payload: any) {
    try {
      const newPool = await $fetch<Pool>('/api/pool', {
        method: 'POST',
        body: payload,
      });

      pools.value.push(newPool);
      
      await navigateTo(`/tournaments/${newPool.id}`);

      return { success: true, error: null, data: newPool };
    } catch (error: any) {
      console.error('Erro ao criar o torneio:', error);
      return { success: false, error: error.data?.error || 'Erro desconhecido', data: null };
    }
  }

  return {
    pools,
    currentPool,
    createPool,
  };
});
