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
      const config = useRuntimeConfig();
      const apiBaseUrl = config.public.apiBaseUrl;

      if (!authStore.isAuthenticated || !authStore.token) {
        const errorMsg = 'Você precisa estar logado para ver os convites.';
        console.error(errorMsg);
        return { success: false, error: errorMsg, data: null };
      }

      this.isLoading = true;
      this.error = null;
      try {
        const url = import.meta.dev ? '/api/invitations/pending' : `${apiBaseUrl}/invitations/pending`;
        const invitations = await $fetch<Invitation[]>(url, {
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
      const config = useRuntimeConfig();
      const apiBaseUrl = config.public.apiBaseUrl;

      if (!authStore.isAuthenticated || !authStore.token) {
        const errorMsg = 'Você precisa estar logado para aceitar um convite.';
        console.error(errorMsg);
        return { success: false, error: errorMsg, data: null };
      }

      try {
        const url = import.meta.dev ? `/api/invitations/${invitationId}/accept` : `${apiBaseUrl}/invitations/${invitationId}/accept`;
        await $fetch(url, {
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
      const config = useRuntimeConfig();
      const apiBaseUrl = config.public.apiBaseUrl;

      if (!authStore.isAuthenticated || !authStore.token) {
        const errorMsg = 'Você precisa estar logado para recusar um convite.';
        console.error(errorMsg);
        return { success: false, error: errorMsg, data: null };
      }
      try {
        const url = import.meta.dev ? `/api/invitations/${invitationId}/decline` : `${apiBaseUrl}/invitations/${invitationId}/decline`;
        await $fetch(url, {
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
      const config = useRuntimeConfig();
      const apiBaseUrl = config.public.apiBaseUrl;

      if (!authStore.isAuthenticated || !authStore.token) {
        const errorMsg = 'Você precisa estar logado para enviar um convite.';
        console.error(errorMsg);
        return { success: false, error: errorMsg, data: null };
      }

      try {
        const url = import.meta.dev ? `/api/invitations/pools/${payload.poolId}/invitations` : `${apiBaseUrl}/invitations/pools/${payload.poolId}/invitations`;
        await $fetch(url, {
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
