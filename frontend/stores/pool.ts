import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

interface Participant {
  userId: number;
  userName: string;
  role: string;
}

interface Pool {
  id: string;
  name: string;
  championshipId?: number; 
  maxParticipants: number;
  participants: Participant[];
}

interface ActionReturn {
  success: boolean;
  error: string | null;
  data: Pool | Pool[] | null;
}

export const usePoolsStore = defineStore('pools', () => {
  // STATE
  const pools = ref<Pool[]>([]);
  const myPools = ref<Pool[]>([]); 
  const currentPool = ref<Pool | null>(null);

  async function createPool(payload: any): Promise<ActionReturn> {
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
      const errorMessage = error.data?.error ?? 'Erro desconhecido';
      return { success: false, error: errorMessage, data: null };
    }
  }

  async function fetchAllPublicPools(): Promise<ActionReturn> {
    try {
      const publicPools = await $fetch<Pool[]>('/api/pool');
      pools.value = publicPools;
      return { success: true, error: null, data: publicPools };
    } catch (error: any) {
      console.error('Erro ao buscar bolões públicos:', error);
      const errorMessage = error.data?.error ?? 'Falha ao buscar torneios';
      return { success: false, error: errorMessage, data: null };
    }
  }

  async function fetchMyPools(): Promise<ActionReturn> {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated || !authStore.token) {
      console.warn('Usuário não autenticado. Não é possível buscar "meus bolões".');
      return { success: false, error: 'Usuário não autenticado.', data: null };
    }
    
    try {
      const userPools = await $fetch<Pool[]>('/api/pool/my-pools', {
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });
      myPools.value = userPools;
      return { success: true, error: null, data: userPools };
    } catch (error: any) {
      console.error('Erro ao buscar meus bolões:', error);
      const errorMessage = error.data?.error ?? 'Falha ao buscar seus torneios';
      return { success: false, error: errorMessage, data: null };
    }
  }

  async function fetchPoolById(poolId: string): Promise<ActionReturn> {
    try {
      const pool = await $fetch<Pool>(`/api/pool/${poolId}`);
      currentPool.value = pool;
      return { success: true, error: null, data: pool };
    } catch (error: any) {
      console.error('Erro ao buscar bolão por ID:', error);
      const errorMessage = error.data?.message ?? 'Falha ao buscar bolão';
      return { success: false, error: errorMessage, data: null };
    }
  }

  return {
    pools,
    myPools,
    currentPool,
    createPool,
    fetchAllPublicPools,
    fetchMyPools,
    fetchPoolById,
  };
});
