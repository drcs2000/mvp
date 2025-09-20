<template>
  <section class="bg-white">
    <div v-if="championship" class="sticky top-0 z-20">
      <!-- Cabeçalho Padrão -->
      <header
        class="flex items-center shrink-0 p-4 sm:p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm gap-4"
      >
        <img :src="championship.leagueLogoUrl" class="w-8 h-8 object-contain" >
        <h1 class="text-xl font-bold text-gray-900">{{ championship.name }}</h1>
      </header>
      
      <!-- Jogo em Destaque -->
      <div
        v-if="featuredMatch && !stores.matches.loading"
        class="shrink-0 p-4 sm:p-6 border-b border-gray-200 bg-white"
      >
        <div class="p-4 text-white bg-gray-800 rounded-xl">
          <div class="flex items-center justify-between">
            <div class="flex flex-col items-center w-1/3 text-center">
              <img
                :src="featuredMatch.homeTeamLogoUrl"
                :alt="featuredMatch.homeTeamName"
                class="object-contain w-16 h-16"
              >
              <span
                class="block mt-2 text-sm"
                :class="{ 'font-bold': isHomeWinner(featuredMatch) }"
                >{{ featuredMatch.homeTeamName }}</span
              >
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold">
                <span v-if="featuredMatch.status !== 'NS' && featuredMatch.status !== 'PST'">
                  <span :class="{ 'font-bold': isHomeWinner(featuredMatch) }">{{
                    featuredMatch.homeScore ?? ""
                  }}</span>
                   - 
                  <span
                    :class="{ 'font-bold': isAwayWinner(featuredMatch) }"
                    >{{ featuredMatch.awayScore ?? "" }}</span
                  >
                </span>
                 <span v-else>{{
                    formatTime(featuredMatch.date)
                  }}</span>
              </div>
              <span class="mt-1 text-xs text-gray-400">{{
                getStatusText(featuredMatch.status)
              }}</span>
            </div>
            <div class="flex flex-col items-center w-1/3 text-center">
              <img
                :src="featuredMatch.awayTeamLogoUrl"
                :alt="featuredMatch.awayTeamName"
                class="object-contain w-16 h-16"
              >
              <span
                class="block mt-2 text-sm"
                :class="{ 'font-bold': isAwayWinner(featuredMatch) }"
                >{{ featuredMatch.awayTeamName }}</span
              >
            </div>
          </div>
        </div>
      </div>
      
      <!-- Seletor de Rodada Fixo -->
       <div v-if="!stores.matches.loading" class="bg-white py-4 border-b border-gray-200">
        <div class="flex items-center justify-center">
            <div class="flex items-center gap-2">
                <button
                :disabled="isFirstRound"
                class="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="previousRound"
                >
                <ChevronLeftIcon class="w-5 h-5 text-gray-600" />
                </button>
                <p class="text-sm font-semibold text-gray-700 w-24 text-center">
                Rodada {{ currentRoundNumber }}
                </p>
                <button
                :disabled="isLastRound"
                class="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="nextRound"
                >
                <ChevronRightIcon class="w-5 h-5 text-gray-600" />
                </button>
            </div>
        </div>
      </div>

    </div>

    <div class="px-4 sm:px-6 pb-6">
      <div v-if="stores.matches.loading" class="pt-8 text-center text-gray-500">
        A carregar jogos...
      </div>
      <div v-else-if="Object.keys(matchesByDay).length > 0" class="mt-2">
        <div v-for="(matches, day) in matchesByDay" :key="day" class="mb-6">
          <h3 class="py-2 text-sm font-semibold text-gray-500">
            {{ formatDate(day) }}
          </h3>
          <div class="space-y-px">
            <NuxtLink
              v-for="match in matches"
              :key="match.id"
              class="grid grid-cols-1 md:grid-cols-[100px,1fr,150px] gap-4 items-center px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
            >
              <div class="hidden md:block text-sm font-medium text-gray-800">
                {{ formatTime(match.date) }}
              </div>
              <div
                class="grid grid-cols-[1fr,auto,auto,auto,1fr] items-center gap-3 text-sm"
              >
                <span
                  class="text-right truncate"
                  :class="{ 'font-bold': isHomeWinner(match) }"
                  >{{ match.homeTeamName }}</span
                >
                <img
                  :src="match.homeTeamLogoUrl"
                  class="object-contain w-6 h-6 shrink-0"
                >
                 <div class="flex flex-col items-center">
                    <span
                        class="w-12 text-center font-bold text-base text-gray-800"
                    >
                        <span
                        v-if="match.status !== 'NS' && match.status !== 'PST'"
                        >
                        <span :class="{ 'font-bold': isHomeWinner(match) }">{{
                            match.homeScore
                        }}</span>
                        -
                        <span :class="{ 'font-bold': isAwayWinner(match) }">{{
                            match.awayScore
                        }}</span>
                        </span>
                        <span v-else>vs</span>
                    </span>
                    <span class="md:hidden text-xs text-gray-500 mt-1">
                        <span
                        v-if="match.status === 'NS' || match.status === 'PST'"
                        >{{ formatTime(match.date) }}</span
                        >
                        <span v-else>{{ getStatusText(match.status) }}</span>
                    </span>
                </div>
                <img
                  :src="match.awayTeamLogoUrl"
                  class="object-contain w-6 h-6 shrink-0"
                >
                <span
                  class="text-left truncate"
                  :class="{ 'font-bold': isAwayWinner(match) }"
                  >{{ match.awayTeamName }}</span
                >
              </div>
              <div class="hidden md:block text-sm text-right text-gray-500 truncate">
                <span v-if="match.status === 'NS' || match.status === 'PST'">{{ match.stadium }}</span>
                <span v-else class="font-semibold">{{ getStatusText(match.status) }}</span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
      <div v-else class="pt-8 text-center text-gray-500">
        <p>Nenhum jogo encontrado para esta rodada.</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";

const route = useRoute();
const stores = useStores();

const championshipId = computed(() => Number(route.params.id));
const selectedRound = ref(null);

const championship = computed(() =>
  stores.championships.championships.find(
    (c) => c.apiFootballId === championshipId.value
  )
);

onMounted(async () => {
  if (stores.championships.championships.length === 0) {
    await stores.championships.fetchAllChampionships();
  }
  if (championship.value) {
    stores.championships.selectChampionship(championship.value);
  }
  await stores.matches.fetchByChampionship(championshipId.value);

  selectedRound.value = findCurrentRound(stores.matches.matches);
});

watch(championshipId, async (newId) => {
  if (newId) {
    if (championship.value) {
      stores.championships.selectChampionship(championship.value);
    }
    await stores.matches.fetchByChampionship(newId);
    selectedRound.value = findCurrentRound(stores.matches.matches);
  }
});

const findCurrentRound = (allMatches) => {
    const now = new Date();
    const todayString = now.toISOString().split('T')[0];

    const todayMatches = allMatches.filter(m => m.date.startsWith(todayString));
    if (todayMatches.length > 0) {
        return todayMatches[0].round;
    }

    const upcomingMatch = allMatches
        .filter(m => new Date(m.date) >= now)
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

    if (upcomingMatch) return upcomingMatch.round;

    const lastMatch = [...allMatches].sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    return lastMatch ? lastMatch.round : null;
};

const allRounds = computed(() => {
  if (!stores.matches.matches) return [];
  const rounds = [...new Set(stores.matches.matches.map((m) => m.round))];
  return rounds.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || 0);
    const numB = parseInt(b.match(/\d+/)?.[0] || 0);
    return numA - numB;
  });
});

const currentRoundNumber = computed(() => {
  if (!selectedRound.value) return "";
  return selectedRound.value.match(/\d+/)?.[0] || "";
});

const isFirstRound = computed(() => {
  const currentIndex = allRounds.value.indexOf(selectedRound.value);
  return currentIndex <= 0;
});

const isLastRound = computed(() => {
  const currentIndex = allRounds.value.indexOf(selectedRound.value);
  return currentIndex >= allRounds.value.length - 1;
});

const previousRound = () => {
  const currentIndex = allRounds.value.indexOf(selectedRound.value);
  if (currentIndex > 0) {
    selectedRound.value = allRounds.value[currentIndex - 1];
  }
};

const nextRound = () => {
  const currentIndex = allRounds.value.indexOf(selectedRound.value);
  if (currentIndex < allRounds.value.length - 1) {
    selectedRound.value = allRounds.value[currentIndex + 1];
  }
};

const matchesOfSelectedRound = computed(() => {
  if (!selectedRound.value) return [];
  return stores.matches.matches
    .filter((m) => m.round === selectedRound.value)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
});

const matchesByDay = computed(() => {
  return matchesOfSelectedRound.value.reduce((acc, match) => {
    const dateKey = match.date.split("T")[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(match);
    return acc;
  }, {});
});

const featuredMatch = computed(() => {
  if (matchesOfSelectedRound.value.length === 0) return null;
  return (
    matchesOfSelectedRound.value.find((m) => m.status !== "FT") ||
    matchesOfSelectedRound.value[0]
  );
});

const formatTime = (dateString) =>
  new Date(dateString).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
const formatDate = (dateString) =>
  new Date(dateString + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
const getStatusText = (status) =>
  ({ NS: "Agendado", FT: "Encerrado", "1H": "1º Tempo", "2H": "2º Tempo", PST: "Adiado", HT: "Intervalo" }[
    status
  ] || status);

const isHomeWinner = (match) =>
  match.status === "FT" && match.homeScore > match.awayScore;
const isAwayWinner = (match) =>
  match.status === "FT" && match.awayScore > match.homeScore;
</script>

