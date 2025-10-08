<template>
  <section class="bg-white dark:bg-gray-800">
    <div
      v-if="loading"
      class="pt-20 text-center text-gray-500 dark:text-gray-400"
    >
      Carregando informações do bolão...
    </div>
    <div
      v-else-if="error"
      class="flex flex-col items-center justify-center p-6 bg-white border border-red-200 rounded-lg shadow-sm dark:bg-red-900/20 dark:border-red-500/30"
    >
      <ExclamationTriangleIcon
        class="w-10 h-10 text-red-400 dark:text-red-300"
      />
      <h3 class="mt-2 text-lg font-semibold text-red-800 dark:text-red-200">
        Ocorreu um erro
      </h3>
      <p class="mt-1 text-sm text-red-600 dark:text-red-300">{{ error }}</p>
    </div>

    <div v-else-if="currentChampionship">
      <div class="sticky top-0 z-20">
        <ChampionshipHeader :championship="currentChampionship">
          <template #right>
            <button
              type="button"
              :disabled="stores.bet.loading"
              class="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-wait dark:text-gray-300 dark:hover:text-blue-400"
              @click="handleSync"
            >
              <ArrowPathIcon
                class="w-4 h-4"
                :class="{ 'animate-spin': stores.bet.loading }"
              />
              Sincronizar
            </button>
            <NuxtLink
              :to="`/pools/${poolId}`"
              class="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors duration-200 whitespace-nowrap dark:text-gray-300 dark:hover:text-blue-400"
            >
              Palpitar
            </NuxtLink>
            <NuxtLink
              :to="`/pools/${poolId}/info`"
              class="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors duration-200 whitespace-nowrap dark:text-gray-300 dark:hover:text-blue-400"
            >
              Informações
            </NuxtLink>
          </template>
        </ChampionshipHeader>

        <DateSelector
          v-if="!stores.matches.isLoading && allGameDays.length > 0"
          :is-first="isFirstDay"
          :is-last="isLastDay"
          :label="formatDate(selectedDate)"
          @previous="previousDay"
          @next="nextDay"
        />
      </div>

      <MatchList
        :matches-by-day="matchesByDay"
        :loading="stores.matches.isLoading"
      >
        <template #match="{ matches }">
          <div
            v-for="match in matches"
            :key="match.id"
            class="py-4 border-b border-gray-200 dark:border-gray-700"
          >
            <div
              class="grid grid-cols-1 md:grid-cols-[100px_1fr_100px] gap-x-4 gap-y-2 items-center px-4"
            >
              <div
                class="hidden md:block text-sm font-medium text-gray-800 dark:text-gray-300 text-left"
              >
                {{ match.localTime }}
              </div>

              <div class="flex items-center justify-between text-sm gap-2">
                <div class="flex items-center gap-2 flex-1 justify-end min-w-0">
                  <span
                    class="text-right truncate dark:text-gray-200"
                    :class="{ 'font-bold': isHomeWinner(match) }"
                    >{{ match.homeTeamName }}</span
                  >
                  <img
                    :src="match.homeTeamLogoUrl"
                    class="object-contain w-6 h-6 shrink-0"
                  >
                </div>

                <div class="flex flex-col items-center">
                  <div
                    class="flex items-center gap-1 font-bold text-lg dark:text-gray-200"
                  >
                    <span class="w-8 text-center">{{
                      match.homeScore ?? ""
                    }}</span>
                    <span class="dark:text-gray-400">-</span>
                    <span class="w-8 text-center">{{
                      match.awayScore ?? ""
                    }}</span>
                  </div>
                  <div
                    class="md:hidden text-xs text-gray-500 dark:text-gray-400 mt-1"
                  >
                    {{ match.localTime }}
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
                    class="text-left truncate dark:text-gray-200"
                    :class="{ 'font-bold': isAwayWinner(match) }"
                    >{{ match.awayTeamName }}</span
                  >
                </div>
              </div>

              <div
                class="hidden md:block text-sm font-medium text-gray-500 dark:text-gray-400 text-right truncate"
              >
                <span
                  v-if="
                    match.status === 'SCHEDULED' || match.status === 'POSTPONED'
                  "
                  :title="match.venueName"
                >
                  {{ match.venueName }}
                </span>
                <span v-else>{{ getStatusText(match.status) }}</span>
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
            <div
              v-else
              class="text-xs text-gray-400 dark:text-gray-500 text-center mt-3 px-4"
            >
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
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/vue/20/solid";

const stores = useStores();
const route = useRoute();

const poolId = computed(() => route.params.id);
const error = ref(null);
const loading = ref(true);
const currentChampionship = ref(null);
const allBets = ref([]);

const selectedDate = ref(null);

const getLocalDateString = (utcDateString) => {
  if (!utcDateString) return null;
  const date = new Date(utcDateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

onMounted(async () => {
  try {
    const pool = await stores.pools.fetchPoolById(poolId.value);
    const championshipId = pool.baseChampionship.id;

    if (stores.championships.allChampionships.length === 0) {
      await stores.championships.fetchAllChampionships();
    } // 3. Encontra o campeonato atual.

    currentChampionship.value = stores.championships.allChampionships.find(
      (c) => c.id === championshipId
    );

    if (currentChampionship.value) {
      await stores.matches.fetchByChampionship(currentChampionship.value.id);
      selectedDate.value = findInitialDate(stores.matches.matches);

      const bets = await stores.bet.fetchAllBetsByPool(poolId.value);
      allBets.value = bets.data;
    } else {
      throw new Error("Campeonato não encontrado para este bolão.");
    }
  } catch (e) {
    if (e.status === 404) {
      error.value = "Bolão não encontrado.";
    } else {
      error.value =
        e.data?.message || e.message || "Falha ao carregar dados do bolão.";
    }
  } finally {
    loading.value = false;
  }
});

const handleSync = async () => {
  try {
    await stores.bet.syncPool(poolId.value);
    stores.ui.showToast("Bolão sincronizado com sucesso!", "success");
    const bets = await stores.bet.fetchAllBetsByPool(poolId.value, true);
    allBets.value = bets;
  } catch (e) {
    stores.ui.showToast(
      e.data?.message || e.message || "Ocorreu um erro ao sincronizar.",
      "error"
    );
  }
};

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
    return "bg-gray-50 dark:bg-gray-700/20 md:bg-transparent";
  }
  const hitType = getHitType(bet, match);
  switch (hitType) {
    case "full":
      return "bg-yellow-100 dark:bg-yellow-800/20";
    case "partial":
      return "bg-sky-100 dark:bg-sky-800/20";
    case "result":
      return "bg-green-100 dark:bg-green-800/20";
    case "goal":
      return "bg-indigo-100 dark:bg-indigo-800/20";
    default:
      return bet.pointsEarned > 0
        ? "bg-red-100 dark:bg-red-800/20"
        : "bg-gray-50 dark:bg-gray-700/20 md:bg-transparent";
  }
};

const getTextColor = (bet, match, context) => {
  if (bet.pointsEarned == null) {
    return context === "bet"
      ? "text-gray-800 dark:text-gray-200"
      : "text-gray-700 dark:text-gray-300";
  }
  const hitType = getHitType(bet, match);
  switch (hitType) {
    case "full":
      return context === "points"
        ? "text-yellow-900 dark:text-yellow-300"
        : "text-yellow-800 dark:text-yellow-200";
    case "partial":
      return context === "points"
        ? "text-sky-900 dark:text-sky-300"
        : "text-sky-800 dark:text-sky-200";
    case "result":
      return context === "points"
        ? "text-green-900 dark:text-green-300"
        : "text-green-800 dark:text-green-200";
    case "goal":
      return context === "points"
        ? "text-indigo-900 dark:text-indigo-300"
        : "text-indigo-800 dark:text-indigo-200";
    default:
      return bet.pointsEarned > 0
        ? "text-red-800 dark:text-red-200"
        : "text-gray-700 dark:text-gray-300";
  }
};

const findInitialDate = (allMatches) => {
  if (!allMatches || allMatches.length === 0) return null;
  const now = new Date();
  const upcomingMatches = allMatches
    .filter(
      (m) =>
        new Date(m.date) >= now &&
        (m.status === "SCHEDULED" || m.status === "POSTPONED")
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (upcomingMatches.length > 0) {
    return getLocalDateString(upcomingMatches[0].date);
  }

  const lastMatch = allMatches.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )[0];
  return lastMatch ? getLocalDateString(lastMatch.date) : null;
};

const allGameDays = computed(() => {
  if (!stores.matches.matches || stores.matches.matches.length === 0) return [];
  const dates = stores.matches.matches.map((match) =>
    getLocalDateString(match.date)
  );
  return [...new Set(dates)].sort();
});

const isFirstDay = computed(
  () =>
    !selectedDate.value || allGameDays.value.indexOf(selectedDate.value) <= 0
);
const isLastDay = computed(
  () =>
    !selectedDate.value ||
    allGameDays.value.indexOf(selectedDate.value) >=
      allGameDays.value.length - 1
);

const previousDay = () => {
  const currentIndex = allGameDays.value.indexOf(selectedDate.value);
  if (currentIndex > 0)
    selectedDate.value = allGameDays.value[currentIndex - 1];
};

const nextDay = () => {
  const currentIndex = allGameDays.value.indexOf(selectedDate.value);
  if (currentIndex < allGameDays.value.length - 1)
    selectedDate.value = allGameDays.value[currentIndex + 1];
};

const matchesOfSelectedDay = computed(() => {
  if (!selectedDate.value) return [];
  return stores.matches.matches.filter(
    (m) => getLocalDateString(m.date) === selectedDate.value
  );
});

const matchesByDay = computed(() => {
  return matchesOfSelectedDay.value.reduce((acc, match) => {
    const dateKey = getLocalDateString(match.date);
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

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString + "T00:00:00");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.getTime() === today.getTime()) return "Hoje";
  if (date.getTime() === tomorrow.getTime()) return "Amanhã";

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "long",
  }).format(date);
};

const getStatusText = (status) =>
  ({
    SCHEDULED: "Agendado",
    IN_PROGRESS: "Ao Vivo",
    HALFTIME: "Intervalo",
    FULL_TIME: "Encerrado",
    FINAL: "Encerrado",
    POSTPONED: "Adiado",
    CANCELED: "Cancelado",
  }[status] || status);

const isHomeWinner = (match) =>
  match &&
  (match.status === "FINAL" || match.status === "FULL_TIME") &&
  match.homeScore > match.awayScore;
const isAwayWinner = (match) =>
  match &&
  (match.status === "FINAL" || match.status === "FULL_TIME") &&
  match.homeScore < match.awayScore;
</script>
