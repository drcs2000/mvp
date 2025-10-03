import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

type ChampionshipReference = {
  id: number;
  name: string;
  logoUrl: string;
};

type Participant = {
  userId: number;
  userName: string;
  role: 'admin' | 'member';
  paid: boolean;
};

type PointsSystem = {
  full: number;
  partial: number;
  goal: number;
  result: number;
};

export type Pool = {
  id: string; // Hashid
  name: string;
  maxParticipants: number;
  betDeadlineHours: number;
  baseChampionship: ChampionshipReference;
  private: boolean;
  points: PointsSystem;
  entryFee: number;
  createdAt: string;
  participants: Participant[];
};

export type CreatePoolPayload = Omit<Pool, 'id' | 'createdAt' | 'participants' | 'baseChampionship'> & {
  baseChampionshipId: number;
};

export const usePoolsStore = defineStore('pools', () => {
  const publicPools = ref<Pool[]>([]);
  const myPools = ref<Pool[]>([]);
  const currentPool = ref<Pool | null>(null);
  const loading = ref(false);
  const error = ref<unknown | null>(null);

  async function createPool(payload: CreatePoolPayload) {
      const authStore = useAuthStore();
      
    loading.value = true;
    error.value = null;
    try {
      const newPool = await $fetch<Pool>('/api/pools', {
        method: 'POST',
        body: payload,
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });
      myPools.value.push(newPool);
      if (!newPool.private) {
        publicPools.value.push(newPool);
      }
      return newPool;
    } catch (err: unknown) {
      error.value = err;
      console.error('Erro ao criar o bolão:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchAllPublicPools(force = false) {
    if (publicPools.value.length > 0 && !force) {
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch<Pool[]>('/api/pools');
      publicPools.value = data;
    } catch (err: unknown) {
      error.value = err;
      console.error('Erro ao buscar bolões públicos:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchMyPools(force = false) {
      const authStore = useAuthStore();

    if (myPools.value.length > 0 && !force) {
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch<Pool[]>('/api/pools/my-pools', {
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });
      myPools.value = data;
    } catch (err: unknown) {
      error.value = err;
      myPools.value = [];
      console.error('Erro ao buscar meus bolões:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchPoolById(poolId: string) {
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch<Pool>(`/api/pools/${poolId}`);
      currentPool.value = data;
      return data;
    } catch (err: unknown) {
      error.value = err;
      console.error('Erro ao buscar bolão por ID:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function joinPool(poolId: string) {
    loading.value = true;
    error.value = null;
    try {
      const updatedPool = await $fetch<Pool>(`/api/pools/${poolId}/join`, {
        method: 'POST',
      });
      if (currentPool.value?.id === poolId) {
        currentPool.value = updatedPool;
      }
      if (!myPools.value.some(p => p.id === updatedPool.id)) {
        myPools.value.push(updatedPool);
      }
      return updatedPool;
    } catch (err: unknown) {
      error.value = err;
      console.error('Erro ao entrar no bolão:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deletePool(poolId: string) {
    loading.value = true;
    error.value = null;
    try {
      await $fetch(`/api/pools/${poolId}`, { method: 'DELETE' });
      publicPools.value = publicPools.value.filter(p => p.id !== poolId);
      myPools.value = myPools.value.filter(p => p.id !== poolId);
      if (currentPool.value?.id === poolId) {
        currentPool.value = null;
      }
    } catch (err: unknown) {
      error.value = err;
      console.error('Erro ao excluir o bolão:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function removeParticipant(poolId: string, userId: number) {
    loading.value = true;
    error.value = null;
    try {
      await $fetch(`/api/pools/${poolId}/participants/${userId}`, { method: 'DELETE' });
      if (currentPool.value?.id === poolId) {
        currentPool.value.participants = currentPool.value.participants.filter(p => p.userId !== userId);
      }
    } catch (err: unknown) {
      error.value = err;
      console.error('Erro ao remover participante:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function confirmPayment(poolId: string, userId: number) {
    loading.value = true;
    error.value = null;
    try {
      await $fetch(`/api/pools/${poolId}/${userId}/payment`, { method: 'POST' });
      if (currentPool.value?.id === poolId) {
        const participant = currentPool.value.participants.find(p => p.userId === userId);
        if (participant) {
          participant.paid = true;
        }
      }
    } catch (err: unknown) {
      error.value = err;
      console.error('Erro ao confirmar pagamento:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    publicPools,
    myPools,
    currentPool,
    loading,
    error,
    createPool,
    fetchAllPublicPools,
    fetchMyPools,
    fetchPoolById,
    joinPool,
    deletePool,
    removeParticipant,
    confirmPayment,
  };
});