import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type ChampionshipType = 'League' | 'Cup';
export type CalendarType = 'brasileiro' | 'europeu';

interface Championship {
  id: number;
  apiEspnId: number;
  apiEspnSlug: string;
  name: string;
  abbreviation: string;
  type: ChampionshipType;
  calendar: CalendarType;
  logoUrl: string;
  createdAt: string;
  updatedAt: string;
}

export const useChampionshipsStore = defineStore('championships', () => {
  const allChampionships = ref<Championship[]>([]);
  const isLoading = ref(false);
  const selectedChampionshipId = ref<number | null>(null);
  const config = useRuntimeConfig();
  const apiBaseUrl = config.public.apiBaseUrl;

  const selectedChampionship = computed(() => {
    if (!selectedChampionshipId.value) return null;
    return allChampionships.value.find(c => c.id === selectedChampionshipId.value) || null;
  });

  async function fetchAllChampionships(force = false) {
    if (allChampionships.value.length > 0 && !force) {
      return;
    }

    isLoading.value = true;
    try {
      const url = import.meta.dev ? '/api/championships' : `${apiBaseUrl}/championships`;
      const data = await $fetch<Championship[]>(url, {
        method: 'GET',
      });
      allChampionships.value = data;
    } catch (error: unknown) {
      console.error('Erro ao buscar campeonatos:', error);
    } finally {
      isLoading.value = false;
    }
  }

  function selectChampionship(championshipId: number | null) {
    selectedChampionshipId.value = championshipId;
  }

  return {
    allChampionships,
    isLoading,
    selectedChampionshipId,
    selectedChampionship,
    fetchAllChampionships,
    selectChampionship,
  };
});
