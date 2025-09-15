import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
  const selectedChampionship = ref(null);

  function setSelectedChampionship(championship: any) {
    selectedChampionship.value = championship;
  }

  return {
    selectedChampionship,
    setSelectedChampionship,
  };
});