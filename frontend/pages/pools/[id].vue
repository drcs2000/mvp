<template>
  <section class="bg-white">
    <AppToast :message="toastMessage" :type="toastType" />

    <div v-if="currentChampionship" class="sticky top-0 z-20">
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
            :to="`/pools/${poolId}/bets?round=${currentRoundNumber}`"
            class="text-sm font-semibold text-gray-600 hover:text-blue-500 transition-colors duration-200 whitespace-nowrap"
          >
            Ver Todos Palpites
          </NuxtLink>
          <NuxtLink
            :to="`/pools/${poolId}/standings`"
            class="text-sm font-semibold text-gray-600 hover:text-blue-500 transition-colors duration-200 whitespace-now-rap"
          >
            Classificação
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
                <span :class="{ 'font-bold': isHomeWinner(featuredMatch) }">{{
                  featuredMatch.homeScore ?? ""
                }}</span>
                <span v-if="featuredMatch.status === 'FT'"> - </span>
                <span v-if="featuredMatch.status !== 'FT'">{{
                  formatTime(featuredMatch.date)
                }}</span>
                <span
                  v-if="featuredMatch.status === 'FT'"
                  :class="{ 'font-bold': isAwayWinner(featuredMatch) }"
                  >{{ featuredMatch.awayScore ?? "" }}</span
                >
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
      <div v-if="stores.matches.loading" class="pt-8 text-center text-gray-500">
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
              class="grid grid-cols-[100px_1fr_100px] gap-4 items-center px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
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
                <div class="flex items-center gap-1">
                  <input
                    v-model.number="betForms[match.id].homeScoreBet"
                    type="text"
                    :disabled="isBettingTimeExpired(match)"
                    class="w-6 text-center border rounded-md"
                  />
                  <span>-</span>
                  <input
                    v-model.number="betForms[match.id].awayScoreBet"
                    type="text"
                    :disabled="isBettingTimeExpired(match)"
                    class="w-6 text-center border rounded-md"
                  />
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

              <div class="flex flex-col items-end gap-1">
                <div
                  v-if="match.status !== 'FT'"
                  class="flex items-center gap-1.5"
                >
                  <div
                    v-if="currentPool?.betDeadlineHours !== undefined"
                    class="text-xs font-medium text-gray-600 text-right whitespace-nowrap"
                  >
                    {{ countdowns[match.id] || "Calculando..." }}
                  </div>
                  <div class="relative group">
                    <InformationCircleIcon class="w-4 h-4 text-gray-400" />
                    <span
                      class="absolute bottom-full right-0 p-1 mb-2 text-xs text-center text-white bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
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
        </div>
        <div class="mt-4 text-center" v-if="hasUnplayedMatches">
          <button
            @click="submitAllBets"
            :disabled="
              !hasChanges ||
              !allBetsAreFilled ||
              isRoundDeadlineExpired ||
              stores.bet.loading
            "
            class="px-4 py-2 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Salvar Rodada
          </button>
        </div>
      </div>
      <div v-else class="pt-8 text-center text-gray-500">
        <p>Nenhum jogo encontrado para esta rodada.</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, watch, ref } from "vue";
import { useRoute } from "vue-router";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  InformationCircleIcon,
} from "@heroicons/vue/24/outline";
import AppToast from "~/components/AppToast.vue";

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

const toastMessage = ref("");
const toastType = ref("success");
const showToast = (message, type) => {
  toastMessage.value = message;
  toastType.value = type;
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

  // AQUI: A linha foi alterada de `for (const match of currentKeys)`
  // para `for (const matchId of currentKeys)`
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

const isBettingTimeExpired = (match) => {
  if (!currentPool.value || !match.date) return true;
  const matchDate = new Date(match.date);
  const deadlineDate = new Date(
    matchDate.getTime() - currentPool.value.betDeadlineHours * 60 * 60 * 1000
  );
  return new Date() > deadlineDate;
};

const isRoundDeadlineExpired = computed(() => {
  const unplayedMatches = matchesOfSelectedRound.value.filter(
    (m) => m.status !== "FT"
  );
  return unplayedMatches.some((match) => isBettingTimeExpired(match));
});

const allBetsAreFilled = computed(() => {
  const unplayedMatches = matchesOfSelectedRound.value.filter(
    (m) => m.status !== "FT"
  );
  if (unplayedMatches.length === 0) return false;
  return unplayedMatches.every((match) => {
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
    delete countdownIntervals[match.id];
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
  for (const matchId in countdowns) {
    delete countdowns[matchId];
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
      showToast("Campeonato não encontrado para este bolão.", "error");
    }
  } else {
    showToast("Bolão não encontrado ou ocorreu um erro.", "error");
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
          }, 1000);
        }
      }
    });
  },
  { immediate: true, deep: true }
);

watch(
  betForms,
  (newForms) => {
    for (const matchId in newForms) {
      const form = newForms[matchId];
      if (form) {
        form.isValid =
          typeof form.homeScoreBet === "number" &&
          typeof form.awayScoreBet === "number";
      }
    }
  },
  { deep: true }
);

const submitAllBets = async () => {
  const unplayedMatches = matchesOfSelectedRound.value.filter(
    (m) => m.status !== "FT"
  );

  if (!allBetsAreFilled.value) {
    showToast(
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
    showToast(
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
    showToast(
      "Ocorreu um erro ao salvar alguns palpites. Verifique o console para mais detalhes.",
      "error"
    );
    console.error("Erros ao salvar palpites:", errors);
  } else {
    showToast("Todos os palpites foram salvos com sucesso!", "success");
    initialBetForms.value = JSON.parse(JSON.stringify(betForms.value));
  }
};

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
  ({ NS: "Agendado", FT: "Encerrado", "1H": "1º Tempo", "2H": "2º Tempo" }[
    status
  ] || status);
const isHomeWinner = (match) =>
  match.status === "FT" && match.homeScore > match.awayScore;
const isAwayWinner = (match) =>
  match.status === "FT" && match.awayScore > match.homeScore;
</script>
