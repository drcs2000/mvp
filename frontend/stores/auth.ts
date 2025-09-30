import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';

// Descreve os dados de um usuário decodificado do token
interface User {
  id: number;
  name: string;
  email: string;
  // Adicione outras propriedades do token se houver (ex: exp, iat)
}

// Descreve os dados necessários para o login
interface LoginPayload {
  email: string;
  password: string;
}

// Descreve os dados necessários para o registro
interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

// Respostas esperadas da API
interface LoginResponse {
  token: string;
}
interface RegisterResponse {
  token: string;
  user: User;
}

// Estrutura do estado da store
interface AuthState {
  token: string | null;
  user: User | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    currentUser: (state) => state.user,
  },

  actions: {
    /**
     * Ação interna para limpar o estado de autenticação e o localStorage.
     */
    _clearState() {
      this.token = null;
      this.user = null;
      if (import.meta.client) {
        localStorage.removeItem('auth-token');
      }
    },

    /**
     * Define o estado de autenticação a partir de um token.
     * @param token O token JWT ou null para limpar o estado.
     */
    _setStateFromToken(token: string | null) {
      if (!token) {
        return this._clearState();
      }

      this.token = token;
      if (import.meta.client) {
        localStorage.setItem('auth-token', token);
      }

      try {
        const decodedUser = jwtDecode<User>(token);
        this.user = decodedUser;
      } catch (error) {
        console.error("Token inválido:", error);
        this._clearState(); // Limpa o estado se o token for inválido
      }
    },

    /**
     * Registra um novo usuário.
     * @param payload Dados de registro do usuário.
     */
    async register(payload: RegisterPayload) {
      try {
        const { token } = await $fetch<RegisterResponse>('/api/auth/register', {
          method: 'POST',
          body: payload,
        });

        this._setStateFromToken(token);

        await navigateTo('/');
        return { success: true, error: null };
      } catch (error: unknown) {
        console.error('Erro no registro:', error);
        // Type guard para acessar 'data' de forma segura
        const errorMessage = (error && typeof error === 'object' && 'data' in error)
          ? (error as { data: { error: string } }).data.error
          : 'Erro desconhecido'
        return { success: false, error: errorMessage };
      }
    },

    /**
     * Realiza o login do usuário.
     * @param payload Credenciais de login.
     */
    async login(payload: LoginPayload) {
      try {
        const { token } = await $fetch<LoginResponse>('/api/auth/login', {
          method: 'POST',
          body: payload,
        });

        this._setStateFromToken(token);

        await navigateTo('/');
        return { success: true, error: null };
      } catch (error: unknown) {
        console.error('Erro no login:', error);
        const errorMessage = (error && typeof error === 'object' && 'data' in error)
          ? (error as { data: { error: string } }).data.error
          : 'Erro desconhecido';
        return { success: false, error: errorMessage };
      }
    },

    /**
     * Desloga o usuário.
     */
    async logout() {
      this._clearState();
    },

    /**
     * Inicializa o estado de autenticação a partir do localStorage.
     * Deve ser chamada em um plugin ou no onMounted do App.vue.
     */
    initializeAuth() {
      if (import.meta.client) {
        const token = localStorage.getItem('auth-token');
        if (token) {
          this._setStateFromToken(token);
        }
      }
    }
  },
});