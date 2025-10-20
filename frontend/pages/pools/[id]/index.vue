<template>
  <section class="pb-28 md:pb-8">
    <div v-if="currentChampionship" class="sticky top-0 z-20">
      <ChampionshipHeader :championship="currentChampionship">
        <template #right>
          <div class="flex items-center flex-wrap justify-end gap-x-4 gap-y-2">
            <button
              v-if="!isParticipant"
              :disabled="stores.pools.loading"
              class="flex items-center gap-1.5 whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-colors duration-200 disabled:cursor-wait disabled:opacity-50 bg-gray-800 text-white hover:bg-gray-700 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-300"
              @click="joinPool"
            >
              Entrar no Bolão
            </button>
            <NuxtLink
              :to="isParticipant ? `/pools/${poolId}/bets` : ''"
              :class="[
                'text-sm font-semibold whitespace-nowrap transition-colors duration-200',
                isParticipant
                  ? 'text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
                  : 'text-gray-400 cursor-not-allowed dark:text-gray-500',
              ]"
            >
              Ver Todos Palpites
            </NuxtLink>
            <NuxtLink
              :to="isParticipant ? `/pools/${poolId}/info` : ''"
              :class="[
                'text-sm font-semibold whitespace-nowrap transition-colors duration-200',
                isParticipant
                  ? 'text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
                  : 'text-gray-400 cursor-not-allowed dark:text-gray-500',
              ]"
            >
              Informações
            </NuxtLink>
          </div>
        </template>
      </ChampionshipHeader>

      <DateSelector
        v-if="!stores.matches.loading && allGameDays.length > 0"
        :is-first="isFirstDay"
        :is-last="isLastDay"
        :label="formatDate(selectedDate)"
        @previous="previousDay"
        @next="nextDay"
      />
    </div>

    <MatchList :matches-by-day="matchesByDay" :loading="stores.matches.loading">
      <template #match="{ matches }">
        <template v-for="match in matches" :key="match.id">
          <div
            :id="`match-row-${match.id}`"
            class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
          >
            <div
              id="v-step-1-bet"
              class="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
              :class="{
                'cursor-pointer': !isBettingTimeExpired(match) && isParticipant,
              }"
              @click="toggleMatchDetails(match, $event)"
            >
              <div
                class="flex flex-col md:grid md:grid-cols-[100px_1fr_150px] md:items-center md:gap-4 w-full"
              >
                <div
                  class="hidden md:block text-sm font-medium text-gray-800 dark:text-gray-300"
                >
                  {{ match.localTime }}
                </div>

                <div class="w-full">
                  <div
                    class="md:hidden text-center text-sm font-medium text-gray-800 dark:text-gray-300 mb-2"
                  >
                    {{ match.localTime }}
                  </div>
                  <div
                    class="grid grid-cols-[1fr_auto_1fr] gap-x-2 items-center w-full max-w-sm mx-auto"
                  >
                    <div class="flex items-center gap-2 justify-end min-w-0">
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

                    <div id="v-step-6-bet-result" class="flex items-center gap-1">
                      <input
                        v-model.number="betForms[match.id].homeScoreBet"
                        type="number"
                        min="0"
                        :max="10"
                        :disabled="isBettingTimeExpired(match) || !isParticipant"
                        class="w-6 text-center border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 disabled:dark:bg-gray-800 disabled:dark:text-gray-500"
                        @click.stop
                        @input="validateNonNegative(betForms[match.id], 'homeScoreBet')"
                      >
                      <span class="dark:text-gray-400">-</span>
                      <input
                        v-model.number="betForms[match.id].awayScoreBet"
                        type="number"
                        min="0"
                        :max="10"
                        :disabled="isBettingTimeExpired(match) || !isParticipant"
                        class="w-6 text-center border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 disabled:dark:bg-gray-800 disabled:dark:text-gray-500"
                        @click.stop
                        @input="validateNonNegative(betForms[match.id], 'awayScoreBet')"
                      >
                    </div>

                    <div class="flex items-center gap-2 justify-start min-w-0">
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

                  <div class="md:hidden text-center mt-2">
                    <div
                      v-if="
                        match.status === 'SCHEDULED' ||
                        match.status === 'POSTPONED'
                      "
                      title="Tempo restante para palpitar"
                      class="flex items-center justify-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"
                    >
                      {{ countdowns[match.id] || "..." }}
                      <InformationCircleIcon class="w-4 h-4 text-gray-400" />
                    </div>
                    <div v-else>
                      <p
                        class="font-semibold text-sm text-gray-800 dark:text-gray-200"
                      >
                        {{ match.homeScore ?? "?" }} -
                        {{ match.awayScore ?? "?" }}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  class="hidden md:flex flex-col items-end justify-center text-right"
                >
                  <div
                    v-if="
                      match.status === 'SCHEDULED' ||
                      match.status === 'POSTPONED'
                    "
                    title="Tempo restante para palpitar"
                    class="flex items-center gap-1.5"
                  >
                    <div
                      class="text-xs font-medium text-gray-600 whitespace-nowrap dark:text-gray-400"
                    >
                      {{ countdowns[match.id] || "..." }}
                    </div>
                    <div class="relative group">
                      <InformationCircleIcon class="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div
                    v-else
                    class="font-semibold text-sm text-gray-800 dark:text-gray-200"
                  >
                    {{ match.homeScore ?? "?" }} - {{ match.awayScore ?? "?" }}
                  </div>
                </div>
              </div>
            </div>

            <Transition name="expand">
              <div
                v-if="expandedMatchId === match.id"
                class="bg-gray-50/70 dark:bg-gray-900/70 p-4 sm:p-6"
              >
                <div
                  id="v-step-4-bet-ia"
                  class="pb-6"
                >
                  <div
                    v-if="predictingMatchId === match.id"
                    class="flex justify-center items-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-4"
                  >
                    <svg
                      class="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Analisando...</span>
                  </div>
                  <div
                    v-else-if="predictions[match.id]"
                    class="max-w-md mx-auto"
                  >
                    <div
                      id="v-step-5-bet-prediction"
                      class="flex justify-between items-center gap-4 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      <div class="flex-1 text-center">
                        <p class="font-bold">
                          {{
                            (
                              predictions[match.id].probabilidades
                                .vitoria_casa * 100
                            ).toFixed(1)
                          }}%
                        </p>
                        <p
                          class="text-xs text-gray-500 dark:text-gray-400 truncate"
                        >
                          {{ match.homeTeamName }}
                        </p>
                      </div>
                      <div class="flex-1 text-center">
                        <p class="font-bold">
                          {{
                            (
                              predictions[match.id].probabilidades.empate * 100
                            ).toFixed(1)
                          }}%
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          Empate
                        </p>
                      </div>
                      <div class="flex-1 text-center">
                        <p class="font-bold">
                          {{
                            (
                              predictions[match.id].probabilidades
                                .vitoria_visitante * 100
                            ).toFixed(1)
                          }}%
                        </p>
                        <p
                          class="text-xs text-gray-500 dark:text-gray-400 truncate"
                        >
                          {{ match.awayTeamName }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center">
                    <button
                      class="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-500 disabled:text-gray-500 disabled:cursor-not-allowed dark:text-blue-400 dark:hover:text-blue-300 dark:disabled:text-gray-600 transition-colors"
                      :disabled="isBettingTimeExpired(match)"
                      @click="handlePrediction(match)"
                    >
                      <span>Usar Palpite da IA</span>
                    </button>
                  </div>
                  <hr class="mt-6 border-gray-200 dark:border-gray-700" >
                </div>

                <div
                  v-if="detailsLoading"
                  class="text-center text-sm text-gray-500 dark:text-gray-400 py-4"
                >
                  Analisando dados...
                </div>
                <div v-else-if="lastGamesData[match.id]">
                  <div id="v-step-2-bet-last-five">
                    <h3
                      class="text-lg font-bold text-gray-800 dark:text-gray-100 text-center mb-4"
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
                          <h4
                            class="font-semibold text-gray-700 dark:text-gray-300"
                          >
                            Últimos 5 de {{ match.homeTeamName }}
                          </h4>
                        </div>
                        <div
                          class="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-2"
                        >
                          <div
                            v-for="game in lastGamesData[match.id].homeTeam"
                            :key="game.id"
                            class="grid grid-cols-[1fr_auto_1fr] items-center text-xs py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                          >
                            <span
                              class="text-right font-medium text-gray-600 dark:text-gray-400 truncate pr-2"
                              >{{ game.homeTeamName }}</span
                            >
                            <span
                              class="font-bold text-xs px-1.5 py-0.5 rounded"
                              :class="
                                getGameResultClass(game, match.homeTeamEspnId)
                              "
                            >
                              {{ game.homeScore }} &times; {{ game.awayScore }}
                            </span>
                            <span
                              class="text-left font-medium text-gray-600 dark:text-gray-400 truncate pl-2"
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
                          <h4
                            class="font-semibold text-gray-700 dark:text-gray-300"
                          >
                            Últimos 5 de {{ match.awayTeamName }}
                          </h4>
                        </div>
                        <div
                          class="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-2"
                        >
                          <div
                            v-for="game in lastGamesData[match.id].awayTeam"
                            :key="game.id"
                            class="grid grid-cols-[1fr_auto_1fr] items-center text-xs py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                          >
                            <span
                              class="text-right font-medium text-gray-600 dark:text-gray-400 truncate pr-2"
                              >{{ game.homeTeamName }}</span
                            >
                            <span
                              class="font-bold text-xs px-1.5 py-0.5 rounded"
                              :class="
                                getGameResultClass(game, match.awayTeamEspnId)
                              "
                            >
                              {{ game.homeScore }} &times; {{ game.awayScore }}
                            </span>
                            <span
                              class="text-left font-medium text-gray-600 dark:text-gray-400 truncate pl-2"
                              >{{ game.awayTeamName }}</span
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr class="my-8 border-gray-200 dark:border-gray-700" >
                  <div>
                    <div
                      v-if="isH2HLoading[match.id]"
                      class="text-center text-sm text-gray-500 dark:text-gray-400 py-4"
                    >
                      Buscando histórico de confrontos...
                    </div>
                    <div v-else-if="h2hData[match.id]" id="v-step-3-bet-h2h">
                      <h3
                        class="text-lg font-bold text-gray-800 dark:text-gray-100 text-center mb-4"
                      >
                        Confronto Direto
                      </h3>
                      <div
                        class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-center mb-6"
                      >
                        <div
                          class="border-l-4 border-blue-500 bg-white dark:bg-gray-800 dark:border-blue-400 p-3 rounded-r-md shadow-sm"
                        >
                          <div
                            class="font-bold text-xl text-blue-800 dark:text-blue-400"
                          >
                            {{ h2hStats[match.id].homeWins || 0 }}
                          </div>
                          <div class="text-gray-600 dark:text-gray-400">
                            Vitórias {{ match.homeTeamName }}
                          </div>
                        </div>
                        <div
                          class="border-l-4 border-gray-400 bg-white dark:bg-gray-800 dark:border-gray-500 p-3 rounded-r-md shadow-sm"
                        >
                          <div
                            class="font-bold text-xl text-gray-800 dark:text-gray-200"
                          >
                            {{ h2hStats[match.id].draws || 0 }}
                          </div>
                          <div class="text-gray-600 dark:text-gray-400">
                            Empates
                          </div>
                        </div>
                        <div
                          class="border-l-4 border-red-500 bg-white dark:bg-gray-800 dark:border-red-400 p-3 rounded-r-md shadow-sm"
                        >
                          <div
                            class="font-bold text-xl text-red-800 dark:text-red-400"
                          >
                            {{ h2hStats[match.id].awayWins || 0 }}
                          </div>
                          <div class="text-gray-600 dark:text-gray-400">
                            Vitórias {{ match.awayTeamName }}
                          </div>
                        </div>
                      </div>
                      <div v-if="h2hData[match.id].length > 0">
                        <div class="mb-6">
                          <h4
                            class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center"
                          >
                            Gols no Confronto (Total)
                          </h4>
                          <div class="space-y-2 text-xs dark:text-gray-300">
                            <div class="flex items-center gap-2">
                              <span class="w-28 text-right truncate">{{
                                match.homeTeamName
                              }}</span>
                              <div
                                class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5"
                              >
                                <div
                                  class="bg-blue-500 dark:bg-blue-400 h-2.5 rounded-full"
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
                              <div
                                class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5"
                              >
                                <div
                                  class="bg-red-500 dark:bg-red-400 h-2.5 rounded-full"
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
                              class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center"
                            >
                              Últimos 5 (Geral)
                            </h4>
                            <div
                              class="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-2"
                            >
                              <div
                                v-for="game in overallH2HGames[match.id]"
                                :key="game.apiFootballFixtureId"
                                class="grid grid-cols-[1fr_auto_1fr] items-center text-xs py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                              >
                                <span
                                  class="text-right font-medium text-gray-600 dark:text-gray-400 truncate pr-2"
                                  >{{ game.homeTeamName }}</span
                                >
                                <span
                                  class="font-bold text-xs px-1.5 py-0.5 rounded"
                                  :class="
                                    getGameResultClass(
                                      game,
                                      match.homeTeamEspnId
                                    )
                                  "
                                >
                                  {{ game.homeScore }} &times;
                                  {{ game.awayScore }}
                                </span>
                                <span
                                  class="text-left font-medium text-gray-600 dark:text-gray-400 truncate pl-2"
                                  >{{ game.awayTeamName }}</span
                                >
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4
                              class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center"
                            >
                              {{ match.homeTeamName }} (Mandante)
                            </h4>
                            <div
                              class="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-2"
                            >
                              <div
                                v-if="
                                  homeHomeGames[match.id] &&
                                  homeHomeGames[match.id].length > 0
                                "
                              >
                                <div
                                  v-for="game in homeHomeGames[match.id]"
                                  :key="game.apiFootballFixtureId"
                                  class="grid grid-cols-[1fr_auto_1fr] items-center text-xs py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                >
                                  <span
                                    class="text-right font-medium text-gray-600 dark:text-gray-400 truncate pr-2"
                                    >{{ game.homeTeamName }}</span
                                  >
                                  <span
                                    class="font-bold text-xs px-1.5 py-0.5 rounded"
                                    :class="
                                      getGameResultClass(
                                        game,
                                        match.homeTeamEspnId
                                      )
                                    "
                                  >
                                    {{ game.homeScore }} &times;
                                    {{ game.awayScore }}
                                  </span>
                                  <span
                                    class="text-left font-medium text-gray-600 dark:text-gray-400 truncate pl-2"
                                    >{{ game.awayTeamName }}</span
                                  >
                                </div>
                              </div>
                              <div
                                v-else
                                class="text-center text-xs text-gray-500 dark:text-gray-400 py-2 h-full flex items-center justify-center"
                              >
                                <p>
                                  Nenhum jogo recente encontrado como mandante
                                  no confronto.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-else>
                        <p
                          class="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 border-t border-gray-200 dark:border-gray-700 pt-6"
                        >
                          Não achamos confronto direto entre as equipes no nosso
                          database.
                        </p>
                      </div>
                    </div>
                    <div v-else class="text-center">
                      <button
                        class="inline-flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-semibold text-gray-600 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
      class="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200 md:relative md:p-0 md:bg-transparent md:border-none md:mt-6 text-center dark:bg-gray-800/90 dark:border-gray-700"
    >
      <button
        id="v-step-7-bet-save"
        :disabled="!hasChanges || !allBetsAreFilled || stores.bet.loading"
        class="w-full whitespace-nowrap rounded-md border-2 border-blue-600 bg-transparent px-4 py-3 text-base font-semibold text-blue-600 transition-colors duration-200 hover:bg-blue-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 md:w-auto md:px-6 md:py-2 md:text-sm dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400 dark:hover:text-gray-900 dark:focus-visible:ring-offset-gray-800 dark:disabled:border-gray-600 dark:disabled:text-gray-600"
        @click="submitAllBets"
      >
        Salvar Rodada
      </button>
    </div>
    {{ pools }}
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, watch, ref, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { InformationCircleIcon } from "@heroicons/vue/24/outline";
import { useTour } from "~/composables/useTour";

const stores = useStores();
const route = useRoute();
const router = useRouter();

const { addSteps, start, tour } = useTour();

const poolId = computed(() => route.params.id);
const error = ref(null);
const loading = ref(true);
const currentPool = ref(null);
const currentChampionship = ref(null);
const allBets = ref([]);
const selectedDate = ref(null);

const betForms = ref({});
const initialBetForms = ref({});
const countdowns = reactive({});
let countdownIntervals = {};
const expandedMatchId = ref(null);
const lastGamesData = reactive({});
const h2hData = reactive({});
const h2hStats = reactive({});
const h2hGoals = reactive({});
const overallH2HGames = reactive({});
const homeHomeGames = reactive({});
const detailsLoading = ref(false);
const isH2HLoading = reactive({});
const predictingMatchId = ref(null);
const predictions = reactive({});

async function handlePrediction(match) {
  if (predictions[match.id]) {
    const prediction = predictions[match.id];
    if (betForms.value[match.id]) {
      betForms.value[match.id].homeScoreBet = prediction.home_score_predito;
      betForms.value[match.id].awayScoreBet = prediction.away_score_predito;
    }
    expandedMatchId.value = match.id;
    return;
  }

  predictingMatchId.value = match.id;

  try {
    await stores.ai.fetchPrediction(
      match.homeTeamEspnId,
      match.awayTeamEspnId,
      currentPool.value.baseChampionship.id
    );
    if (stores.ai.prediction) {
      const prediction = stores.ai.prediction;
      predictions[match.id] = prediction;

      if (betForms.value[match.id]) {
        betForms.value[match.id].homeScoreBet = prediction.home_score_predito;
        betForms.value[match.id].awayScoreBet = prediction.away_score_predito;
      }

      expandedMatchId.value = match.id;
    }
  } catch (err) {
    stores.ui.showToast(err || "Erro ao obter predição da IA.", "error");
  } finally {
    predictingMatchId.value = null;
  }
}

const getLocalDateString = (utcDateString) => {
  if (!utcDateString) return null;
  const date = new Date(utcDateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const findInitialDate = (allMatches) => {
  if (!allMatches || allMatches.length === 0) return null;
  const now = new Date();
  const notPlayedStatuses = ["SCHEDULED", "POSTPONED"];
  const upcomingMatches = allMatches
    .filter(
      (m) => new Date(m.date) >= now && notPlayedStatuses.includes(m.status)
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  if (upcomingMatches.length > 0)
    return getLocalDateString(upcomingMatches[0].date);
  const lastMatch = allMatches.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )[0];
  return lastMatch ? getLocalDateString(lastMatch.date) : null;
};

const isParticipant = computed(() => {
  if (!currentPool.value || !stores.auth.user) return false;
  return currentPool.value.participants.some(
    (p) => p.userId === stores.auth.user.id
  );
});

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

const isBettingTimeExpired = (match) => {
  if (match.status !== "SCHEDULED" && match.status !== "POSTPONED") return true;
  if (!currentPool.value || !match.date) return true;
  const matchDate = new Date(match.date);
  const deadlineDate = new Date(
    matchDate.getTime() - currentPool.value.betDeadlineHours * 60 * 60 * 1000
  );
  return new Date() > deadlineDate;
};

const allBetsAreFilled = computed(() => {
  const openMatches = matchesOfSelectedDay.value.filter(
    (m) =>
      (m.status === "SCHEDULED" || m.status === "POSTPONED") &&
      !isBettingTimeExpired(m)
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
  return matchesOfSelectedDay.value.some(
    (m) => m.status !== "FINAL" && m.status !== "FULL_TIME"
  );
});

const hasChanges = computed(() => {
  const current = betForms.value;
  const initial = initialBetForms.value;
  const currentKeys = Object.keys(current);
  if (currentKeys.length !== Object.keys(initial).length) return true;
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

const populateBetForms = () => {
  const newBetForms = {};
  matchesOfSelectedDay.value.forEach((match) => {
    const existingBet = findBetForMatch(match.id);
    newBetForms[match.id] = {
      homeScoreBet: existingBet?.homeScoreBet ?? null,
      awayScoreBet: existingBet?.awayScoreBet ?? null,
    };
  });
  betForms.value = newBetForms;
  initialBetForms.value = JSON.parse(JSON.stringify(newBetForms));
};

const clearAllCountdowns = () => {
  for (const matchId in countdownIntervals) {
    clearInterval(countdownIntervals[matchId]);
  }
  countdownIntervals = {};
};

onMounted(async () => {
  loading.value = true;
  try {
    const poolData = await stores.pools.fetchPoolById(poolId.value);
    currentPool.value = poolData;
    if (!currentPool.value) {
      throw new Error("Bolão não encontrado.");
    }
    const championshipId = currentPool.value.baseChampionship.id;
    if (stores.championships.allChampionships.length === 0) {
      await stores.championships.fetchAllChampionships();
    }
    currentChampionship.value = stores.championships.allChampionships.find(
      (c) => c.id === championshipId
    );
    if (currentChampionship.value) {
      await stores.matches.fetchByChampionship(currentChampionship.value.id);
      selectedDate.value = findInitialDate(stores.matches.matches);
      const betsResult = await stores.bet.fetchBets({ poolId: poolId.value });
      if (betsResult.success) {
        allBets.value = betsResult.data;
      }
    } else {
      stores.ui.showToast(
        "Campeonato não encontrado para este bolão.",
        "error"
      );
    }
  } catch (e) {
    error.value =
      e.data?.error || e.message || "Falha ao carregar os dados do bolão.";
    stores.ui.showToast(error.value, "error");
    router.push("/");
  } finally {
    loading.value = false;
  }
  if (
    stores.auth.isAuthenticated &&
    isParticipant.value &&
    stores.users.myProfile.firstBet
  ) {
    addSteps([
      {
        id: "step-1-bet",
        attachTo: {
          element: "#v-step-1-bet",
          on: "top",
        },
        title: "Partida a ser Palpitada",
        text: "Aqui você vê a partida a qual você irá palpitar.",
        buttons: [
          {
            text: "Pular",
            action: tour.cancel,
            secondary: true,
          },
          {
            text: "Próximo",
            action: async () => {
              const matchToExpand = matchesOfSelectedDay.value[0];

              if (matchToExpand) {
                expandedMatchId.value = matchToExpand.id;

                if (!lastGamesData[matchToExpand.id]) {
                  detailsLoading.value = true;
                  try {
                    await Promise.all([
                      fetchLast5Games(matchToExpand),
                      fetchH2HData(matchToExpand),
                    ]);
                  } catch (error) {
                    console.error(
                      "Tour: Falha ao carregar detalhes do jogo.",
                      error
                    );
                  } finally {
                    detailsLoading.value = false;
                  }
                }

                nextTick(() => {
                  const matchElement = document.querySelector(
                    `#match-row-${matchToExpand.id}`
                  );
                  if (matchElement) {
                    const detailsPanel = matchElement.nextElementSibling;
                    if (detailsPanel) {
                      detailsPanel.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                      });
                    }
                  }
                });
              }

              setTimeout(() => {
                tour.next();
              }, 500);
            },
          },
        ],
        classes: "sheperd-custom",
      },
      {
        id: "step-2-bet",
        title: "Forma Recente",
        text: "Aqui nós vemos os últimos 5 jogos do time mandante e do time visitante, para auxílio do palpiteiro.",
        buttons: [
          { text: "Anterior", action: tour.back, secondary: true },
          { text: "Próximo", action: tour.next },
        ],
        classes: "shepderd-custom",
        attachTo: { element: "#v-step-2-bet-last-five", on: "top" },
      },
      {
        id: "step-3-bet",
        title: "Confronto Direto",
        text: "Aqui nós vemos os dados dos últimos confrontos entre os 2 times, nosso database possui dados desde 2006.",
        buttons: [
          { text: "Anterior", action: tour.back, secondary: true },
          { text: "Próximo", action: tour.next },
        ],
        classes: "sheperd-custom",
        attachTo: { element: "#v-step-3-bet-h2h", on: "top" },
      },
      {
        id: "step-4-bet",
        title: "Previsão da IA",
        text: "Nós desenvolvemos uma IA preditiva, que leva em consideração os últimos 5 confrontos de cada equipe, as forças de cada confronto (uma vitória em cima do líder do campeonato naquela altura vale mais do que uma vitória contra o lanterna), os últimos confrontos entre as 2 equipes e os confrontos entre as duas equipes do mandante como mandante e visitante como visitante.",
        classes: "shepherd-custom",
        attachTo: { element: "#v-step-4-bet-ia", on: "top" },
        buttons: [
          { text: "Anterior", action: tour.back, secondary: true },
          {
            text: "Analisar com IA",
            action: async () => {
              const currentStep = tour.currentStep;

              if (!currentStep || !currentStep.el) {
                console.error("Shepherd step element não encontrado.");
                return;
              }

              const nextButton = currentStep.el.querySelector(
                ".shepherd-button:not(.shepherd-button-secondary)"
              );
              if (!nextButton) return;

              const originalText = nextButton.textContent;

              nextButton.disabled = true;
              nextButton.innerHTML = `Analisando...`;

              try {
                await handlePrediction(matchesOfSelectedDay.value[0]);
                tour.next();
              } catch (error) {
                console.error("Ação do Tour (handlePrediction) falhou:", error);
                stores.ui.showToast(
                  "Não foi possível obter a predição da IA.",
                  "error"
                );
              } finally {
                if (nextButton) {
                  nextButton.disabled = false;
                  nextButton.textContent = originalText;
                }
              }
            },
          },
        ],
      },
      {
        id: "step-5-bet",
        title: "% de chance segundo nossa IA",
        text: "Após analisar os dados, nós mostraremos os resultados da probabilidade de vitória de cada time segundo nosso algoritmo.",
        buttons: [
          { text: "Anterior", action: tour.back },
          { text: "Próximo", action: tour.next },
        ],
        classes: "sheperd-custom",
        attachTo: { element: "#v-step-5-bet-prediction", on: "bottom" },
      },
      {
        id: "step-6-bet",
        title: "Resultado da IA",
        text: "Nosso algoritmo também já colocará o time que ele acredita que vencerá o confronto, ele foi treinado para colocar sempre os palpites 2x1 para vitória do mandante, 1x2 para vitória do visitante e 1x1 para empate. Sinta-se livre para alterar o palpite como quiser.",
        buttons: [
          { text: "Anterior", action: tour.back },
          { text: "Próximo", action: tour.next },
        ],
        classes: "sheperd-custom",
        attachTo: { element: "#v-step-6-bet-result", on: "bottom" },
      },
      {
        id: "step-7-bet",
        title: "Salvar",
        text: "Após preencher todos os palpites do dia, você poderá salvá-los.",
        buttons: [
          { text: "Anterior", action: tour.back },
          {
            text: "Concluir",
            action: tour.complete,
          },
        ],
        classes: "sheperd-custom",
        attachTo: { element: "#v-step-7-bet-save", on: "top" },
      },
    ]);
    setTimeout(() => {
      start("firstBet");
    }, 500);
  }
});

watch(
  [() => matchesOfSelectedDay.value, () => allBets.value],
  () => {
    populateBetForms();
    clearAllCountdowns();
    matchesOfSelectedDay.value.forEach((match) => {
      if (
        match.status !== "FINAL" &&
        match.status !== "FULL_TIME" &&
        currentPool.value
      ) {
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
const findBetForMatch = (matchId) => {
  return allBets.value.find((bet) => bet.match.id === matchId);
};
const isHomeWinner = (match) =>
  match &&
  (match.status === "FINAL" || match.status === "FULL_TIME") &&
  match.homeScore > match.awayScore;
const isAwayWinner = (match) =>
  match &&
  (match.status === "FINAL" || match.status === "FULL_TIME") &&
  match.homeScore < match.awayScore;
const joinPool = async () => {
  try {
    const joinedPool = await stores.pools.joinPool(poolId.value);
    stores.ui.showToast("Você entrou no bolão com sucesso!", "success");
    currentPool.value = joinedPool;
    const betsResult = await stores.bet.fetchBets({ poolId: poolId.value });
    if (betsResult.success) {
      allBets.value = betsResult.data;
    }
  } catch (error) {
    stores.ui.showToast(
      error.data?.error || "Ocorreu um erro ao entrar no bolão.",
      "error"
    );
  }
};
const updateCountdown = (match) => {
  if (!currentPool.value || !match.localTime) return;

  const localDateStr = getLocalDateString(match.date);
  const matchDate = new Date(`${localDateStr}T${match.localTime}`);

  const deadlineDate = new Date(
    matchDate.getTime() - currentPool.value.betDeadlineHours * 60 * 60 * 1000
  );
  const now = new Date();
  const diff = deadlineDate.getTime() - now.getTime();

  if (diff <= 0) {
    countdowns[match.id] = "Tempo esgotado!";
    clearInterval(countdownIntervals[match.id]);
    countdownIntervals[match.id] = undefined;
    return;
  }

  const secondsTotal = Math.floor(diff / 1000);
  const days = Math.floor(secondsTotal / (60 * 60 * 24));
  const hours = Math.floor((secondsTotal % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((secondsTotal % (60 * 60)) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || (days === 0 && hours === 0)) parts.push(`${minutes}m`);

  countdowns[match.id] = parts.join(" ");
};
const submitAllBets = async () => {
  const unplayedMatches = matchesOfSelectedDay.value.filter(
    (m) => m.status !== "FINAL" && m.status !== "FULL_TIME"
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
      "Nenhum palpite para salvar. Faça suas alterações primeiro.",
      "info"
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
    stores.ui.showToast("Ocorreu um erro ao salvar alguns palpites.", "error");
  } else {
    stores.ui.showToast("Palpites salvos com sucesso!", "success");
    initialBetForms.value = JSON.parse(JSON.stringify(betForms.value));

    const updatedBetsResult = await stores.bet.fetchAllBetsByPool(
      poolId.value,
      true
    );
    if (updatedBetsResult.success) {
      allBets.value = updatedBetsResult.data;
    }
  }
};
const validateNonNegative = (form, key) => {
  let value = form[key];
  const MAX_SCORE = 10;
  const MIN_SCORE = 0;

  if (value < MIN_SCORE) {
    form[key] = MIN_SCORE;
    return;
  }

  if (value > MAX_SCORE) {
    form[key] = MAX_SCORE;
    return;
  }
};
const toggleMatchDetails = async (match, event) => {
  if (isBettingTimeExpired(match) || !isParticipant.value) return;
  const isClosing = expandedMatchId.value === match.id;
  if (isClosing) {
    expandedMatchId.value = null;
    return;
  }
  expandedMatchId.value = match.id;
  nextTick(() => {
    const detailsPanel = event.currentTarget.nextElementSibling;
    if (detailsPanel) {
      setTimeout(
        () =>
          detailsPanel.scrollIntoView({ behavior: "smooth", block: "nearest" }),
        50
      );
    }
  });
  if (!lastGamesData[match.id]) {
    detailsLoading.value = true;
    try {
      await Promise.all([fetchLast5Games(match)]);
    } catch (error) {
      console.error("Falha ao carregar detalhes do jogo:", error);
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
  } finally {
    isH2HLoading[match.id] = false;
  }
};
const getGameResultLetter = (game, teamId) => {
  if (game.homeScore === game.awayScore) return "E";
  const isTeamHome = game.homeTeamEspnId === teamId;
  const isTeamAway = game.awayTeamEspnId === teamId;
  if (isTeamHome && game.homeScore > game.awayScore) return "V";
  if (isTeamAway && game.awayScore > game.homeScore) return "V";
  return "D";
};

const getGameResultClass = (game, teamId) => {
  const result = getGameResultLetter(game, teamId);
  switch (result) {
    case "V":
      return "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300";
    case "D":
      return "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300";
    case "E":
      return "bg-gray-200 text-gray-700 dark:bg-gray-600/30 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-700/30 dark:text-gray-400";
  }
};

const calculateH2HStats = (matches, homeTeamId) => {
  let homeWins = 0,
    awayWins = 0,
    draws = 0;
  matches.forEach((match) => {
    if (match.homeScore === match.awayScore) draws++;
    else if (
      (match.homeTeamEspnId === homeTeamId &&
        match.homeScore > match.awayScore) ||
      (match.awayTeamEspnId === homeTeamId && match.awayScore > match.homeScore)
    )
      homeWins++;
    else awayWins++;
  });
  return { homeWins, awayWins, draws };
};

const filterHomeHomeGames = (matches, homeTeamId) => {
  return matches
    .filter((match) => match.homeTeamEspnId === homeTeamId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
};

const calculateH2HGoals = (matches, homeTeamId, awayTeamId) => {
  let homeGoals = 0,
    awayGoals = 0;
  matches.forEach((m) => {
    if (m.homeTeamEspnId === homeTeamId) homeGoals += m.homeScore;
    if (m.awayTeamEspnId === homeTeamId) homeGoals += m.awayScore;
    if (m.homeTeamEspnId === awayTeamId) awayGoals += m.homeScore;
    if (m.awayTeamEspnId === awayTeamId) awayGoals += m.awayScore;
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
    match.homeTeamEspnId,
    match.awayTeamEspnId
  );

  if (result && Array.isArray(result.matches)) {
    const teamNameMap = {
      [match.homeTeamEspnId]: match.homeTeamName,
      [match.awayTeamEspnId]: match.awayTeamName,
    };

    const enrichedH2hMatches = result.matches.map((h2hGame) => {
      const homeName =
        teamNameMap[h2hGame.homeTeamEspnId] || "Time Desconhecido";
      const awayName =
        teamNameMap[h2hGame.awayTeamEspnId] || "Time Desconhecido";

      return {
        ...h2hGame,
        homeTeamName: homeName,
        awayTeamName: awayName,
      };
    });

    h2hData[match.id] = enrichedH2hMatches;
    h2hStats[match.id] = calculateH2HStats(
      enrichedH2hMatches,
      match.homeTeamEspnId
    );
    h2hGoals[match.id] = calculateH2HGoals(
      enrichedH2hMatches,
      match.homeTeamEspnId,
      match.awayTeamEspnId
    );
    overallH2HGames[match.id] = [...enrichedH2hMatches]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    homeHomeGames[match.id] = filterHomeHomeGames(
      enrichedH2hMatches,
      match.homeTeamEspnId
    );
  } else {
    stores.ui.showToast("Erro ao carregar confrontos diretos.", "error");
    h2hData[match.id] = [];
    h2hStats[match.id] = {};
    h2hGoals[match.id] = {};
    overallH2HGames[match.id] = [];
    homeHomeGames[match.id] = [];
  }
};

const fetchLast5Games = async (match) => {
  const result = await stores.matches.fetchLastGames([
    match.homeTeamEspnId,
    match.awayTeamEspnId,
  ]);
  if (result) {
    lastGamesData[match.id] = {
      homeTeam: result[match.homeTeamEspnId] || [],
      awayTeam: result[match.awayTeamEspnId] || [],
    };
  } else {
    stores.ui.showToast("Erro ao carregar últimos jogos.", "error");
    lastGamesData[match.id] = { homeTeam: [], awayTeam: [] };
  }
};

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
