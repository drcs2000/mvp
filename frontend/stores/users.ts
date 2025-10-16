import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

type UserBetSummary = {
  poolName: string;
  matchDescription: string;
  matchDate: string;
  betPlaced: string;
  result: string | null;
  pointsEarned: number | null;
};

type UserPoolSummary = {
  id: number;
  name: string;
  role: 'admin' | 'participant';
  totalPoints: number;
  bets: UserBetSummary[];
};

type UserStats = {
  totalPools: number;
  totalBets: number;
  totalPoints: number;
};

type UserInvitationSummary = {
  poolName: string;
  relatedUserName: string;
  status: 'pending' | 'accepted' | 'expired' | 'declined' | 'canceled';
  createdAt: string;
};

export interface UserProfileDetails {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  pools: UserPoolSummary[];
  stats: UserStats;
  invitations: {
    sent: UserInvitationSummary[];
    received: UserInvitationSummary[];
  };
  first_access: boolean;
  first_bet: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
}

interface ApiError {
  data?: {
    message?: string;
  };
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([]);
  const myProfile = ref<UserProfileDetails | null>(null);
  const isLoading = ref(false);
  const config = useRuntimeConfig();
  const apiBaseUrl = config.public.apiBaseUrl;

  async function fetchAllUsers() {
    const authStore = useAuthStore();

    if (users.value.length > 0) return;

    isLoading.value = true;
    try {
      const url = import.meta.dev ? '/api/users' : `${apiBaseUrl}/users`;
      const allUsers = await $fetch<User[]>(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });

      users.value = allUsers;
    } catch (error: unknown) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchMyProfile(forceRefresh: boolean = false) {
    if (myProfile.value && !forceRefresh) {
      return { success: true, data: myProfile.value };
    }

    isLoading.value = true;
    const authStore = useAuthStore();

    if (!authStore.user?.id) {
      isLoading.value = false;
      return { success: false, error: 'Usuário não autenticado.' };
    }

    const myId = authStore.user.id;

    try {
      const url = import.meta.dev ? `/api/users/${myId}` : `${apiBaseUrl}/users/${myId}`;
      const profileData = await $fetch<UserProfileDetails>(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });

      myProfile.value = profileData;
      return { success: true, data: profileData };
    } catch (error: unknown) {
      console.error(`Erro ao buscar perfil do usuário ${myId}:`, error);
      const apiError = error as ApiError;
      const errorMessage = apiError.data?.message || 'Falha ao carregar o seu perfil.';
      return { success: false, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Atualiza os dados do perfil do usuário logado.
   * @param payload - Os dados a serem atualizados.
   */
  async function updateMyProfile(payload: UpdateProfilePayload) {
    isLoading.value = true;
    const authStore = useAuthStore();

    if (!authStore.user?.id) {
      isLoading.value = false;
      return { success: false, error: 'Usuário não autenticado.' };
    }

    const myId = authStore.user.id;

    try {
      const url = import.meta.dev ? `/api/users/${myId}` : `${apiBaseUrl}/users/${myId}`;
      const updatedProfile = await $fetch<UserProfileDetails>(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        },
        body: payload
      });

      myProfile.value = updatedProfile;

      return { success: true, data: updatedProfile };
    } catch (error: unknown) {
      console.error(`Erro ao atualizar perfil do usuário ${myId}:`, error);
      const apiError = error as ApiError;
      const errorMessage = apiError.data?.message || 'Falha ao atualizar o perfil.';
      return { success: false, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateAccessFlag(field: 'firstAccess' | 'firstBet') {
    isLoading.value = true;
    const authStore = useAuthStore();

    if (!authStore.token) {
      isLoading.value = false;
      return { success: false, error: 'Usuário não autenticado.' };
    }

    try {
      const url = import.meta.dev ? '/api/users' : `${apiBaseUrl}/users`;
      const updatedProfile = await $fetch<UserProfileDetails>(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        },
        body: {
          fieldToUpdate: field
        }
      });

      myProfile.value = updatedProfile;

      return { success: true, data: updatedProfile };
    } catch (error: unknown) {
      console.error(`Erro ao atualizar a flag '${field}':`, error);
      const apiError = error as ApiError;
      const errorMessage = apiError.data?.message || `Falha ao atualizar a flag ${field}.`;
      return { success: false, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  }

  return {
    users,
    myProfile,
    isLoading,
    fetchAllUsers,
    fetchMyProfile,
    updateMyProfile,
    updateAccessFlag
  };
});

