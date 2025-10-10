<template>
  <section>
    <div class="sticky top-0 z-20">
      <header class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
        <nav class="w-full overflow-x-auto no-scrollbar">
          <div
            v-if="!stores.championships.isLoading"
            class="flex border-b border-gray-200 dark:border-gray-700"
          >
            <button
              v-for="championship in leagueChampionships"
              :key="championship.id"
              :class="[
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap shrink-0',
                selectedChampionship?.id === championship.id
                  ? 'border-b-2 border-gray-800 text-gray-800 font-semibold dark:border-gray-200 dark:text-gray-200'
                  : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600',
              ]"
              @click="selectChampionshipWithAnimation(championship)"
            >
              <img
                :src="championship.logoUrl"
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
          id="v-step-1"
          :key="`featured-${selectedChampionship?.id}`"
          class="shrink-0 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        >
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-gray-900 dark:text-white">
              {{ selectedChampionship?.name }}
            </h2>
            <p
              v-if="selectedDate"
              class="text-sm font-semibold text-gray-500 dark:text-gray-400"
            >
              {{ formatDate(selectedDate) }}
            </p>
          </div>
          <div class="p-4 text-white bg-gray-800 dark:bg-gray-700 rounded-xl">
            <div class="flex items-center justify-between">
              <div class="flex flex-col items-center w-1/3 text-center">
                <img
                  :src="featuredMatch.homeTeamLogoUrl"
                  :alt="featuredMatch.homeTeamName"
                  class="object-contain w-16 h-16"
                >
                <span
                  class="block mt-2 text-sm text-white"
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
                  <span v-else>{{ featuredMatch.localTime }}</span>
                </div>
                <span class="mt-1 text-xs text-gray-400 dark:text-gray-400">{{
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
                  class="block mt-2 text-sm text-white"
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
        id="v-step-2"
        :key="`matches-${selectedChampionship?.id}`"
        class="pb-6"
      >
        <div
          v-if="stores.matches.isLoading"
          class="pt-8 text-center text-gray-500 dark:text-gray-400"
        >
          A carregar jogos...
        </div>
        <div v-else-if="matchesOfSelectedDay.length > 0" class="mt-2">
          <div :key="selectedDate" class="mb-6">
            <h3
              class="py-2 px-4 sm:px-6 text-sm font-semibold text-gray-500 dark:text-gray-400"
            >
              {{ formatDate(selectedDate) }}
            </h3>
            <div class="space-y-px">
              <NuxtLink
                v-for="match in matchesOfSelectedDay"
                :key="match.id"
                class="grid grid-cols-1 md:grid-cols-[100px,1fr,150px] gap-4 items-center px-4 py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 dark:border-gray-700 dark:hover:bg-gray-800/50"
              >
                <div
                  class="hidden md:block text-sm font-medium text-gray-800 dark:text-gray-300"
                >
                  {{ match.localTime }}
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
                        >{{ match.localTime }}</span
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
                  class="hidden md:block text-sm text-right text-gray-500 dark:text-gray-300 truncate"
                >
                  <span
                    v-if="
                      match.status === 'SCHEDULED' ||
                      match.status === 'POSTPONED'
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
          <p>Nenhum jogo encontrado para este dia.</p>
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
  set: (championshipObject) => {
    stores.championships.selectChampionship(championshipObject?.id ?? null);
  },
});

const showFeaturedMatch = ref(false);
const showMatchesContent = ref(false);

onMounted(async () => {
  await stores.championships.fetchAllChampionships();
  selectedChampionship.value = leagueChampionships.value[0];

  setTimeout(() => {
    showFeaturedMatch.value = true;
    showMatchesContent.value = true;
  }, 100);
});

const getLocalDateString = (utcDateString) => {
  if (!utcDateString) return null;
  const date = new Date(utcDateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const selectChampionshipWithAnimation = async (championship) => {
  showFeaturedMatch.value = false;
  showMatchesContent.value = false;

  await new Promise((resolve) => setTimeout(resolve, 300));

  selectedChampionship.value = championship;

  await nextTick();

  showFeaturedMatch.value = true;
  showMatchesContent.value = true;
};

watch(
  selectedChampionship,
  async (newChampionship) => {
    if (newChampionship && newChampionship.id) {
      await stores.matches.fetchByChampionship(newChampionship.id);

      if (allGameDays.value.length > 0) {
        const today = new Date().toISOString().split("T")[0];
        selectedDate.value =
          allGameDays.value.find((day) => day >= today) ||
          allGameDays.value[allGameDays.value.length - 1];
      } else {
        selectedDate.value = null;
      }
    }
  },
  { immediate: true }
);

const leagueChampionships = computed(() => {
  return stores.championships.allChampionships.filter(
    (c) => c.type === "League"
  );
});

const selectedDate = ref(null);

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
    .filter((m) => {
      return getLocalDateString(m.date) === selectedDate.value;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));
});

const featuredMatch = computed(() => {
  if (matchesOfSelectedDay.value.length === 0) return null;
  return (
    matchesOfSelectedDay.value.find((m) => m.status !== "FT") ||
    matchesOfSelectedDay.value[0]
  );
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
    IN_PROGRESS: "Em Andamento",
    HALFTIME: "Intervalo",
    FULL_TIME: "Tempo Regulamentar",
    FINAL: "Encerrado",
    POSTPONED: "Adiado",
    CANCELED: "Cancelado",
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

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
