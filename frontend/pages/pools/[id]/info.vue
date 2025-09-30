<template>
  <section class="bg-white dark:bg-gray-900 min-h-screen">
    <div v-if="loading" class="pt-20 text-center text-gray-500 dark:text-gray-400">
      Carregando informações do bolão...
    </div>
    <div
      v-else-if="error"
      class="flex flex-col items-center justify-center p-6 bg-white border border-red-200 rounded-lg shadow-sm dark:bg-red-900/20 dark:border-red-500/30"
    >
      <ExclamationTriangleIcon class="w-10 h-10 text-red-400 dark:text-red-300" />
      <h3 class="mt-2 text-lg font-semibold text-red-800 dark:text-red-200">Ocorreu um erro</h3>
      <p class="mt-1 text-sm text-red-600 dark:text-red-300">{{ error }}</p>
    </div>

    <div v-else-if="pool">
      <header
        class="sticky top-0 z-30 p-4 sm:p-6 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 dark:border-gray-700"
      >
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div class="flex-col">
            <h1 class="text-xl font-bold text-gray-900 leading-tight dark:text-white">
              {{ pool.name }}
            </h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ championshipName }}</p>
          </div>
          <div class="flex items-center gap-4 text-left sm:text-right">
            <NuxtLink
              :to="`/pools/${poolId}/bets`"
              class="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors duration-200 whitespace-nowrap dark:text-gray-300 dark:hover:text-blue-400"
            >
              Ver Todos Palpites
            </NuxtLink>
            <NuxtLink
              :to="`/pools/${poolId}`"
              class="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors duration-200 whitespace-nowrap dark:text-gray-300 dark:hover:text-blue-400"
            >
              Palpitar
            </NuxtLink>
          </div>
        </div>
      </header>

      <div
        class="sticky top-0 sm:top-0 z-20 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
      >
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div
            class="flex items-center justify-between cursor-pointer md:cursor-default"
            @click="isMobile ? (isInfoExpanded = !isInfoExpanded) : null"
          >
            <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100">Informações Gerais</h2>
            <ChevronDownIcon
              class="w-5 h-5 text-gray-400 transition-transform md:hidden dark:text-gray-500"
              :class="isInfoExpanded ? 'rotate-180' : ''"
            />
          </div>

          <transition name="expand">
            <div v-show="isInfoExpanded || !isMobile" class="mt-4">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Visibilidade</p>
                  <p
                    class="text-sm font-semibold"
                    :class="pool.private ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'"
                  >
                    {{ pool.private ? "Privado" : "Público" }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Taxa de Entrada</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {{ formatCurrency(pool.entryFee) }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Participantes</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {{ pool.participants.length }} / {{ pool.maxParticipants }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Prazo para Palpites</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {{ pool.betDeadlineHours }}h antes do jogo
                  </p>
                </div>
              </div>

              <div v-if="isCurrentUserAdmin" class="mt-6">
                <button
                  class="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-800 transition-colors duration-200 dark:text-red-500 dark:hover:text-red-400"
                  @click="handleDeletePool"
                >
                  <TrashIcon class="w-4 h-4" />
                  <span>Excluir Bolão</span>
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <main class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h2 class="text-lg font-bold text-gray-800 mb-6 dark:text-gray-100">
          Classificação e Estatísticas
        </h2>
        <div class="space-y-2">
          <div
            v-for="(participant, index) in participantStats"
            :key="participant.userId"
            class="border border-gray-200 bg-white rounded-lg transition-shadow hover:shadow-md cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-md-dark"
            @click="toggleExpand(participant.userId)"
          >
            <div class="grid grid-cols-[auto_1fr_auto] gap-4 items-center p-4">
              <span class="font-semibold text-sm text-gray-400 text-center w-8 dark:text-gray-500"
                >#{{ index + 1 }}</span
              >
              <div
                class="flex items-center justify-between flex-1 min-w-0 gap-4"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="relative group flex-shrink-0">
                    <div
                      class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 transition-opacity dark:bg-gray-700 dark:text-gray-300"
                      :class="{
                        'group-hover:opacity-0':
                          shouldShowRemoveButton(participant),
                      }"
                    >
                      {{ participant.userName.charAt(0).toUpperCase() }}
                    </div>
                    <button
                      v-if="shouldShowRemoveButton(participant)"
                      class="absolute inset-0 w-full h-full hidden sm:flex items-center justify-center bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remover Participante"
                      @click.stop="promptRemoveParticipant(participant)"
                    >
                      <UserMinusIcon class="w-5 h-5" />
                    </button>
                  </div>
                  <div class="flex items-center gap-2 min-w-0">
                    <p
                      class="font-semibold text-gray-800 truncate dark:text-gray-200"
                      :title="participant.userName"
                    >
                      {{ participant.userName }}
                    </p>
                    <StarIcon
                      v-if="participant.role === 'ADMIN'"
                      class="w-4 h-4 text-yellow-500 flex-shrink-0 dark:text-yellow-400"
                      title="Administrador"
                    />
                  </div>
                </div>

                <div v-if="!participant.paid && pool.entryFee > 0">
                  <button
                    v-if="isCurrentUserAdmin && !isMobile"
                    class="text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center gap-1.5 shrink-0 transition-colors hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900"
                    title="Confirmar Pagamento"
                    @click.stop="promptConfirmPayment(participant)"
                  >
                    <CreditCardIcon class="w-4 h-4" />
                    <span class="hidden sm:inline">Não Pago</span>
                  </button>
                  <span
                    v-else
                    class="text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center gap-1.5 shrink-0 dark:bg-red-900/50 dark:text-red-300"
                    title="Pagamento pendente"
                  >
                    <CreditCardIcon class="w-4 h-4" />
                    <span class="hidden sm:inline">Não Pago</span>
                  </span>
                </div>
              </div>
              <div class="flex items-center">
                <ChevronDownIcon
                  class="w-5 h-5 text-gray-400 transition-transform dark:text-gray-500"
                  :class="isExpanded(participant.userId) ? 'rotate-180' : ''"
                />
              </div>
            </div>

            <transition name="expand">
              <div v-if="isExpanded(participant.userId)" class="px-4 pb-4">
                <div class="border-t border-gray-200 dark:border-gray-700 pt-4 text-xs">
                  <div
                    class="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700/50"
                  >
                    <span class="text-sm text-gray-500 font-medium dark:text-gray-400"
                      >Pontuação Total</span
                    >
                    <span class="font-bold text-lg text-blue-600 dark:text-blue-400"
                      >{{ participant.stats.totalPoints }} pts</span
                    >
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                        <StarIcon class="w-4 h-4 text-yellow-400" />
                        <span>Placar Cheio</span>
                      </div>
                      <span class="font-bold text-gray-900 dark:text-gray-100">{{
                        participant.stats.fullHits
                      }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                        <CheckCircleIcon class="w-4 h-4 text-green-500" />
                        <span>Vencedor</span>
                      </div>
                      <span class="font-bold text-gray-900 dark:text-gray-100">{{
                        participant.stats.resultHits
                      }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                        <ScaleIcon class="w-4 h-4 text-blue-500" />
                        <span>Empate</span>
                      </div>
                      <span class="font-bold text-gray-900 dark:text-gray-100">{{
                        participant.stats.partialHits
                      }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                        <AdjustmentsHorizontalIcon
                          class="w-4 h-4 text-gray-500"
                        />
                        <span>Gols de um Time</span>
                      </div>
                      <span class="font-bold text-gray-900 dark:text-gray-100">{{
                        participant.stats.goalHits
                      }}</span>
                    </div>
                    <div
                      class="col-span-1 sm:col-span-2 border-t border-gray-100 dark:border-gray-700/50 my-2"
                    />
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                        <ClipboardDocumentListIcon
                          class="w-4 h-4 text-purple-500"
                        />
                        <span>Palpites Feitos</span>
                      </div>
                      <span class="font-bold text-gray-900 dark:text-gray-100">{{
                        participant.stats.totalBets
                      }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                        <TrophyIcon class="w-4 h-4 text-orange-500" />
                        <span>Precisão (Placar Cheio)</span>
                      </div>
                      <span class="font-bold text-gray-900 dark:text-gray-100"
                        >{{
                          participant.stats.fullHitsPercentage.toFixed(1)
                        }}%</span
                      >
                    </div>
                  </div>

                  <div
                    class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 sm:hidden space-y-2"
                  >
                    <button
                      v-if="
                        isCurrentUserAdmin &&
                        !participant.paid &&
                        pool.entryFee > 0
                      "
                      class="w-full flex items-center justify-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 rounded-md py-2 transition-colors dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900"
                      @click.stop="promptConfirmPayment(participant)"
                    >
                      <CurrencyDollarIcon class="w-4 h-4" />
                      <span>Confirmar Pagamento</span>
                    </button>
                    <button
                      v-if="shouldShowRemoveButton(participant)"
                      class="w-full flex items-center justify-center gap-2 text-sm font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-md py-2 transition-colors dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900"
                      @click.stop="promptRemoveParticipant(participant)"
                    >
                      <UserMinusIcon class="w-4 h-4" />
                      <span>{{
                        isCurrentUserAdmin
                          ? "Remover do Bolão"
                          : "Sair do Bolão"
                      }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </main>

      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
          <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Você tem certeza?</h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Essa ação não tem volta, você quer mesmo deletar esse bolão?
          </p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              class="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              @click="showDeleteModal = false"
            >
              Cancelar
            </button>
            <button
              class="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              @click="confirmDeletePool"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="participantToConfirmPayment"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click="participantToConfirmPayment = null"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm mx-4 p-6 text-center"
          @click.stop
        >
          <div
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50"
          >
            <CurrencyDollarIcon
              class="h-6 w-6 text-green-600 dark:text-green-400"
              aria-hidden="true"
            />
          </div>
          <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Confirmar Pagamento
          </h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Você confirma que
            <strong class="dark:text-gray-100">{{ participantToConfirmPayment.userName }}</strong> efetuou
            o pagamento da taxa de entrada?
          </p>
          <div class="mt-6 flex justify-center gap-3">
            <button
              class="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 w-full flex items-center justify-center"
              :disabled="isActionLoading"
              :class="{ 'opacity-75 cursor-not-allowed': isActionLoading }"
              @click="confirmPayment"
            >
              <svg
                v-if="isActionLoading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              <span v-if="isActionLoading">Processando...</span>
              <span v-else>Confirmar</span>
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="participantToRemove"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click="participantToRemove = null"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm mx-4 p-6 text-center"
          @click.stop
        >
          <div
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50"
          >
            <ExclamationTriangleIcon
              class="h-6 w-6 text-red-600 dark:text-red-400"
              aria-hidden="true"
            />
          </div>
          <h3 class="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {{
              isCurrentUserAdmin &&
              participantToRemove.userId !== authStore.user?.id
                ? "Remover Participante"
                : "Sair do Bolão"
            }}
          </h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Você tem certeza que deseja remover
            <strong class="dark:text-gray-100">{{ participantToRemove.userName }}</strong> do bolão? Essa
            ação não pode ser desfeita.
          </p>
          <div class="mt-6 flex justify-center gap-3">
            <button
              class="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 w-full flex items-center justify-center"
              :disabled="isActionLoading"
              :class="{ 'opacity-75 cursor-not-allowed': isActionLoading }"
              @click="confirmRemoveParticipant"
            >
              <svg
                v-if="isActionLoading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              <span v-if="isActionLoading">Removendo...</span>
              <span v-else>Remover</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, navigateTo } from "#app";
import { useWindowSize } from "@vueuse/core";
import {
  TrashIcon,
  StarIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  AdjustmentsHorizontalIcon,
  UserMinusIcon,
  ClipboardDocumentListIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
} from "@heroicons/vue/24/solid";

const stores = useStores();
const route = useRoute();
const authStore = stores.auth;

const poolId = route.params.id;
const loading = ref(true);
const error = ref(null);

const showDeleteModal = ref(false);
const participantToRemove = ref(null);
const participantToConfirmPayment = ref(null);
const isActionLoading = ref(false);

const expandedParticipants = ref(new Set());
const toggleExpand = (userId) => {
  if (expandedParticipants.value.has(userId)) {
    expandedParticipants.value.delete(userId);
  } else {
    expandedParticipants.value.add(userId);
  }
};
const isExpanded = (userId) => expandedParticipants.value.has(userId);

const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);
const isInfoExpanded = ref(false);

// --- Computeds ---
const pool = computed(() => stores.pools.currentPool);
const allBets = computed(() => stores.bet.allPoolBets[poolId] || []);
const championships = computed(() => stores.championships.championships);

const isCurrentUserAdmin = computed(() => {
  if (!pool.value || !authStore.user) return false;
  const admin = pool.value.participants.find((p) => p.role === "admin");
  return admin?.userId === authStore.user.id;
});

const championshipName = computed(() => {
  if (!pool.value || !championships.value) return "Campeonato";
  const champ = championships.value.find(
    (c) => c.id === pool.value.baseChampionshipId
  );
  return champ ? champ.name : "Campeonato";
});

const handleDeletePool = () => {
  showDeleteModal.value = true;
};

const confirmDeletePool = async () => {
  const result = await stores.pools.deletePool(poolId);
  if (result.success) {
    stores.ui.showToast("Bolão excluído com sucesso!", "success");
    navigateTo("/");
  } else {
    stores.ui.showToast(result.error || "Falha ao excluir o bolão.", "error");
  }
  showDeleteModal.value = false;
};

const shouldShowRemoveButton = (participant) => {
  if (!authStore.user) return false;
  return isCurrentUserAdmin.value || participant.userId === authStore.user.id;
};

const promptRemoveParticipant = (participant) => {
  participantToRemove.value = participant;
};

const confirmRemoveParticipant = async () => {
  if (!participantToRemove.value || isActionLoading.value) return;

  isActionLoading.value = true;
  try {
    const userToRemoveId = participantToRemove.value.userId;
    const result = await stores.pools.removeParticipant(poolId, userToRemoveId);

    if (result.error) {
      stores.ui.showToast(result.error, "error");
    } else {
      stores.ui.showToast("Participante removido com sucesso!", "success");
      if (userToRemoveId === authStore.user?.id) {
        navigateTo("/");
      }
    }
  } finally {
    isActionLoading.value = false;
    participantToRemove.value = null;
  }
};

const promptConfirmPayment = (participant) => {
  participantToConfirmPayment.value = participant;
};

const confirmPayment = async () => {
  if (!participantToConfirmPayment.value || isActionLoading.value) return;

  isActionLoading.value = true;
  try {
    const userToConfirmId = participantToConfirmPayment.value.userId;
    const result = await stores.pools.confirmPayment(poolId, userToConfirmId);

    if (result.error) {
      stores.ui.showToast(result.error, "error");
    } else {
      stores.ui.showToast("Pagamento confirmado com sucesso!", "success");
    }
  } finally {
    isActionLoading.value = false;
    participantToConfirmPayment.value = null;
  }
};

const participantStats = computed(() => {
  if (!pool.value || !allBets.value) {
    return (
      pool.value?.participants.map((p) => ({
        ...p,
        stats: {
          totalPoints: 0,
          fullHits: 0,
          partialHits: 0,
          resultHits: 0,
          goalHits: 0,
          totalBets: 0,
          fullHitsPercentage: 0,
        },
      })) || []
    );
  }

  const pointsConfig = pool.value.points;

  const statsList = pool.value.participants.map((participant) => {
    const participantBets = allBets.value.filter(
      (b) => b.user.id === participant.userId
    );

    const stats = {
      totalPoints: 0,
      fullHits: 0,
      partialHits: 0,
      resultHits: 0,
      goalHits: 0,
      totalBets: participantBets.length,
      fullHitsPercentage: 0,
    };

    participantBets.forEach((bet) => {
      const pointsEarned = bet.pointsEarned || 0;
      stats.totalPoints += pointsEarned;

      if (pointsConfig && pointsEarned > 0) {
        if (pointsEarned === pointsConfig.full) {
          stats.fullHits++;
        } else if (pointsEarned === pointsConfig.partial) {
          stats.partialHits++;
        } else if (pointsEarned === pointsConfig.result) {
          stats.resultHits++;
        } else if (pointsEarned === pointsConfig.goal) {
          stats.goalHits++;
        }
      }
    });

    if (stats.totalBets > 0) {
      stats.fullHitsPercentage = (stats.fullHits / stats.totalBets) * 100;
    }

    return { ...participant, stats };
  });

  return statsList.sort((a, b) => b.stats.totalPoints - a.stats.totalPoints);
});

onMounted(async () => {
  isInfoExpanded.value = !isMobile.value;
  try {
    const poolResult = await stores.pools.fetchPoolById(poolId);
    if (!poolResult.success || !poolResult.data) {
      throw new Error(poolResult.error || "Bolão não encontrado.");
    }
    const currentPool = poolResult.data;
    await stores.matches.fetchByChampionship(currentPool.baseChampionshipId);
    await stores.bet.fetchAllBetsByPool(poolId);
    if (stores.championships.championships.length === 0) {
      await stores.championships.fetchAllChampionships();
    }
  } catch (e) {
    error.value = e.message;
  }
  loading.value = false;
});

const formatCurrency = (value) => {
  if (value == null || value === 0) return "Grátis";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  max-height: 500px;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
