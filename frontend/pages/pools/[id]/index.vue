<template>
  <section class="bg-white pb-28 md:pb-8">
    <div v-if="currentChampionship" class="sticky top-0 z-20">
      <ChampionshipHeader :championship="currentChampionship">
        <template #right>
          <button
            v-if="!isParticipant"
            :disabled="stores.pools.loading"
            class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 whitespace-nowrap"
            @click="joinPool"
          >
            Entrar no Bolão
          </button>

          <NuxtLink
            :to="isParticipant ? `/pools/${poolId}/bets` : ''"
            :class="[
              'text-sm font-semibold whitespace-nowrap transition-colors duration-200',
              isParticipant
                ? 'text-gray-600 hover:text-blue-600'
                : 'text-gray-400 cursor-not-allowed',
            ]"
          >
            Ver Todos Palpites
          </NuxtLink>

          <NuxtLink
            :to="isParticipant ? `/pools/${poolId}/info` : ''"
            :class="[
              'text-sm font-semibold whitespace-nowrap transition-colors duration-200',
              isParticipant
                ? 'text-gray-600 hover:text-blue-600'
                : 'text-gray-400 cursor-not-allowed',
            ]"
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

    <MatchList :matches-by-day="matchesByDay" :loading="stores.matches.loading">
      <template #match="{ matches }">
        <template v-for="match in matches" :key="match.id">
          <div class="bg-white border-b border-gray-200">
            <div
              class="px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
              :class="{ 'cursor-pointer': match.status === 'NS' }"
              @click="toggleMatchDetails(match, $event)"
            >
              <div
                class="flex flex-col items-center md:grid md:grid-cols-[100px_1fr_150px] md:items-center md:gap-4 w-full"
              >
                <div
                  class="order-2 md:order-1 text-center md:text-left mt-2 md:mt-0"
                >
                  <div class="text-sm font-medium text-gray-800">
                    {{ formatTime(match.date) }}
                  </div>
                </div>

                <div
                  class="order-1 md:order-2 flex items-center justify-center w-full"
                >
                  <div
                    class="grid grid-cols-[1fr_auto_1fr] gap-x-2 items-center w-full max-w-sm"
                  >
                    <div class="flex items-center gap-2 justify-end min-w-0">
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

                    <div class="flex items-center gap-1">
                      <input
                        v-model.number="betForms[match.id].homeScoreBet"
                        type="text"
                        :disabled="
                          isBettingTimeExpired(match) || !isParticipant
                        "
                        class="w-6 text-center border rounded-md"
                        @click.stop
                      >
                      <span>-</span>
                      <input
                        v-model.number="betForms[match.id].awayScoreBet"
                        type="text"
                        :disabled="
                          isBettingTimeExpired(match) || !isParticipant
                        "
                        class="w-6 text-center border rounded-md"
                        @click.stop
                      >
                    </div>

                    <div class="flex items-center gap-2 justify-start min-w-0">
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
                </div>

                <div
                  class="order-3 md:order-3 text-center md:text-right mt-2 md:mt-0"
                >
                  <div
                    v-if="match.status !== 'FT'"
                    class="flex items-center justify-center md:justify-end gap-1.5"
                  >
                    <div
                      v-if="currentPool?.betDeadlineHours !== undefined"
                      class="text-xs font-medium text-gray-600 whitespace-nowrap"
                    >
                      {{ countdowns[match.id] || "Calculando..." }}
                    </div>
                    <div class="relative group">
                      <InformationCircleIcon class="w-4 h-4 text-gray-400" />
                      <span
                        class="absolute bottom-full right-0 p-1 mb-2 text-xs text-center text-white bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[60]"
                      >
                        Tempo Limite do Palpite
                      </span>
                    </div>
                  </div>
                  <div
                    v-else-if="match.status === 'FT'"
                    class="font-medium text-sm text-gray-800 whitespace-nowrap"
                  >
                    {{ match.homeScore }} - {{ match.awayScore }}
                  </div>
                </div>
              </div>
            </div>

            <Transition name="expand">
              <div
                v-if="expandedMatchId === match.id"
                class="bg-gray-50/70 p-4 sm:p-6"
              >
                <div
                  v-if="detailsLoading"
                  class="text-center text-sm text-gray-500 py-4"
                >
                  Analisando dados...
                </div>

                <div v-else-if="lastGamesData[match.id]">
                  <div>
                    <h3
                      class="text-lg font-bold text-gray-800 text-center mb-4"
                    >
                      Forma Recente
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <div class="flex items-center gap-2 mb-3">
                          <img
                            :src="match.homeTeamLogoUrl"
                            class="w-5 h-5 object-contain"
                          >
                          <h4 class="font-semibold text-gray-700">
                            Últimos 5 de {{ match.homeTeamName }}
                          </h4>
                        </div>
                        <div class="bg-white rounded-lg border p-2">
                          <div
                            v-for="game in lastGamesData[match.id].homeTeam"
                            :key="game.id"
                            class="grid grid-cols-[1fr_auto_1fr] items-center text-xs py-1.5 border-b border-gray-100 last:border-b-0"
                          >
                            <span
                              class="text-right font-medium text-gray-600 truncate pr-2"
                              >{{ game.homeTeamName }}</span
                            >
                            <span
                              class="font-bold text-xs px-1.5 py-0.5 rounded"
                              :class="
                                getGameResultClass(game, match.homeTeamApiId)
                              "
                            >
                              {{ game.homeScore }} &times;
                              {{ game.awayScore }}
                            </span>
                            <span
                              class="text-left font-medium text-gray-600 truncate pl-2"
                              >{{ game.awayTeamName }}</span
                            >
                          </div>
                        </div>
                      </div>
                      <div>
                        <div class="flex items-center gap-2 mb-3">
                          <img
                            :src="match.awayTeamLogoUrl"
                            class="w-5 h-5 object-contain"
                          >
                          <h4 class="font-semibold text-gray-700">
                            Últimos 5 de {{ match.awayTeamName }}
                          </h4>
                        </div>
                        <div class="bg-white rounded-lg border p-2">
                          <div
                            v-for="game in lastGamesData[match.id].awayTeam"
                            :key="game.id"
                            class="grid grid-cols-[1fr_auto_1fr] items-center text-xs py-1.5 border-b border-gray-100 last:border-b-0"
                          >
                            <span
                              class="text-right font-medium text-gray-600 truncate pr-2"
                              >{{ game.homeTeamName }}</span
                            >
                            <span
                              class="font-bold text-xs px-1.5 py-0.5 rounded"
                              :class="
                                getGameResultClass(game, match.awayTeamApiId)
                              "
                            >
                              {{ game.homeScore }} &times;
                              {{ game.awayScore }}
                            </span>
                            <span
                              class="text-left font-medium text-gray-600 truncate pl-2"
                              >{{ game.awayTeamName }}</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr class="my-8 border-gray-200" >

                  <div>
                    <div
                      v-if="isH2HLoading[match.id]"
                      class="text-center text-sm text-gray-500 py-4"
                    >
                      Buscando histórico de confrontos...
                    </div>

                    <div v-else-if="h2hData[match.id]">
                      <h3
                        class="text-lg font-bold text-gray-800 text-center mb-4"
                      >
                        Confronto Direto
                      </h3>
                      <div
                        class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-center mb-6"
                      >
                        <div
                          class="border-l-4 border-blue-500 bg-white p-3 rounded-r-md shadow-sm"
                        >
                          <div class="font-bold text-xl text-blue-800">
                            {{ h2hStats[match.id].homeWins }}
                          </div>
                          <div class="text-gray-600">
                            Vitórias {{ match.homeTeamName }}
                          </div>
                        </div>
                        <div
                          class="border-l-4 border-gray-400 bg-white p-3 rounded-r-md shadow-sm"
                        >
                          <div class="font-bold text-xl text-gray-800">
                            {{ h2hStats[match.id].draws }}
                          </div>
                          <div class="text-gray-600">Empates</div>
                        </div>
                        <div
                          class="border-l-4 border-red-500 bg-white p-3 rounded-r-md shadow-sm"
                        >
                          <div class="font-bold text-xl text-red-800">
                            {{ h2hStats[match.id].awayWins }}
                          </div>
                          <div class="text-gray-600">
                            Vitórias {{ match.awayTeamName }}
                          </div>
                        </div>
                      </div>

                      <div class="mb-6">
                        <h4
                          class="text-sm font-semibold text-gray-700 mb-3 text-center"
                        >
                          Gols no Confronto (Total)
                        </h4>
                        <div class="space-y-2 text-xs">
                          <div class="flex items-center gap-2">
                            <span class="w-28 text-right truncate">{{
                              match.homeTeamName
                            }}</span>
                            <div class="flex-1 bg-gray-200 rounded-full h-2.5">
                              <div
                                class="bg-blue-500 h-2.5 rounded-full"
                                :style="{
                                  width:
                                    h2hGoals[match.id]?.homePercentage + '%',
                                }"
                              />
                            </div>
                            <span class="font-bold w-8 text-left">{{
                              h2hGoals[match.id]?.homeGoals
                            }}</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <span class="w-28 text-right truncate">{{
                              match.awayTeamName
                            }}</span>
                            <div class="flex-1 bg-gray-200 rounded-full h-2.5">
                              <div
                                class="bg-red-500 h-2.5 rounded-full"
                                :style="{
                                  width:
                                    h2hGoals[match.id]?.awayPercentage + '%',
                                }"
                              />
                            </div>
                            <span class="font-bold w-8 text-left">{{
                              h2hGoals[match.id]?.awayGoals
                            }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4
                            class="text-sm font-semibold text-gray-700 mb-2 text-center"
                          >
                            Últimos 5 (Geral)
                          </h4>
                          <div class="bg-white rounded-lg border p-2">
                            <div
                              v-for="game in overallH2HGames[match.id]"
                              :key="game.apiFootballFixtureId"
                              class="grid grid-cols-[1fr_auto_1fr] items-center text-xs py-1.5 border-b border-gray-100 last:border-b-0"
                            >
                              <span
                                class="text-right font-medium text-gray-600 truncate pr-2"
                                >{{ game.homeTeamName }}</span
                              >
                              <span
                                class="font-bold text-xs px-1.5 py-0.5 rounded"
                                :class="
                                  getGameResultClass(game, match.homeTeamApiId)
                                "
                                >{{ game.homeScore }} &times;
                                {{ game.awayScore }}</span
                              >
                              <span
                                class="text-left font-medium text-gray-600 truncate pl-2"
                                >{{ game.awayTeamName }}</span
                              >
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4
                            class="text-sm font-semibold text-gray-700 mb-2 text-center"
                          >
                            {{ match.homeTeamName }} (Mandante)
                          </h4>
                          <div class="bg-white rounded-lg border p-2">
                            <div
                              v-if="
                                homeHomeGames[match.id] &&
                                homeHomeGames[match.id].length > 0
                              "
                            >
                              <div
                                v-for="game in homeHomeGames[match.id]"
                                :key="game.apiFootballFixtureId"
                                class="grid grid-cols-[1fr_auto_1fr] items-center text-xs py-1.5 border-b border-gray-100 last:border-b-0"
                              >
                                <span
                                  class="text-right font-medium text-gray-600 truncate pr-2"
                                  >{{ game.homeTeamName }}</span
                                >
                                <span
                                  class="font-bold text-xs px-1.5 py-0.5 rounded"
                                  :class="
                                    getGameResultClass(
                                      game,
                                      match.homeTeamApiId
                                    )
                                  "
                                  >{{ game.homeScore }} &times;
                                  {{ game.awayScore }}</span
                                >
                                <span
                                  class="text-left font-medium text-gray-600 truncate pl-2"
                                  >{{ game.awayTeamName }}</span
                                >
                              </div>
                            </div>
                            <div
                              v-else
                              class="text-center text-xs text-gray-500 py-2 h-full flex items-center justify-center"
                            >
                              <p>
                                Nenhum jogo recente encontrado como mandante no
                                confronto.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-else class="text-center">
                      <button
                        class="inline-flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-800"
                        @click="loadH2H(match)"
                      >
                        Ver Confronto Direto
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </template>
      </template>
    </MatchList>

    <div
      v-if="hasUnplayedMatches && isParticipant"
      class="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200 md:relative md:p-0 md:bg-transparent md:border-none md:mt-6 text-center"
    >
      <button
        :disabled="!hasChanges || !allBetsAreFilled || stores.bet.loading"
        class="w-full px-4 py-3 text-base font-semibold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 md:w-auto md:px-6 md:py-2 md:text-sm md:shadow-sm"
        @click="submitAllBets"
      >
        Salvar Rodada
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, watch, ref, nextTick } from "vue";
import { useRoute } from "vue-router";
import { InformationCircleIcon } from "@heroicons/vue/24/outline";

const stores = useStores();
const route = useRoute();

const poolId = computed(() => route.params.id);

const currentPool = ref(null);
const currentChampionship = ref(null);

const betForms = ref({});
const initialBetForms = ref({});
const countdowns = reactive({});
let countdownIntervals = {};

const selectedRound = ref(null);

const expandedMatchId = ref(null);

const lastGamesData = reactive({});
const h2hData = reactive({});
const h2hStats = reactive({});
const h2hGoals = reactive({});
const overallH2HGames = reactive({});
const homeHomeGames = reactive({});
const detailsLoading = ref(false);
const isH2HLoading = reactive({});

const isParticipant = computed(() => {
  const currentPoolData = stores.pools.currentPool;
  const currentUser = stores.auth.user;

  if (!currentPoolData || !currentUser || !currentUser.id) {
    return false;
  }

  return currentPoolData.participants.some((p) => p.userId === currentUser.id);
});

const joinPool = async () => {
  const result = await stores.pools.joinPool(poolId.value);
  if (result.success) {
    stores.ui.showToast("Você entrou no bolão com sucesso!", "success");
    stores.pools.currentPool = result.data;
    await stores.bet.fetchBets({ poolId: poolId.value });
  } else {
    stores.ui.showToast(result.error || "Ocorreu um erro ao entrar no bolão.", "error");
  }
};

const populateBetForms = () => {
  const newBetForms = {};
  matchesOfSelectedRound.value.forEach((match) => {
    const existingBet = findBetForMatch(match.id);
    newBetForms[match.id] = {
      homeScoreBet: existingBet?.homeScoreBet ?? null,
      awayScoreBet: existingBet?.awayScoreBet ?? null,
    };
  });
  betForms.value = newBetForms;
  initialBetForms.value = JSON.parse(JSON.stringify(newBetForms));
};

const findBetForMatch = (matchId) => {
  return stores.bet.bets.find((bet) => {
    return bet.match.id === matchId;
  });
};

const hasChanges = computed(() => {
  const current = betForms.value;
  const initial = initialBetForms.value;
  const currentKeys = Object.keys(current);
  const initialKeys = Object.keys(initial);

  if (currentKeys.length !== initialKeys.length) return true;

  for (const matchId of currentKeys) {
    if (
      current[matchId]?.homeScoreBet !== initial[matchId]?.homeScoreBet ||
      current[matchId]?.awayScoreBet !== initial[matchId]?.awayScoreBet
    ) {
      return true;
    }
  }

  return false;
});

const findCurrentRound = (allMatches) => {
  const now = new Date();
  const todayString = now.toDateString();

  const matchToday = allMatches.find(
    (m) => new Date(m.date).toDateString() === todayString
  );

  if (matchToday) {
    return matchToday.round;
  }

  const upcomingMatch = allMatches
    .filter((m) => new Date(m.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  if (upcomingMatch) {
    return upcomingMatch.round;
  }

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

const isBettingTimeExpired = (match) => {
  if (!currentPool.value || !match.date) return true;
  const matchDate = new Date(match.date);
  const deadlineDate = new Date(
    matchDate.getTime() - currentPool.value.betDeadlineHours * 60 * 60 * 1000
  );
  return new Date() > deadlineDate;
};

const allBetsAreFilled = computed(() => {
  const openMatches = matchesOfSelectedRound.value.filter(
    (m) => m.status === "NS" && !isBettingTimeExpired(m)
  );

  if (openMatches.length === 0) return true;

  return openMatches.every((match) => {
    const form = betForms.value[match.id];
    return (
      form &&
      typeof form.homeScoreBet === "number" &&
      typeof form.awayScoreBet === "number"
    );
  });
});

const hasUnplayedMatches = computed(() => {
  return matchesOfSelectedRound.value.some((m) => m.status !== "FT");
});

const updateCountdown = (match) => {
  const matchDate = new Date(match.date);
  const deadlineDate = new Date(
    matchDate.getTime() - currentPool.value.betDeadlineHours * 60 * 60 * 1000
  );
  const now = new Date();
  const diff = deadlineDate.getTime() - now.getTime();

  if (diff <= 0) {
    countdowns[match.id] = "Tempo esgotado!";
    clearInterval(countdownIntervals[match.id]);
    return;
  }

  const secondsTotal = Math.floor(diff / 1000);
  const days = Math.floor(secondsTotal / (60 * 60 * 24));
  const hours = Math.floor((secondsTotal % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((secondsTotal % (60 * 60)) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  if (parts.length === 0) parts.push("0m");

  countdowns[match.id] = parts.join(" ");
};

const clearAllCountdowns = () => {
  for (const matchId in countdownIntervals) {
    clearInterval(countdownIntervals[matchId]);
  }
  countdownIntervals = {};
};

const calculateH2HStats = (matches, homeTeamId) => {
  let homeWins = 0;
  let awayWins = 0;
  let draws = 0;

  matches.forEach((match) => {
    if (match.homeScore === match.awayScore) {
      draws++;
    } else if (
      (match.homeTeamApiId === homeTeamId &&
        match.homeScore > match.awayScore) ||
      (match.awayTeamApiId === homeTeamId && match.awayScore > match.homeScore)
    ) {
      homeWins++;
    } else {
      awayWins++;
    }
  });

  return { homeWins, awayWins, draws };
};

const filterHomeHomeGames = (matches, homeTeamId) => {
  return matches
    .filter((match) => match.homeTeamApiId === homeTeamId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
};

const calculateH2HGoals = (matches, homeTeamId, awayTeamId) => {
  let homeGoals = 0;
  let awayGoals = 0;
  matches.forEach((m) => {
    if (m.homeTeamApiId === homeTeamId) homeGoals += m.homeScore;
    if (m.awayTeamApiId === homeTeamId) homeGoals += m.awayScore;
    if (m.homeTeamApiId === awayTeamId) awayGoals += m.homeScore;
    if (m.awayTeamApiId === awayTeamId) awayGoals += m.awayScore;
  });
  const totalGoals = homeGoals + awayGoals;
  return {
    homeGoals,
    awayGoals,
    homePercentage: totalGoals > 0 ? (homeGoals / totalGoals) * 100 : 0,
    awayPercentage: totalGoals > 0 ? (awayGoals / totalGoals) * 100 : 0,
  };
};

const fetchH2HData = async (match) => {
  const result = await stores.matches.fetchH2H(
    match.homeTeamApiId,
    match.awayTeamApiId
  );

  if (result.success && Array.isArray(result.data)) {
    const finishedGames = result.data.filter((g) => g.status === "FT");
    h2hData[match.id] = finishedGames;

    h2hStats[match.id] = calculateH2HStats(finishedGames, match.homeTeamApiId);
    h2hGoals[match.id] = calculateH2HGoals(
      finishedGames,
      match.homeTeamApiId,
      match.awayTeamApiId
    );
    overallH2HGames[match.id] = [...finishedGames]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    homeHomeGames[match.id] = filterHomeHomeGames(
      finishedGames,
      match.homeTeamApiId
    );
  } else {
    stores.ui.showToast("Erro ao carregar confrontos diretos.", "error");
    h2hData[match.id] = [];
  }
};

const fetchLast5Games = async (match) => {
  const result = await stores.matches.fetchLastGames(
    currentChampionship.value.apiFootballId,
    match.homeTeamApiId,
    match.awayTeamApiId
  );
  if (result.success && result.data) {
    lastGamesData[match.id] = {
      homeTeam: result.data[match.homeTeamApiId] || [],
      awayTeam: result.data[match.awayTeamApiId] || [],
    };
  } else {
    stores.ui.showToast("Erro ao carregar últimos jogos.", "error");
    lastGamesData[match.id] = { homeTeam: [], awayTeam: [] };
  }
};

onMounted(async () => {
  const poolResult = await stores.pools.fetchPoolById(poolId.value);

  if (poolResult.success && poolResult.data) {
    currentPool.value = poolResult.data;
    const championshipId = currentPool.value.baseChampionshipId;

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
      await stores.bet.fetchBets({ poolId: poolId.value });
      stores.championships.selectChampionship(currentChampionship.value);
    } else {
      stores.ui.showToast("Campeonato não encontrado para este bolão.", "error");
      navigateTo("/");
    }
  } else {
    stores.ui.showToast("Bolão não encontrado ou ocorreu um erro.", "error");
    navigateTo("/");
  }
});

watch(
  [() => matchesOfSelectedRound.value, () => stores.bet.bets],
  () => {
    populateBetForms();
    clearAllCountdowns();
    matchesOfSelectedRound.value.forEach((match) => {
      if (match.status !== "FT" && currentPool.value) {
        if (!countdownIntervals[match.id]) {
          updateCountdown(match);
          countdownIntervals[match.id] = setInterval(() => {
            updateCountdown(match);
          }, 60000);
        }
      }
    });
  },
  { immediate: true, deep: true }
);

const submitAllBets = async () => {
  const unplayedMatches = matchesOfSelectedRound.value.filter(
    (m) => m.status !== "FT"
  );

  if (!allBetsAreFilled.value) {
    stores.ui.showToast(
      "Por favor, preencha todos os jogos da rodada com palpites válidos antes de salvar.",
      "error"
    );
    return;
  }

  const betsToSubmit = unplayedMatches.filter((match) => {
    const form = betForms.value[match.id];
    const initialForm = initialBetForms.value[match.id];
    return (
      (form.homeScoreBet !== initialForm.homeScoreBet ||
        form.awayScoreBet !== initialForm.awayScoreBet) &&
      form.homeScoreBet !== null &&
      form.awayScoreBet !== null &&
      !isNaN(form.homeScoreBet) &&
      !isNaN(form.awayScoreBet)
    );
  });

  if (betsToSubmit.length === 0) {
    stores.ui.showToast(
      "Nenhum palpite válido para salvar. Por favor, preencha os campos.",
      "error"
    );
    return;
  }

  const results = await Promise.all(
    betsToSubmit.map(async (match) => {
      const form = betForms.value[match.id];
      return stores.bet.createOrUpdateBet(
        poolId.value,
        match.id,
        form.homeScoreBet,
        form.awayScoreBet
      );
    })
  );

  const errors = results.filter((r) => !r.success);
  if (errors.length > 0) {
    stores.ui.showToast(
      "Ocorreu um erro ao salvar alguns palpites. Verifique o console para mais detalhes.",
      "error"
    );
    console.error("Erros ao salvar palpites:", errors);
  } else {
    stores.ui.showToast("Todos os palpites foram salvos com sucesso!", "success");
    initialBetForms.value = JSON.parse(JSON.stringify(betForms.value));
  }
};

const toggleMatchDetails = async (match, event) => {
  if (match.status === "FT") return;

  const isClosing = expandedMatchId.value === match.id;
  if (isClosing) {
    expandedMatchId.value = null;
    return;
  }

  expandedMatchId.value = match.id;

  if (event && event.currentTarget) {
    nextTick(() => {
      const detailsPanel = event.currentTarget.nextElementSibling;
      if (detailsPanel) {
        setTimeout(() => {
          detailsPanel.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }, 50);
      }
    });
  }

  if (!lastGamesData[match.id]) {
    detailsLoading.value = true;
    try {
      await fetchLast5Games(match);
    } catch (error) {
      console.error("Falha ao carregar últimos jogos:", error);
      stores.ui.showToast("Não foi possível carregar os últimos jogos.", "error");
    } finally {
      detailsLoading.value = false;
    }
  }
};

const loadH2H = async (match) => {
  isH2HLoading[match.id] = true;
  try {
    await fetchH2HData(match);
  } catch (error) {
    console.error("Falha ao carregar dados de H2H:", error);
    stores.ui.showToast("Não foi possível carregar o confronto direto.", "error");
  } finally {
    isH2HLoading[match.id] = false;
  }
};

const getGameResultLetter = (game, teamId) => {
  if (game.homeScore === game.awayScore) return "E";

  const isTeamHome = game.homeTeamApiId === teamId;
  const isTeamAway = game.awayTeamApiId === teamId;

  if (isTeamHome && game.homeScore > game.awayScore) return "V";
  if (isTeamAway && game.awayScore > game.homeScore) return "V";

  return "D";
};

const getGameResultClass = (game, teamId) => {
  const result = getGameResultLetter(game, teamId);
  switch (result) {
    case "V":
      return "bg-green-100 text-green-800";
    case "D":
      return "bg-red-100 text-red-800";
    case "E":
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const formatTime = (dateString) =>
  new Date(dateString).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const isHomeWinner = (match) =>
  match.status === "FT" && match.homeScore > match.awayScore;
const isAwayWinner = (match) =>
  match.status === "FT" && match.awayScore > match.homeScore;
</script>

<style>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.4s ease-in-out;
  max-height: 1200px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
