<template>
  <section class="bg-white">
    <div v-if="loading" class="pt-20 text-center text-gray-500">
      Carregando informações do bolão...
    </div>
    <div v-else-if="error" class="pt-20 text-center text-red-500">
      {{ error }}
    </div>

    <div v-else-if="currentChampionship">
      <div class="sticky top-0 z-20">
        <header
          class="flex items-center shrink-0 p-4 sm:p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm gap-4"
        >
          <img
            :src="currentChampionship.leagueLogoUrl"
            class="w-8 h-8 object-contain"
          />
          <h1 class="text-xl font-bold text-gray-900">
            {{ currentChampionship.name }}
          </h1>
          <div class="flex items-center gap-4 ml-auto text-right">
            <NuxtLink
              :to="`/pools/${poolId}`"
              class="text-sm font-semibold text-gray-600 hover:text-slate-800 transition-colors duration-200 whitespace-nowrap"
            >
              Palpitar
            </NuxtLink>
            <NuxtLink
              :to="`/pools/${poolId}/info`"
              class="text-sm font-semibold text-gray-600 hover:text-slate-800 transition-colors duration-200 whitespace-nowrap"
            >
              Informações
            </NuxtLink>
          </div>
        </header>
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
                />
                <span
                  class="block mt-2 text-sm"
                  :class="{ 'font-bold': isHomeWinner(featuredMatch) }"
                  >{{ featuredMatch.homeTeamName }}</span
                >
              </div>
              <div class="text-center">
                <div class="text-4xl font-bold">
                  <span v-if="featuredMatch.status !== 'NS'">
                    <span
                      :class="{ 'font-bold': isHomeWinner(featuredMatch) }"
                      >{{ featuredMatch.homeScore }}</span
                    >
                    -
                    <span
                      :class="{ 'font-bold': isAwayWinner(featuredMatch) }"
                      >{{ featuredMatch.awayScore }}</span
                    >
                  </span>
                  <span v-else>{{ formatTime(featuredMatch.date) }}</span>
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
                />
                <span
                  class="block mt-2 text-sm"
                  :class="{ 'font-bold': isAwayWinner(featuredMatch) }"
                  >{{ featuredMatch.awayTeamName }}</span
                >
              </div>
            </div>
          </div>

          <div class="flex items-center justify-center mt-4">
            <div class="flex items-center gap-2">
              <button
                @click="previousRound"
                :disabled="isFirstRound"
                class="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon class="w-5 h-5 text-gray-600" />
              </button>
              <p class="text-sm font-semibold text-gray-700 w-24 text-center">
                Rodada {{ currentRoundNumber }}
              </p>
              <button
                @click="nextRound"
                :disabled="isLastRound"
                class="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon class="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="px-4 sm:px-6 pb-6">
        <div
          v-if="stores.matches.loading"
          class="pt-8 text-center text-gray-500"
        >
          A carregar jogos...
        </div>
        <div v-else-if="Object.keys(matchesByDay).length > 0" class="mt-2">
          <div v-for="(matches, day) in matchesByDay" :key="day" class="mb-6">
            <h3 class="py-2 text-sm font-semibold text-gray-500 text-left">
              {{ formatDate(day) }}
            </h3>
            <div class="space-y-px">
              <div
                v-for="match in matches"
                :key="match.id"
                class="py-4 border-b border-gray-200"
              >
                <div
                  class="grid grid-cols-[100px_1fr_100px] gap-4 items-center px-4"
                >
                  <div class="text-sm font-medium text-gray-800 text-left">
                    {{ formatTime(match.date) }}
                  </div>
                  <div class="flex items-center justify-between text-sm gap-2">
                    <div class="flex items-center gap-2 flex-1 justify-end">
                      <span
                        class="text-right truncate max-w-[120px]"
                        :class="{ 'font-bold': isHomeWinner(match) }"
                        >{{ match.homeTeamName }}</span
                      >
                      <img
                        :src="match.homeTeamLogoUrl"
                        class="object-contain w-6 h-6 shrink-0"
                      />
                    </div>
                    <div class="flex items-center gap-1 font-bold text-base">
                      <span class="w-8 text-center">{{
                        match.homeScore ?? ""
                      }}</span>
                      <span>-</span>
                      <span class="w-8 text-center">{{
                        match.awayScore ?? ""
                      }}</span>
                    </div>
                    <div class="flex items-center gap-2 flex-1 justify-start">
                      <img
                        :src="match.awayTeamLogoUrl"
                        class="object-contain w-6 h-6 shrink-0"
                      />
                      <span
                        class="text-left truncate max-w-[120px]"
                        :class="{ 'font-bold': isAwayWinner(match) }"
                        >{{ match.awayTeamName }}</span
                      >
                    </div>
                  </div>
                  <div class="text-sm font-medium text-gray-500 text-right">
                    {{ getStatusText(match.status) }}
                  </div>
                </div>

                <div
                  v-if="groupedBetsByMatch[match.id]?.length > 0"
                  class="mt-2 space-y-1.5"
                >
                  <div
                    v-for="bet in groupedBetsByMatch[match.id]"
                    :key="bet.id"
                    class="rounded-md transition-colors"
                    :class="getRowClass(bet, match)"
                  >
                    <div class="flex items-center gap-4 px-4 py-1.5">
                      <div class="w-[100px] flex-shrink-0">
                        <div
                          class="text-xs text-left truncate"
                          :class="getTextColor(bet, match, 'name')"
                          :title="bet.user?.name ?? 'Usuário Desconhecido'"
                        >
                          {{ bet.user?.name ?? "Usuário Desconhecido" }}
                        </div>
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center justify-center">
                          <div
                            class="font-semibold text-sm"
                            :class="getTextColor(bet, match, 'bet')"
                          >
                            {{ bet.homeScoreBet }} - {{ bet.awayScoreBet }}
                          </div>
                        </div>
                      </div>
                      <div class="w-[100px] flex-shrink-0 flex justify-end">
                        <span
                          v-if="bet.pointsEarned != null"
                          class="text-xs font-bold"
                          :class="getTextColor(bet, match, 'points')"
                        >
                          +{{ bet.pointsEarned }} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-xs text-gray-400 text-center mt-3">
                  Nenhum palpite para este jogo.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="pt-8 text-center text-gray-500">
          <p>Nenhum jogo encontrado para esta rodada.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";

const stores = useStores();
const route = useRoute();

const poolId = computed(() => route.params.id);
const error = ref(null);
const loading = ref(true);
const currentChampionship = ref(null);
const allBets = ref([]);
const selectedRound = ref(null);

onMounted(async () => {
  try {
    const poolResult = await stores.pools.fetchPoolById(poolId.value);
    if (!poolResult.success || !poolResult.data) {
      throw new Error(poolResult.error || "Bolão não encontrado.");
    }
    const championshipId = poolResult.data.baseChampionshipId;
    if (stores.championships.championships.length === 0) {
      await stores.championships.fetchAllChampionships();
    }
    currentChampionship.value = stores.championships.championships.find(
      (c) => c.id === championshipId
    );
    if (currentChampionship.value) {
      await stores.matches.fetchByChampionship(
        currentChampionship.value.apiFootballId
      );
      selectedRound.value = findCurrentRound(stores.matches.matches);
      const betsResult = await stores.bet.fetchAllBetsByPool(poolId.value);
      if (betsResult.success && betsResult.data) {
        allBets.value = betsResult.data;
      } else {
        throw new Error(
          betsResult.error || "Falha ao buscar palpites do bolão."
        );
      }
    } else {
      throw new Error("Campeonato não encontrado para este bolão.");
    }
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});

const getHitType = (bet, match) => {
  if (
    typeof match.homeScore !== "number" ||
    typeof match.awayScore !== "number"
  ) {
    return "none";
  }
  const { homeScore, awayScore } = match;
  const { homeScoreBet, awayScoreBet } = bet;
  const matchWinner =
    homeScore > awayScore ? "home" : awayScore > homeScore ? "away" : "draw";
  const betWinner =
    homeScoreBet > awayScoreBet
      ? "home"
      : awayScoreBet > homeScoreBet
      ? "away"
      : "draw";

  if (homeScoreBet === homeScore && awayScoreBet === awayScore) return "full";
  if (
    betWinner === matchWinner &&
    (homeScoreBet === homeScore || awayScoreBet === awayScore)
  )
    return "partial";
  if (betWinner === matchWinner) return "result";
  if (homeScoreBet === homeScore || awayScoreBet === awayScore) return "goal";

  return "none";
};

const getRowClass = (bet, match) => {
  if (bet.pointsEarned == null) {
    return "bg-gray-50";
  }
  const hitType = getHitType(bet, match);
  switch (hitType) {
    case "full":
      return "bg-yellow-100";
    case "partial":
      return "bg-sky-100";
    case "result":
      return "bg-green-100";
    case "goal":
      return "bg-indigo-100";
    default:
      return bet.pointsEarned > 0 ? "bg-gray-100" : "bg-gray-50";
  }
};

const getTextColor = (bet, match, context) => {
  if (bet.pointsEarned == null) {
    return context === "bet" ? "text-gray-800" : "text-gray-700";
  }
  const hitType = getHitType(bet, match);
  switch (hitType) {
    case "full":
      return context === "points" ? "text-yellow-900" : "text-yellow-800";
    case "partial":
      return context === "points" ? "text-sky-900" : "text-sky-800";
    case "result":
      return context === "points" ? "text-green-900" : "text-green-800";
    case "goal":
      return context === "points" ? "text-indigo-900" : "text-indigo-800";
    default:
      return bet.pointsEarned > 0 ? "text-gray-800" : "text-gray-700";
  }
};

const findCurrentRound = (allMatches) => {
  const now = new Date();
  const todayString = now.toDateString();
  const matchToday = allMatches.find(
    (m) => new Date(m.date).toDateString() === todayString
  );
  if (matchToday) return matchToday.round;
  const upcomingMatch = allMatches
    .filter((m) => new Date(m.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  if (upcomingMatch) return upcomingMatch.round;
  const lastMatch = [...allMatches].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )[0];
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

const groupedBetsByMatch = computed(() => {
  return allBets.value.reduce((acc, bet) => {
    const matchId = bet.match.id;
    if (!acc[matchId]) acc[matchId] = [];
    acc[matchId].push(bet);
    return acc;
  }, {});
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
  ({
    NS: "Agendado",
    FT: "Encerrado",
    HT: "Intervalo",
    "1H": "1º Tempo",
    "2H": "2º Tempo",
  }[status] || status);

const isHomeWinner = (match) =>
  match.status === "FT" && match.homeScore > match.awayScore;

const isAwayWinner = (match) =>
  match.status === "FT" && match.awayScore > match.homeScore;
</script>
