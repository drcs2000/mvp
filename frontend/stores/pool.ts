import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useMatchesStore } from '~/stores/matches';

interface Participant {
  userId: number;
  userName: string;
  role: string;
  paid: boolean; // Adicionado
}

interface PointSystem {
  full: number;
  partial: number;
  goal: number;
  result: number;
}

export interface Pool {
  id: string;
  name: string;
  baseChampionshipId: number;
  maxParticipants: number;
  participants: Participant[];
  private: boolean;
  points: PointSystem;
  entryFee: number;
}

interface CreatePoolPayload {
  name: string;
  maxParticipants: number;
  betDeadlineHours: number;
  baseChampionshipId: number;
  private: boolean;
  points: PointSystem;
  entryFee: number;
}

interface ActionReturn {
  success: boolean;
  error: string | null;
  data: Pool | Pool[] | null;
}

// Função auxiliar para extrair a mensagem de erro de forma segura
function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'data' in error &&
    typeof (error as { data: unknown }).data === 'object' &&
    (error as { data: unknown }).data !== null
  ) {
    const errorData = (error as { data: { message?: unknown, error?: unknown } }).data;
    if (typeof errorData.message === 'string') {
      return errorData.message;
    }
    if (typeof errorData.error === 'string') {
      return errorData.error;
    }
  }
  return defaultMessage;
}


export const usePoolsStore = defineStore('pools', () => {
  // STATE
  const pools = ref<Pool[]>([]);
  const myPools = ref<Pool[]>([]);
  const currentPool = ref<Pool | null>(null);
  const poolsCache = ref<{ [key: string]: Pool | undefined }>({});

  // Flags para controlar o estado do cache das listas de bolões
  const publicPoolsFetched = ref(false);
  const myPoolsFetched = ref(false);

  /**
   * Invalida o cache das listas de bolões para forçar uma nova busca na próxima chamada.
   */
  function invalidatePoolsCache() {
    publicPoolsFetched.value = false;
    myPoolsFetched.value = false;
  }

  /**
   * Cria um novo bolão e o armazena no estado.
   * @param payload Os dados para a criação do bolão.
   * @returns Um objeto com o resultado da operação e os dados do bolão criado.
   */
  async function createPool(payload: CreatePoolPayload): Promise<ActionReturn> {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated || !authStore.token || !authStore.user) {
      const errorMsg = 'Você precisa estar logado para criar um torneio.';
      console.error(errorMsg);
      return { success: false, error: errorMsg, data: null };
    }

    try {
      const fullPayload = { ...payload, userId: authStore.user.id };
      const newPool = await $fetch<Pool>('/api/pool', {
        method: 'POST',
        body: fullPayload,
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });

      pools.value.push(newPool);
      myPools.value.push(newPool);
      invalidatePoolsCache();

      await navigateTo(`/pools/${newPool.id}`);

      return { success: true, error: null, data: newPool };
    } catch (error: unknown) {
      console.error('Erro ao criar o torneio:', error);
      const errorMessage = getErrorMessage(error, 'Erro desconhecido');
      return { success: false, error: errorMessage, data: null };
    }
  }

  /**
   * Busca todos os bolões públicos disponíveis, utilizando cache para evitar requisições repetidas.
   * @returns A lista de bolões públicos.
   */
  async function fetchAllPublicPools(): Promise<ActionReturn> {
    if (publicPoolsFetched.value) {
      return { success: true, error: null, data: pools.value };
    }

    try {
      const publicPools = await $fetch<Pool[]>('/api/pool');
      pools.value = publicPools;
      publicPoolsFetched.value = true; // Marca que a busca foi feita
      return { success: true, error: null, data: publicPools };
    } catch (error: unknown) {
      console.error('Erro ao buscar bolões públicos:', error);
      const errorMessage = getErrorMessage(error, 'Falha ao buscar torneios');
      return { success: false, error: errorMessage, data: null };
    }
  }

  /**
   * Busca os bolões em que o usuário autenticado participa, utilizando cache.
   * @returns A lista de bolões do usuário.
   */
  async function fetchMyPools(): Promise<ActionReturn> {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated || !authStore.token) {
      return { success: false, error: 'Usuário não autenticado.', data: null };
    }

    if (myPoolsFetched.value) {
      return { success: true, error: null, data: myPools.value };
    }

    try {
      const userPools = await $fetch<Pool[]>('/api/pool/my-pools', {
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });
      myPools.value = userPools;
      myPoolsFetched.value = true;
      return { success: true, error: null, data: userPools };
    } catch (error: unknown) {
      console.error('Erro ao buscar meus bolões:', error);
      const errorMessage = getErrorMessage(error, 'Falha ao buscar seus torneios');
      return { success: false, error: errorMessage, data: null };
    }
  }

  /**
   * Busca um bolão específico pelo ID, utilizando cache.
   * @param poolId O ID do bolão.
   * @returns Os dados do bolão encontrado.
   */
  async function fetchPoolById(poolId: string): Promise<ActionReturn> {
    if (poolsCache.value[poolId]) {
      currentPool.value = poolsCache.value[poolId]!;
      return { success: true, error: null, data: currentPool.value };
    }

    try {
      const pool = await $fetch<Pool>(`/api/pool/${poolId}`);
      currentPool.value = pool;
      poolsCache.value[poolId] = pool; // Salva no cache
      return { success: true, error: null, data: pool };
    } catch (error: unknown) {
      console.error('Erro ao buscar bolão por ID:', error);
      const errorMessage = getErrorMessage(error, 'Falha ao buscar bolão');
      return { success: false, error: errorMessage, data: null };
    }
  }

  /**
   * Permite que o usuário autenticado entre em um bolão.
   * @param poolId O ID do bolão para entrar.
   * @returns Os dados do bolão atualizados com o novo participante.
   */
  async function joinPool(poolId: string): Promise<ActionReturn> {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated || !authStore.token) {
      return { success: false, error: 'Você precisa estar logado para entrar em um bolão.', data: null };
    }

    try {
      const joinedPool = await $fetch<Pool>(`/api/pool/${poolId}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      });

      if (!myPools.value.some(p => p.id === joinedPool.id)) {
        myPools.value.push(joinedPool);
      }
      if (currentPool.value?.id === joinedPool.id) {
        currentPool.value = joinedPool;
      }
      poolsCache.value[poolId] = joinedPool;
      invalidatePoolsCache();

      return { success: true, error: null, data: joinedPool };
    } catch (error: unknown) {
      console.error('Erro ao entrar no bolão:', error);
      const errorMessage = getErrorMessage(error, 'Erro desconhecido ao tentar entrar no bolão.');
      return { success: false, error: errorMessage, data: null };
    }
  }

  /**
   * Exclui um bolão. Apenas o criador pode realizar esta ação.
   * @param poolId O ID do bolão a ser excluído.
   * @returns Um objeto indicando o sucesso ou falha da operação.
   */
  async function deletePool(poolId: string): Promise<{ success: boolean; error: string | null }> {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated || !authStore.token) {
      return { success: false, error: 'Você precisa estar logado para excluir um bolão.' };
    }

    try {
      await $fetch(`/api/pool/${poolId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      });

      pools.value = pools.value.filter(p => p.id !== poolId);
      myPools.value = myPools.value.filter(p => p.id !== poolId);

      poolsCache.value[poolId] = undefined;
      if (currentPool.value?.id === poolId) {
        currentPool.value = null;
      }
      invalidatePoolsCache();

      return { success: true, error: null };
    } catch (error: unknown) {
      console.error('Erro ao excluir o bolão:', error);
      const errorMessage = getErrorMessage(error, 'Falha ao excluir o bolão.');
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Remove um participante de um bolão. Apenas o admin ou o próprio usuário podem fazer isso.
   * @param poolId O ID do bolão.
   * @param userId O ID do usuário a ser removido.
   * @returns Um objeto indicando o sucesso ou falha da operação.
   */
  async function removeParticipant(poolId: string, userId: number): Promise<{ success: boolean; error: string | null }> {
    const authStore = useAuthStore();
    const matchStore = useMatchesStore();

    if (!authStore.isAuthenticated || !authStore.token) {
      return { success: false, error: 'Você precisa estar logado para realizar esta ação.' };
    }

    try {
      await $fetch(`/api/pool/${poolId}/participants/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      });

      matchStore.matches = []

      const poolInCache = poolsCache.value[poolId];
      if (poolInCache) {
        poolInCache.participants = poolInCache.participants.filter(p => p.userId !== userId);
      }
      if (currentPool.value?.id === poolId) {
        currentPool.value.participants = currentPool.value.participants.filter(p => p.userId !== userId);
      }

      if (authStore.user?.id === userId) {
        myPools.value = myPools.value.filter(p => p.id !== poolId);
      }

      invalidatePoolsCache();

      return { success: true, error: null };
    } catch (error: unknown) {
      console.error('Erro ao remover participante:', error);
      const errorMessage = getErrorMessage(error, 'Falha ao remover o participante.');
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Confirma o pagamento de um participante. Apenas o admin pode fazer isso.
   * @param poolId O ID do bolão.
   * @param userId O ID do usuário a ser marcado como pago.
   * @returns Um objeto indicando o sucesso ou falha da operação.
   */
  async function confirmPayment(poolId: string, userId: number): Promise<{ success: boolean; error: string | null }> {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated || !authStore.token) {
      return { success: false, error: 'Você precisa estar logado para realizar esta ação.' };
    }

    try {
      await $fetch(`/api/pool/${poolId}/${userId}/payment`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      });

      const updateParticipantAsPaid = (pool: Pool) => {
        const participant = pool.participants.find(p => p.userId === userId);
        if (participant) {
          participant.paid = true;
        }
      };

      if (currentPool.value?.id === poolId) {
        updateParticipantAsPaid(currentPool.value);
      }
      const poolInCache = poolsCache.value[poolId];
      if (poolInCache) {
        updateParticipantAsPaid(poolInCache);
      }

      return { success: true, error: null };
    } catch (error: unknown) {
      console.error('Erro ao confirmar pagamento:', error);
      const errorMessage = getErrorMessage(error, 'Falha ao confirmar o pagamento.');
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
    removeParticipant,
    confirmPayment,
  };
});
