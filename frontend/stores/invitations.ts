import { defineStore } from 'pinia';
import { useAuthStore } from '~/stores/auth';

interface Inviter {
  id: number;
  name: string;
}

interface Pool {
  id: number;
  name: string;
}

interface Invitation {
  id: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'canceled';
  expiresAt: string;
  createdAt: string;
  pool: Pool;
  inviter: Inviter;
}

interface InvitationsState {
  pendingInvitations: Invitation[];
  isLoading: boolean;
  error: string | null;
}

interface CreateInvitationPayload {
  poolId: number;
  inviteeId: number;
}

export const useInvitationsStore = defineStore('invitations', {
  state: (): InvitationsState => ({
    pendingInvitations: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    invitations: (state) => state.pendingInvitations,
    invitationCount: (state) => state.pendingInvitations.length,
    loading: (state) => state.isLoading,
  },

  actions: {
    async fetchPendingInvitations() {
      if (this.isLoading) return;

      const authStore = useAuthStore();

      if (!authStore.isAuthenticated || !authStore.token) {
        const errorMsg = 'Você precisa estar logado para criar um torneio.';
        console.error(errorMsg);
        return { success: false, error: errorMsg, data: null };
      }

      this.isLoading = true;
      this.error = null;
      try {
        const invitations = await $fetch<Invitation[]>('/api/invitations/pending', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });
        this.pendingInvitations = invitations;
      } catch (error: unknown) {
        console.error('Erro ao buscar convites pendentes:', error);
        this.error = 'Não foi possível carregar os convites.';
        this.pendingInvitations = [];
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Aceita um convite.
     * @param invitationId O ID do convite a ser aceito.
     */
    async acceptInvitation(invitationId: string) {
      const authStore = useAuthStore();

      if (!authStore.isAuthenticated || !authStore.token) {
        const errorMsg = 'Você precisa estar logado para criar um torneio.';
        console.error(errorMsg);
        return { success: false, error: errorMsg, data: null };
      }

      try {
        await $fetch(`/api/invitations/${invitationId}/accept`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });

        this.pendingInvitations = this.pendingInvitations.filter(
          (inv) => inv.id !== invitationId
        );
        return { success: true, error: null };
      } catch (error: unknown) {
        console.error('Erro ao aceitar convite:', error);
        const errorMessage = (error && typeof error === 'object' && 'data' in error)
          ? (error as { data: { message: string } }).data.message
          : 'Não foi possível aceitar o convite.';
        return { success: false, error: errorMessage };
      }
    },

    /**
     * Recusa um convite.
     * @param invitationId O ID do convite a ser recusado.
     */
    async declineInvitation(invitationId: string) {
      const authStore = useAuthStore();

      if (!authStore.isAuthenticated || !authStore.token) {
        const errorMsg = 'Você precisa estar logado para criar um torneio.';
        console.error(errorMsg);
        return { success: false, error: errorMsg, data: null };
      }
      try {
        await $fetch(`/api/invitations/${invitationId}/decline`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });

        // Remove o convite da lista local
        this.pendingInvitations = this.pendingInvitations.filter(
          (inv) => inv.id !== invitationId
        );
        return { success: true, error: null };
      } catch (error: unknown) {
        console.error('Erro ao recusar convite:', error);
        const errorMessage = (error && typeof error === 'object' && 'data' in error)
          ? (error as { data: { message: string } }).data.message
          : 'Não foi possível recusar o convite.';
        return { success: false, error: errorMessage };
      }
    },

    /**
     * Cria e envia um novo convite para outro usuário.
     * @param payload Contém o poolId e o inviteeId.
     */
    async createInvitation(payload: CreateInvitationPayload) {
      const authStore = useAuthStore();

      if (!authStore.isAuthenticated || !authStore.token) {
        const errorMsg = 'Você precisa estar logado para criar um torneio.';
        console.error(errorMsg);
        return { success: false, error: errorMsg, data: null };
      }

      try {
        await $fetch(`/api/invitations/pools/${payload.poolId}/invitations`, {
          method: 'POST',
          body: { inviteeId: payload.inviteeId },
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });
        return { success: true, error: null };
      } catch (error: unknown) {
        console.error('Erro ao criar convite:', error);
        const errorMessage = (error && typeof error === 'object' && 'data' in error)
          ? (error as { data: { message: string } }).data.message
          : 'Não foi possível enviar o convite.';
        return { success: false, error: errorMessage };
      }
    },
  },
});