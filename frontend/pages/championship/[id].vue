<template>
  <section>
    <div v-if="championship" class="sticky top-0 z-20">
      <header
        class="flex items-center shrink-0 p-4 sm:p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm gap-4 dark:bg-gray-800/80 dark:border-gray-700"
      >
        <img :src="championship.logoUrl" class="w-8 h-8 object-contain" >
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ championship.name }}
        </h1>
      </header>

      <div
        v-if="featuredMatch && !stores.matches.loading"
        class="shrink-0 p-4 sm:p-6 border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700"
      >
        <div class="p-4 text-white bg-gray-800 dark:bg-gray-700 rounded-xl">
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
                <span
                  v-if="
                    featuredMatch.status !== 'SCHEDULED' &&
                    featuredMatch.status !== 'POSTPONED'
                  "
                >
                  <span :class="{ 'font-bold': isHomeWinner(featuredMatch) }">{{
                    featuredMatch.homeScore ?? ""
                  }}</span>
                  -
                  <span :class="{ 'font-bold': isAwayWinner(featuredMatch) }">{{
                    featuredMatch.awayScore ?? ""
                  }}</span>
                </span>
                <span v-else>{{ formatTime(featuredMatch.date) }}</span>
              </div>
              <span class="mt-1 text-xs text-gray-400 dark:text-gray-300">{{
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

      <DateSelector
        v-if="!stores.matches.loading && allGameDays.length > 0"
        :is-first="isFirstDay"
        :is-last="isLastDay"
        :label="formatDate(selectedDate)"
        @previous="previousDay"
        @next="nextDay"
      />
    </div>

    <div class="pb-6">
      <div
        v-if="stores.matches.loading"
        class="pt-8 text-center text-gray-500 dark:text-gray-400"
      >
        A carregar jogos...
      </div>
      <div v-else-if="matchesOfSelectedDay.length > 0" class="mt-2">
        <div class="mb-6">
          <div class="space-y-px">
            <NuxtLink
              v-for="match in matchesOfSelectedDay"
              :key="match.id"
              class="grid grid-cols-1 md:grid-cols-[100px,1fr,150px] gap-4 items-center px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 dark:border-gray-700 dark:hover:bg-gray-800/50"
            >
              <div
                class="hidden md:block text-sm font-medium text-gray-800 dark:text-gray-300"
              >
                {{ formatTime(match.date) }}
              </div>
              <div
                class="grid grid-cols-[1fr,auto,auto,auto,1fr] items-center gap-3 text-sm text-gray-800 dark:text-gray-200"
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
                  <span class="w-12 text-center font-bold text-base">
                    <span
                      v-if="
                        match.status !== 'SCHEDULED' &&
                        match.status !== 'POSTPONED'
                      "
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
                  <span
                    class="md:hidden text-xs text-gray-500 dark:text-gray-400 mt-1"
                  >
                    <span
                      v-if="
                        match.status === 'SCHEDULED' ||
                        match.status === 'POSTPONED'
                      "
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
                class="hidden md:block text-sm text-right text-gray-500 dark:text-gray-400 truncate"
              >
                <span
                  v-if="
                    match.status === 'SCHEDULED' || match.status === 'POSTPONED'
                  "
                >
                  {{ match.venueName }}
                </span>
                <span v-else class="font-semibold">{{
                  getStatusText(match.status)
                }}</span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
      <div v-else class="pt-8 text-center text-gray-500 dark:text-gray-400">
        <p>Nenhum jogo encontrado para esta rodada.</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";

const route = useRoute();
const stores = useStores();

onMounted(async () => {
  if (stores.championships.allChampionships.length === 0) {
    await stores.championships.fetchAllChampionships();
  }
});

const championshipId = computed(() => Number(route.params.id));

const championship = computed(() =>
  stores.championships.allChampionships.find(
    (c) => c.id === championshipId.value
  )
);

const selectedDate = ref(null);

watch(
  championshipId,
  async (id) => {
    stores.matches.matches = [];
    selectedDate.value = null;

    if (id && !isNaN(id)) {
      await stores.matches.fetchByChampionship(id);
    } else {
      await stores.matches.fetchFeaturedMatches();
    }

    if (featuredMatch.value) {
      selectedDate.value = getLocalDateString(featuredMatch.value.date);
    }

    if (championship.value) {
      stores.championships.selectChampionship(championship.value.id);
    }
  },
  { immediate: true }
);

const getLocalDateString = (utcDateString) => {
  if (!utcDateString) return null;
  const date = new Date(utcDateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const allGameDays = computed(() => {
  if (!stores.matches.matches || stores.matches.matches.length === 0) return [];
  const dates = stores.matches.matches.map((match) =>
    getLocalDateString(match.date)
  );
  return [...new Set(dates)].sort();
});

const matchesOfSelectedDay = computed(() => {
  if (!selectedDate.value) return [];
  return stores.matches.matches
    .filter((m) => getLocalDateString(m.date) === selectedDate.value)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
});

const featuredMatch = computed(() => {
  const allMatches = stores.matches.matches;
  if (!allMatches || allMatches.length === 0) {
    return null;
  }

  const notPlayedStatuses = ["SCHEDULED", "POSTPONED", "NS", "TBD"];
  const nowTimestamp = Date.now(); 

  const todayString = getLocalDateString(new Date().toISOString());
  const todaysMatches = allMatches.filter(
    (m) => getLocalDateString(m.date) === todayString
  );

  if (todaysMatches.length > 0) {
    const liveTodayMatch = todaysMatches.find(
      (m) => m.status === "IN_PROGRESS" || m.status === "HALFTIME"
    );
    if (liveTodayMatch) return liveTodayMatch; 

    const upcomingTodayMatches = todaysMatches
      .filter(
        (m) =>
          new Date(m.date).getTime() >= nowTimestamp &&
          notPlayedStatuses.includes(m.status)
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    if (upcomingTodayMatches.length > 0) return upcomingTodayMatches[0];
    
    return todaysMatches.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  } 
  const upcomingFutureMatches = allMatches
    .filter(
      (m) =>
        new Date(m.date).getTime() >= nowTimestamp &&
        notPlayedStatuses.includes(m.status)
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  if (upcomingFutureMatches.length > 0) return upcomingFutureMatches[0];
 
  const pastMatches = allMatches.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  if (pastMatches.length > 0) return pastMatches[0];
  return null;
});

const isFirstDay = computed(() => {
  if (!selectedDate.value) return true;
  return allGameDays.value.indexOf(selectedDate.value) <= 0;
});
const isLastDay = computed(() => {
  if (!selectedDate.value) return true;
  return (
    allGameDays.value.indexOf(selectedDate.value) >=
    allGameDays.value.length - 1
  );
});
const previousDay = () => {
  const currentIndex = allGameDays.value.indexOf(selectedDate.value);
  if (currentIndex > 0) {
    selectedDate.value = allGameDays.value[currentIndex - 1];
  }
};
const nextDay = () => {
  const currentIndex = allGameDays.value.indexOf(selectedDate.value);
  if (currentIndex < allGameDays.value.length - 1) {
    selectedDate.value = allGameDays.value[currentIndex + 1];
  }
};
const formatTime = (dateString) =>
  new Date(dateString).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString.replace(/-/g, "/"));
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
    NS: "Agendado",
    TBD: "A definir",
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
