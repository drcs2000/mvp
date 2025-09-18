<template>
  <div v-if="!h2hData" class="text-center text-sm text-gray-500 py-4">
    Carregando dados do confronto...
  </div>
  <div v-else-if="h2hData.matches.length === 0" class="text-center text-sm text-gray-500 py-4">
    Não há histórico de confrontos diretos recentes.
  </div>
  <div v-else class="text-sm">
    <div class="grid grid-cols-3 gap-2 text-center p-3 bg-gray-50 rounded-lg">
      <div>
        <div class="font-bold text-lg text-gray-800">{{ stats.homeWins }}</div>
        <div class="text-xs text-gray-500">Vitórias {{ homeTeamName }}</div>
      </div>
      <div>
        <div class="font-bold text-lg text-gray-800">{{ stats.draws }}</div>
        <div class="text-xs text-gray-500">Empates</div>
      </div>
      <div>
        <div class="font-bold text-lg text-gray-800">{{ stats.awayWins }}</div>
        <div class="text-xs text-gray-500">Vitórias {{ awayTeamName }}</div>
      </div>
    </div>

    <div class="flex items-center justify-center gap-2 my-4">
      <button
        @click="activeTab = 'geral'"
        :class="['px-3 py-1 text-xs font-semibold rounded-full transition-colors', activeTab === 'geral' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300']"
      >
        Últimos 5
      </button>
      <button
        @click="activeTab = 'casa'"
        :class="['px-3 py-1 text-xs font-semibold rounded-full transition-colors', activeTab === 'casa' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300']"
      >
        {{ homeTeamName }} em Casa
      </button>
      <button
        @click="activeTab = 'fora'"
        :class="['px-3 py-1 text-xs font-semibold rounded-full transition-colors', activeTab === 'fora' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300']"
      >
        {{ awayTeamName }} Fora
      </button>
    </div>

    <div class="flex flex-col gap-2">
      <div v-if="displayedMatches.length === 0" class="text-center text-xs text-gray-400 py-3">
        Nenhum jogo encontrado para este filtro.
      </div>
      <div
        v-for="game in displayedMatches"
        :key="game.id"
        class="grid grid-cols-[1fr_auto_1fr] p-1.5 w-full rounded-md text-xs"
        :class="getGameResultClass(game, game.homeTeamApiId === homeTeamId ? homeTeamId : awayTeamId)"
      >
        <span class="text-right truncate">{{ game.homeTeamName }}</span>
        <span class="mx-2 font-semibold whitespace-nowrap">{{ game.homeScore }} x {{ game.awayScore }}</span>
        <span class="text-left truncate">{{ game.awayTeamName }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  h2hData: { type: Object, default: null },
  homeTeamId: { type: Number, required: true },
  awayTeamId: { type: Number, required: true },
});

const activeTab = ref('geral');

const homeTeamName = computed(() => props.h2hData?.matches[0]?.homeTeamApiId === props.homeTeamId ? props.h2hData?.matches[0]?.homeTeamName : props.h2hData?.matches[0]?.awayTeamName);
const awayTeamName = computed(() => props.h2hData?.matches[0]?.awayTeamApiId === props.awayTeamId ? props.h2hData?.matches[0]?.awayTeamName : props.h2hData?.matches[0]?.homeTeamName);


const stats = computed(() => {
  if (!props.h2hData) return { homeWins: 0, awayWins: 0, draws: 0 };
  return props.h2hData.matches.reduce((acc, match) => {
    if (match.homeScore === match.awayScore) {
      acc.draws++;
    } else if (match.homeScore > match.awayScore) {
      acc[match.homeTeamApiId === props.homeTeamId ? 'homeWins' : 'awayWins']++;
    } else {
      acc[match.awayTeamApiId === props.awayTeamId ? 'awayWins' : 'homeWins']++;
    }
    return acc;
  }, { homeWins: 0, awayWins: 0, draws: 0 });
});

const geralMatches = computed(() => props.h2hData?.matches.slice(0, 5) || []);
const homeMatches = computed(() => props.h2hData?.matches.filter(m => m.homeTeamApiId === props.homeTeamId).slice(0, 5) || []);
const awayMatches = computed(() => props.h2hData?.matches.filter(m => m.awayTeamApiId === props.awayTeamId).slice(0, 5) || []);

const displayedMatches = computed(() => {
  switch (activeTab.value) {
    case 'casa': return homeMatches.value;
    case 'fora': return awayMatches.value;
    default: return geralMatches.value;
  }
});

const getGameResultLetter = (game, teamId) => {
  if (game.homeScore === game.awayScore) return "D";
  const isHomeTeam = game.homeTeamApiId === teamId;
  return isHomeTeam ? (game.homeScore > game.awayScore ? "W" : "L") : (game.awayScore > game.homeScore ? "W" : "L");
};

const getGameResultClass = (game, teamId) => {
  const result = getGameResultLetter(game, teamId);
  switch (result) {
    case "W": return "bg-green-100 text-green-800";
    case "L": return "bg-red-100 text-red-800";
    case "D": return "bg-gray-200 text-gray-700";
  }
};
</script>