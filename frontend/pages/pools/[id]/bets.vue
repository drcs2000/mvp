<template>
  <section class="bg-white">
    <div v-if="loading" class="pt-20 text-center text-gray-500">
      Carregando informações do bolão...
    </div>
    <div
      v-else-if="error"
      class="flex flex-col items-center justify-center p-6 bg-white border border-red-200 rounded-lg shadow-sm"
    >
      <ExclamationTriangleIcon class="w-10 h-10 text-red-400" />
      <h3 class="mt-2 text-lg font-semibold text-red-800">Ocorreu um erro</h3>
      <p class="mt-1 text-sm text-red-600">{{ error }}</p>
    </div>

    <div v-else-if="currentChampionship">
      <div class="sticky top-0 z-20">
        <ChampionshipHeader :championship="currentChampionship">
          <template #right>
            <NuxtLink
              :to="`/pools/${poolId}`"
              class="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors duration-200 whitespace-nowrap"
            >
              Palpitar
            </NuxtLink>
            <NuxtLink
              :to="`/pools/${poolId}/info`"
              class="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors duration-200 whitespace-nowrap"
            >
              Informações
            </NuxtLink>
          </template>
        </ChampionshipHeader>

        <RoundSelector
          v-if="!stores.matches.loading"
          :is-first-round="isFirstRound"
          :is-last-round="isLastRound"
          :current-round-number="currentRoundNumber"
          @previous="previousRound"
          @next="nextRound"
        />
      </div>

      <MatchList
        :matches-by-day="matchesByDay"
        :loading="stores.matches.loading"
      >
        <template #match="{ matches }">
          <div
            v-for="match in matches"
            :key="match.id"
            class="py-4 border-b border-gray-200"
          >
            <div
              class="grid grid-cols-1 md:grid-cols-[100px_1fr_100px] gap-x-4 gap-y-2 items-center px-4"
            >
              <div
                class="hidden md:block text-sm font-medium text-gray-800 text-left"
              >
                {{ formatTime(match.date) }}
              </div>

              <div class="flex items-center justify-between text-sm gap-2">
                <div class="flex items-center gap-2 flex-1 justify-end min-w-0">
                  <span
                    class="text-right truncate"
                    :class="{ 'font-bold': isHomeWinner(match) }"
                    >{{ match.homeTeamName }}</span
                  >
                  <img
                    :src="match.homeTeamLogoUrl"
                    class="object-contain w-6 h-6 shrink-0"
                  >
                </div>

                <div class="flex flex-col items-center">
                  <div class="flex items-center gap-1 font-bold text-lg">
                    <span class="w-8 text-center">{{
                      match.homeScore ?? ""
                    }}</span>
                    <span>-</span>
                    <span class="w-8 text-center">{{
                      match.awayScore ?? ""
                    }}</span>
                  </div>
                  <div class="md:hidden text-xs text-gray-500 mt-1">
                    {{ formatTime(match.date) }}
                  </div>
                </div>

                <div
                  class="flex items-center gap-2 flex-1 justify-start min-w-0"
                >
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
              </div>

              <div
                class="hidden md:block text-sm font-medium text-gray-500 text-right"
              >
                {{ getStatusText(match.status) }}
              </div>
            </div>

            <div
              v-if="groupedBetsByMatch[match.id]?.length > 0"
              class="mt-3 space-y-px"
            >
              <div
                v-for="bet in groupedBetsByMatch[match.id]"
                :key="bet.id"
                class="transition-colors mx-4 md:mx-0"
                :class="getRowClass(bet, match)"
              >
                <div class="hidden md:flex items-center gap-4 px-4 py-1.5">
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

                <div class="md:hidden text-center py-2">
                  <div
                    class="text-sm font-medium"
                    :class="getTextColor(bet, match, 'name')"
                    :title="bet.user?.name ?? 'Usuário Desconhecido'"
                  >
                    {{ bet.user?.name ?? "Usuário Desconhecido" }}
                  </div>
                  <div
                    class="font-semibold text-base my-0.5"
                    :class="getTextColor(bet, match, 'bet')"
                  >
                    {{ bet.homeScoreBet }} - {{ bet.awayScoreBet }}
                  </div>
                  <div
                    v-if="bet.pointsEarned != null"
                    class="text-xs font-bold"
                    :class="getTextColor(bet, match, 'points')"
                  >
                    +{{ bet.pointsEarned }} pts
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-xs text-gray-400 text-center mt-3 px-4">
              Nenhum palpite para este jogo.
            </div>
          </div>
        </template>
      </MatchList>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";

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
    return "bg-gray-50 md:bg-transparent";
  }
  const hitType = getHitType(bet, match);
  switch (hitType) {
    case "full":
      return "bg-yellow-100/70 md:bg-yellow-100";
    case "partial":
      return "bg-sky-100/70 md:bg-sky-100";
    case "result":
      return "bg-green-100/70 md:bg-green-100";
    case "goal":
      return "bg-indigo-100/70 md:bg-indigo-100";
    default:
      return bet.pointsEarned > 0
        ? "bg-red-100/70 md:bg-red-100"
        : "bg-gray-50 md:bg-transparent";
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
      return bet.pointsEarned > 0 ? "text-red-800" : "text-gray-700";
  }
};

const findCurrentRound = (allMatches) => {
  if (!allMatches || allMatches.length === 0) return null;
  const now = new Date();

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
    const localDate = new Date(match.date);
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(match);
    return acc;
  }, {});
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
