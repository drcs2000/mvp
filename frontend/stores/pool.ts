import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

// Interface para os participantes de um bolão
interface Participant {
  userId: number;
  userName: string;
  role: string;
}

interface Pool {
  id: string;
  name: string;
  maxParticipants: number;
  participants: Participant[];
}

export const usePoolsStore = defineStore('pools', () => {
  // STATE
  const pools = ref<Pool[]>([]);
  const myPools = ref<Pool[]>([]); 
  const currentPool = ref<Pool | null>(null);

  // ACTIONS
  async function createPool(payload: any) {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated || !authStore.token) {
      const errorMsg = 'Você precisa estar logado para criar um torneio.';
      console.error(errorMsg);
      return { success: false, error: errorMsg, data: null };
    }

    try {
      const newPool = await $fetch<Pool>('/api/pool', {
        method: 'POST',
        body: payload,
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });

      pools.value.push(newPool);
      myPools.value.push(newPool);
      
      await navigateTo(`/pools/${newPool.id}`);

      return { success: true, error: null, data: newPool };
    } catch (error: any) {
      console.error('Erro ao criar o torneio:', error);
      return { success: false, error: error.data?.error || 'Erro desconhecido', data: null };
    }
  }

  async function fetchAllPublicPools() {
    try {
      const publicPools = await $fetch<Pool[]>('/api/pool');
      pools.value = publicPools;
      return { success: true, data: publicPools };
    } catch (error: any) {
      console.error('Erro ao buscar bolões públicos:', error);
      return { success: false, error: error.data?.error || 'Falha ao buscar torneios' };
    }
  }

  async function fetchMyPools() {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated || !authStore.token) {
      console.warn('Usuário não autenticado. Não é possível buscar "meus bolões".');
      return { success: false, error: 'Usuário não autenticado.' };
    }
    
    try {
      const userPools = await $fetch<Pool[]>('/api/pool/my-pools', {
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });
      myPools.value = userPools;
      return { success: true, data: userPools };
    } catch (error: any) {
      console.error('Erro ao buscar meus bolões:', error);
      return { success: false, error: error.data?.error || 'Falha ao buscar seus torneios' };
    }
  }

  return {
    pools,
    myPools,
    currentPool,
    createPool,
    fetchAllPublicPools,
    fetchMyPools,
  };
});

