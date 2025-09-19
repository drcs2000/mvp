// src/stores/users.ts

import { defineStore } from 'pinia';
import { ref } from 'vue';

// Interface para o usuário no frontend (sem dados sensíveis)
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export const useUsersStore = defineStore('users', () => {
  // STATE
  const users = ref<User[]>([]);
  const isLoading = ref(false);

  /**
   * Busca todos os usuários cadastrados na API.
   */
  async function fetchAllUsers() {
    // Evita buscas repetidas se os usuários já foram carregados
    if (users.value.length > 0) return;

    isLoading.value = true;
    try {
      const allUsers = await $fetch<User[]>('/api/users', {
        method: 'GET',
      });
      
      users.value = allUsers;
    } catch (error: unknown) {
      console.error('Erro ao buscar usuários:', error);
      // Opcional: Adicionar um estado de erro para mostrar no UI
    } finally {
      isLoading.value = false;
    }
  }

  return {
    users,
    isLoading,
    fetchAllUsers,
  };
});