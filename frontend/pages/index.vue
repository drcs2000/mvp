<template>
  <section class="bg-white">
    <div class="sticky top-0 z-20">
      <header
        class="flex items-center shrink-0 p-4 sm:p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm gap-4"
      >
        <div class="relative w-full max-w-xs">
          <div
            class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
          >
            <MagnifyingGlassIcon class="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            placeholder="Pesquise"
            class="block w-full p-2 pl-10 text-sm text-gray-900 bg-gray-100 border-none rounded-lg focus:outline-none"
          >
        </div>
        <div class="flex flex-1 items-center justify-between">
          <div
            v-if="stores.championships.loading"
            class="text-sm text-gray-400 whitespace-nowrap"
          >
            A carregar ligas...
          </div>
          <button
            v-for="championship in leagueChampionships"
            :key="championship.id"
            :class="[
              'relative p-2 group transition-all duration-300',
              selectedChampionship?.id === championship.id
                ? 'grayscale-0 opacity-100'
                : 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100',
            ]"
            @click="selectChampionshipWithAnimation(championship)"
          >
            <img
              :src="championship.leagueLogoUrl"
              class="w-6 h-6 object-contain shrink-0"
            >
          </button>
        </div>
      </header>

      <Transition name="fade" mode="out-in">
        <div
          v-if="showFeaturedMatch && featuredMatch && !stores.matches.loading"
          :key="`featured-${selectedChampionship?.id}`"
          class="shrink-0 p-4 sm:p-6 border-b border-gray-200 bg-white"
        >
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-900">
              {{ selectedChampionship?.name }}
            </h2>
            <p v-if="currentRound" class="text-sm font-semibold text-gray-500">
              Rodada {{ currentRoundNumber }}
            </p>
          </div>
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
      </Transition>
    </div>

    <Transition name="fade" mode="out-in">
      <div
        v-if="showMatchesContent"
        :key="`matches-${selectedChampionship?.id}`"
        class="pb-6"
      >
        <div
          v-if="stores.matches.loading"
          class="pt-8 text-center text-gray-500"
        >
          A carregar jogos...
        </div>
        <div v-else-if="Object.keys(matchesByDay).length > 0" class="mt-2">
          <div v-for="(matches, day) in matchesByDay" :key="day" class="mb-6">
            <h3 class="py-2 px-4 sm:px-6 text-sm font-semibold text-gray-500">
              {{ formatDate(day) }}
            </h3>
            <div class="space-y-px">
              <!-- INÍCIO DA ALTERAÇÃO -->
              <NuxtLink
                v-for="match in matches"
                :key="match.id"
                class="grid grid-cols-1 md:grid-cols-[100px,1fr,150px] gap-4 items-center px-4 sm:px-6 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
              >
                <!-- Coluna 1: Horário (Apenas Desktop) -->
                <div class="hidden md:block text-sm font-medium text-gray-800">
                  {{ formatTime(match.date) }}
                </div>

                <!-- Coluna 2: Detalhes da Partida (Principal) -->
                <div
                  class="grid grid-cols-[1fr,auto,auto,auto,1fr] items-center gap-3 text-sm"
                >
                  <!-- Time da Casa -->
                  <span
                    class="text-right truncate"
                    :class="{ 'font-bold': isHomeWinner(match) }"
                    >{{ match.homeTeamName }}</span
                  >
                  <img
                    :src="match.homeTeamLogoUrl"
                    class="object-contain w-6 h-6 shrink-0"
                  >
                  <!-- Bloco do Placar/Status -->
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
                    <!-- Horário ou Status (Apenas Mobile) -->
                    <span class="md:hidden text-xs text-gray-500 mt-1">
                      <span
                        v-if="match.status === 'NS' || match.status === 'PST'"
                        >{{ formatTime(match.date) }}</span
                      >
                      <span v-else>{{ getStatusText(match.status) }}</span>
                    </span>
                  </div>

                  <!-- Time Visitante -->
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

                <!-- Coluna 3: Estádio ou Status (Apenas Desktop) -->
                <div
                  class="hidden md:block text-sm text-right text-gray-500 truncate"
                >
                  <span
                    v-if="match.status === 'NS' || match.status === 'PST'"
                    >{{ match.stadium }}</span
                  >
                  <span v-else class="font-semibold">{{
                    getStatusText(match.status)
                  }}</span>
                </div>
              </NuxtLink>
              <!-- FIM DA ALTERAÇÃO -->
            </div>
          </div>
        </div>
        <div v-else class="pt-8 text-center text-gray-500">
          <p>Nenhum jogo encontrado para a rodada atual neste campeonato.</p>
        </div>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { computed, onMounted, watch, ref, nextTick } from "vue";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";

const stores = useStores();

const selectedChampionship = computed({
  get: () => stores.championships.selectedChampionship,
  set: (value) => stores.championships.selectChampionship(value),
});

const showFeaturedMatch = ref(false);
const showMatchesContent = ref(false);

onMounted(async () => {
  await stores.championships.fetchAllChampionships();
  if (leagueChampionships.value.length > 0) {
    selectedChampionship.value = leagueChampionships.value[0];
  }

  setTimeout(() => {
    showFeaturedMatch.value = true;
    showMatchesContent.value = true;
  }, 100);
});

const selectChampionshipWithAnimation = async (championship) => {
  showFeaturedMatch.value = false;
  showMatchesContent.value = false;

  await new Promise((resolve) => setTimeout(resolve, 300));

  selectedChampionship.value = championship;

  await nextTick();

  showFeaturedMatch.value = true;
  showMatchesContent.value = true;
};

watch(selectedChampionship, async (newChampionship) => {
  if (newChampionship) {
    showFeaturedMatch.value = false;
    showMatchesContent.value = false;

    await stores.matches.fetchByChampionship(newChampionship.apiFootballId);

    showFeaturedMatch.value = true;
    showMatchesContent.value = true;
  }
});

const leagueChampionships = computed(() => {
  return stores.championships.championships.filter((c) => c.type === "League");
});

const currentRound = computed(() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayKey = `${year}-${month}-${day}`;

  const todayMatches = stores.matches.matches.filter((m) =>
    m.date.startsWith(todayKey)
  );

  if (todayMatches.length > 0) {
    return todayMatches[0].round;
  }

  const upcomingMatch = stores.matches.matches
    .filter((m) => new Date(m.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  if (upcomingMatch) return upcomingMatch.round;

  const lastMatch = [...stores.matches.matches].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )[0];

  return lastMatch ? lastMatch.round : null;
});

const currentRoundNumber = computed(() => {
  if (!currentRound.value) return "";
  return currentRound.value.match(/\d+/)?.[0] || "";
});

const matchesOfCurrentRound = computed(() => {
  if (!currentRound.value) return [];
  return stores.matches.matches
    .filter((m) => m.round === currentRound.value)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
});

const matchesByDay = computed(() => {
  return matchesOfCurrentRound.value.reduce((acc, match) => {
    const dateKey = match.date.split("T")[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(match);
    return acc;
  }, {});
});

const featuredMatch = computed(() => {
  if (matchesOfCurrentRound.value.length === 0) return null;
  return (
    matchesOfCurrentRound.value.find((m) => m.status !== "FT") ||
    matchesOfCurrentRound.value[0]
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
  ({
    NS: "Agendado",
    PST: "Adiado",
    FT: "Encerrado",
    "1H": "1º Tempo",
    "2H": "2º Tempo",
    HT: "Intervalo",
  }[status] || status);

const isHomeWinner = (match) =>
  match.status === "FT" && match.homeScore > match.awayScore;
const isAwayWinner = (match) =>
  match.status === "FT" && match.awayScore > match.homeScore;
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.page-enter-active {
  transition: all 0.4s ease-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
</style>
