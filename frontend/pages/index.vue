<template>
  <section class="bg-gray-50 min-h-screen">
    <div class="sticky top-0 z-20">
      <header class="bg-white/95 backdrop-blur-sm">
        <nav class="w-full overflow-x-auto no-scrollbar">
          <div
            v-if="!stores.championships.loading"
            class="flex border-b border-gray-200"
          >
            <button
              v-for="championship in leagueChampionships"
              :key="championship.id"
              :class="[
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap shrink-0',
                selectedChampionship?.id === championship.id
                  ? 'border-b-2 border-gray-800 text-gray-800 font-semibold'
                  : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300',
              ]"
              @click="selectChampionshipWithAnimation(championship)"
            >
              <img
                :src="championship.leagueLogoUrl"
                class="w-5 h-5 object-contain shrink-0"
              >
              <span>{{ championship.name }}</span>
            </button>
          </div>
        </nav>
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
            <div class="space-y-px bg-white">
              <NuxtLink
                v-for="match in matches"
                :key="match.id"
                class="grid grid-cols-1 md:grid-cols-[100px,1fr,150px] gap-4 items-center px-4 sm:px-6 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200"
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

/* Classe para esconder a barra de rolagem */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
