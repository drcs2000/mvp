import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  name: string;
  email: string;
}
interface LoginResponse {
  token: string;
}
interface RegisterResponse {
  token: string;
  user: User;
}

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
    _setToken(token: string | null) {
      if (!token) {
        this.token = null;
        this.user = null;
        return;
      }

      this.token = token;
      if (process.client) {
        localStorage.setItem('auth-token', token);
      }
      
      try {
        const decodedUser = jwtDecode<User>(token);
        this._setUser(decodedUser);
      } catch (error) {
        console.error("Token inválido:", error);
        this.token = null;
        this.user = null;
      }
    },

    _setUser(user: User | null) {
      this.user = user;
    },

    async register(payload: any) {
      try {
        const { token, user } = await $fetch<RegisterResponse>('/api/auth/register', {
          method: 'POST',
          body: payload,
        });
        
        this._setToken(token);
        this._setUser(user); 
        
        await navigateTo('/');
        return { success: true, error: null };
      } catch (error: any) {
        console.error('Erro no registro:', error);
        return { success: false, error: error.data?.error || 'Erro desconhecido' };
      }
    },

    async login(payload: any) {
      try {
        const { token } = await $fetch<LoginResponse>('/api/auth/login', {
          method: 'POST',
          body: payload,
        });

        this._setToken(token);
        
        await navigateTo('/');
        return { success: true, error: null };
      } catch (error: any) {
        console.error('Erro no login:', error);
        return { success: false, error: error.data?.error || 'Email ou senha inválidos.' };
      }
    },

    async logout() {
      this.token = null;
      this.user = null;
      
      if (process.client) {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('auth.user')
      }
      
      await navigateTo('/login');
    },

    initializeAuth() {
      if (process.client) {
        const token = localStorage.getItem('auth-token');
        if (token) {
          this._setToken(token);
        }
      }
    }
  },
});