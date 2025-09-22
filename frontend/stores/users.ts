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


export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([]);
  const myProfile = ref<UserProfileDetails | null>(null);
  const isLoading = ref(false);

  async function fetchAllUsers() {
    const authStore = useAuthStore();

    if (users.value.length > 0) return;

    isLoading.value = true;
    try {
      const allUsers = await $fetch<User[]>('/api/users', {
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
      const profileData = await $fetch<UserProfileDetails>(`/api/users/${myId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      });

      myProfile.value = profileData;
      return { success: true, data: profileData };
    } catch (error: any) {
      console.error(`Erro ao buscar perfil do usuário ${myId}:`, error);
      const errorMessage = error.data?.message || 'Falha ao carregar o seu perfil.';
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
      const updatedProfile = await $fetch<UserProfileDetails>(`/api/users/${myId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        },
        body: payload
      });

      myProfile.value = updatedProfile;

      return { success: true, data: updatedProfile };
    } catch (error: any) {
      console.error(`Erro ao atualizar perfil do usuário ${myId}:`, error);
      const errorMessage = error.data?.message || 'Falha ao atualizar o perfil.';
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
  };
});