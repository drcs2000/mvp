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

  async function joinPool(poolId: string): Promise<ActionReturn> {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated || !authStore.token) {
      const errorMsg = 'Você precisa estar logado para entrar em um bolão.';
      return { success: false, error: errorMsg, data: null };
    }

    try {
      const joinedPool = await $fetch<Pool>(`/api/pool/${poolId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });

      const isAlreadyInMyPools = myPools.value.some(p => p.id === joinedPool.id);
      if (!isAlreadyInMyPools) {
        myPools.value.push(joinedPool);
      }

      if (currentPool.value?.id === joinedPool.id) {
        currentPool.value = joinedPool;
      }

      return { success: true, error: null, data: joinedPool };
    } catch (error: any) {
      console.error('Erro ao entrar no bolão:', error);
      const errorMessage = error.data?.error ?? 'Erro desconhecido ao tentar entrar no bolão.';
      return { success: false, error: errorMessage, data: null };
    }
  }

  async function deletePool(poolId: string): Promise<{ success: boolean; error: string | null }> {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated || !authStore.token) {
      const errorMsg = 'Você precisa estar logado para excluir um bolão.';
      return { success: false, error: errorMsg };
    }

    try {
      await $fetch(`/api/pool/${poolId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });

      pools.value = pools.value.filter(p => p.id !== poolId);
      myPools.value = myPools.value.filter(p => p.id !== poolId);

      if (currentPool.value?.id === poolId) {
        currentPool.value = null;
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Erro ao excluir o bolão:', error);
      const errorMessage = error.data?.error ?? 'Falha ao excluir o bolão.';
      return { success: false, error: errorMessage };
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
    joinPool,
    deletePool,
  };
});
