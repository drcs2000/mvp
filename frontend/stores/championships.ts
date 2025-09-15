import { defineStore } from 'pinia';
import { ref } from 'vue';

interface Championship {
  id: number;
  apiFootballId: number;
  apiEspnId: string | null;
  apiEspnSlug: string | null;
  name: string;
  type: string;
  leagueLogoUrl: string;
  countryName: string;
  countryFlagUrl: string | null;
  createdAt: string;
}

export const useChampionshipsStore = defineStore('championships', () => {
  const championships = ref<Championship[]>([]);
  const isLoading = ref(false);
  const selectedChampionship = ref<Championship | null>(null);

  async function fetchAllChampionships() {
    isLoading.value = true;
    try {
      const allChampionships = await $fetch<Championship[]>('/api/championships', {
        method: 'GET',
      });
      
      championships.value = allChampionships;
    } catch (error: any) {
      console.error('Erro ao buscar campeonatos:', error);
    } finally {
      isLoading.value = false;
    }
  }

  function selectChampionship(championship: Championship | null) {
    selectedChampionship.value = championship;
  }

  return {
    championships,
    isLoading,
    selectedChampionship,
    fetchAllChampionships,
    selectChampionship,
  };
});
