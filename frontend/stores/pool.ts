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
  const config = useRuntimeConfig();
  const apiBaseUrl = config.public.apiBaseUrl;

  async function createPool(payload: CreatePoolPayload) {
    const authStore = useAuthStore();

    loading.value = true;
    error.value = null;
    try {
      const url = import.meta.dev ? '/api/pools' : `${apiBaseUrl}/pools`;
      const newPool = await $fetch<Pool>(url, {
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
      const url = import.meta.dev ? '/api/pools' : `${apiBaseUrl}/pools`;
      const data = await $fetch<Pool[]>(url);
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
      const url = import.meta.dev ? '/api/pools/my-pools' : `${apiBaseUrl}/pools/my-pools`;
      const data = await $fetch<Pool[]>(url, {
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
      const url = import.meta.dev ? `/api/pools/${poolId}` : `${apiBaseUrl}/pools/${poolId}`;
      const data = await $fetch<Pool>(url);
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
    const authStore = useAuthStore();
    loading.value = true;
    error.value = null;
    try {
      const url = import.meta.dev ? `/api/pools/${poolId}/join` : `${apiBaseUrl}/pools/${poolId}/join`;
      const updatedPool = await $fetch<Pool>(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
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
    const authStore = useAuthStore();
    loading.value = true;
    error.value = null;
    try {
      const url = import.meta.dev ? `/api/pools/${poolId}` : `${apiBaseUrl}/pools/${poolId}`;
      await $fetch(url, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });
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
    const authStore = useAuthStore();
    loading.value = true;
    error.value = null;
    try {
      const url = import.meta.dev ? `/api/pools/${poolId}/participants/${userId}` : `${apiBaseUrl}/pools/${poolId}/participants/${userId}`;
      await $fetch(url, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });
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
    const authStore = useAuthStore();
    loading.value = true;
    error.value = null;
    try {
      const url = import.meta.dev ? `/api/pools/${poolId}/${userId}/payment` : `${apiBaseUrl}/pools/${poolId}/${userId}/payment`;
      await $fetch(url, { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });
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
