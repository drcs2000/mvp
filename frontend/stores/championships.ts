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

  /**
   * Busca todos os campeonatos disponíveis na API.
   */
  async function fetchAllChampionships() {
    if (championships.value.length > 0) {
      return;
    }

    isLoading.value = true;
    try {
      const allChampionships = await $fetch<Championship[]>('/api/championships', {
        method: 'GET',
      });
      
      championships.value = allChampionships;
    } catch (error: unknown) {
      console.error('Erro ao buscar campeonatos:', error);
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Define o campeonato atualmente selecionado na store.
   * @param championship O objeto do campeonato a ser selecionado, ou nulo para limpar a seleção.
   */
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
