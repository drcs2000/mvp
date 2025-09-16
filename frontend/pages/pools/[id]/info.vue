<template>
  <section class="bg-white min-h-screen">
    <div v-if="loading" class="pt-20 text-center text-gray-500">
      Carregando informações do bolão...
    </div>
    <div v-else-if="error" class="pt-20 text-center text-red-500">
      {{ error }}
    </div>

    <div v-else-if="pool">
      <header
        class="sticky top-0 z-30 flex items-center shrink-0 p-4 sm:p-6 border-b border-gray-200 bg-white/95 backdrop-blur-sm gap-4 h-[88px]"
      >
        <div class="flex-col">
          <h1 class="text-xl font-bold text-gray-900 leading-tight">
            {{ pool.name }}
          </h1>
          <p class="text-xs text-gray-500">{{ championshipName }}</p>
        </div>
        <div class="flex items-center gap-4 ml-auto text-right">
          <NuxtLink
            :to="`/pools/${poolId}/bets`"
            class="text-sm font-semibold text-gray-600 hover:text-slate-800 transition-colors duration-200 whitespace-nowrap"
          >
            Ver Todos Palpites
          </NuxtLink>
          <NuxtLink
            :to="`/pools/${poolId}`"
            class="text-sm font-semibold text-gray-600 hover:text-slate-800 transition-colors duration-200 whitespace-nowrap"
          >
            Palpitar
          </NuxtLink>
        </div>
      </header>

      <div
        class="sticky top-[88px] z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200"
      >
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold text-gray-800">Informações Gerais</h2>
            <button
              v-if="isCurrentUserAdmin"
              @click="handleDeletePool"
              class="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-800 transition-colors duration-200"
            >
              <TrashIcon class="w-4 h-4" />
              <span>Excluir Bolão</span>
            </button>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
            <div>
              <p class="text-xs text-gray-500">Visibilidade</p>
              <p
                class="text-sm font-semibold"
                :class="pool.private ? 'text-red-600' : 'text-green-600'"
              >
                {{ pool.private ? "Privado" : "Público" }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Taxa de Entrada</p>
              <p class="text-sm font-semibold text-gray-900">
                {{ formatCurrency(pool.entryFee) }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Participantes</p>
              <p class="text-sm font-semibold text-gray-900">
                {{ pool.participants.length }} / {{ pool.maxParticipants }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Prazo para Palpites</p>
              <p class="text-sm font-semibold text-gray-900">
                {{ pool.betDeadlineHours }}h antes do jogo
              </p>
            </div>
          </div>
        </div>
      </div>

      <main class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h2 class="text-lg font-bold text-gray-800 mb-6">
          Classificação e Estatísticas
        </h2>
        <div class="space-y-2">
          <div
            v-for="(participant, index) in participantStats"
            :key="participant.userId"
            class="border border-gray-200 bg-white rounded-lg transition-shadow hover:shadow-md cursor-pointer"
            @click="toggleExpand(participant.userId)"
          >
            <div class="grid grid-cols-[40px_1fr_auto] gap-4 items-center p-4">
              <span class="font-semibold text-sm text-gray-400 text-center"
                >#{{ index + 1 }}</span
              >
              <div class="flex items-center gap-3 overflow-hidden">
                <div
                  class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 flex-shrink-0"
                >
                  {{ participant.userName.charAt(0).toUpperCase() }}
                </div>
                <div class="flex items-center gap-2">
                  <p
                    class="font-semibold text-gray-800 truncate"
                    :title="participant.userName"
                  >
                    {{ participant.userName }}
                  </p>
                  <StarIcon
                    v-if="participant.role === 'ADMIN'"
                    class="w-4 h-4 text-yellow-500 flex-shrink-0"
                    title="Administrador"
                  />
                </div>
              </div>
              <div class="flex items-center gap-6">
                <span class="font-bold text-lg text-blue-600 w-20 text-right"
                  >{{ participant.stats.totalPoints }} pts</span
                >
                <ChevronDownIcon
                  class="w-5 h-5 text-gray-400 transition-transform"
                  :class="isExpanded(participant.userId) ? 'rotate-180' : ''"
                />
              </div>
            </div>

            <transition name="expand">
              <div v-if="isExpanded(participant.userId)" class="px-4 pb-4">
                <div class="border-t border-gray-200 pt-4 text-xs">
                  <div class="grid grid-cols-2 gap-x-8 gap-y-3">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-1.5 text-gray-600">
                        <StarIcon class="w-4 h-4 text-yellow-400" />
                        <span>Placar Cheio</span>
                      </div>
                      <span class="font-bold text-gray-900">{{
                        participant.stats.fullHits
                      }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-1.5 text-gray-600">
                        <CheckCircleIcon class="w-4 h-4 text-green-500" />
                        <span>Vencedor</span>
                      </div>
                      <span class="font-bold text-gray-900">{{
                        participant.stats.resultHits
                      }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-1.5 text-gray-600">
                        <ScaleIcon class="w-4 h-4 text-blue-500" />
                        <span>Empate</span>
                      </div>
                      <span class="font-bold text-gray-900">{{
                        participant.stats.partialHits
                      }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-1.5 text-gray-600">
                        <AdjustmentsHorizontalIcon
                          class="w-4 h-4 text-gray-500"
                        />
                        <span>Gols de um Time</span>
                      </div>
                      <span class="font-bold text-gray-900">{{
                        participant.stats.goalHits
                      }}</span>
                    </div>
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
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
          <h3 class="text-lg font-bold text-gray-900">Você tem certeza?</h3>
          <p class="mt-2 text-sm text-gray-600">
            Essa ação não tem volta, você quer mesmo deletar esse bolão?
          </p>
          <div class="mt-6 flex justify-end gap-3">
            <button
              @click="showDeleteModal = false"
              class="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              @click="confirmDeletePool"
              class="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Confirmar
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
import {
  TrashIcon,
  StarIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ScaleIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/vue/24/solid";

const stores = useStores();
const route = useRoute();
const authStore = stores.auth;

const poolId = route.params.id;
const loading = ref(true);
const error = ref(null);
const showDeleteModal = ref(false);

const expandedParticipants = ref(new Set());
const toggleExpand = (userId) => {
  expandedParticipants.value.has(userId)
    ? expandedParticipants.value.delete(userId)
    : expandedParticipants.value.add(userId);
};
const isExpanded = (userId) => expandedParticipants.value.has(userId);

const pool = computed(() => stores.pools.currentPool);
const allBets = computed(() => stores.bet.allPoolBets[poolId] || []);
const allMatches = computed(() => stores.matches.matches);
const championships = computed(() => stores.championships.championships);

const isCurrentUserAdmin = computed(() => {
  if (!pool.value || !authStore.user) return false;
  const admin = pool.value.participants.find((p) => p.role === "admin");
  return admin?.userId === authStore.user.id;
});

const handleDeletePool = () => {
  showDeleteModal.value = true;
};

const confirmDeletePool = async () => {
  const result = await stores.pools.deletePool(poolId);
  if (result.success) {
    navigateTo("/pools/my-pools");
  } else {
    error.value = result.error || "Falha ao excluir o bolão.";
  }
  showDeleteModal.value = false;
};

const championshipName = computed(() => {
  if (!pool.value || !championships.value) return "Campeonato";
  const champ = championships.value.find(
    (c) => c.id === pool.value.baseChampionshipId
  );
  return champ ? champ.name : "Campeonato";
});

const participantStats = computed(() => {
  if (!pool.value || !allBets.value.length) {
    return (
      pool.value?.participants.map((p) => ({
        ...p,
        stats: {
          totalPoints: 0,
          fullHits: 0,
          partialHits: 0,
          resultHits: 0,
          goalHits: 0,
        },
      })) || []
    );
  }

  const pointsConfig = pool.value.points;

  const statsList = pool.value.participants.map((participant) => {
    const participantBets = allBets.value.filter((b) => {
      return b.user.id === participant.userId;
    });

    const stats = {
      totalPoints: 0,
      fullHits: 0,
      partialHits: 0,
      resultHits: 0,
      goalHits: 0,
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

    return { ...participant, stats };
  });

  return statsList.sort((a, b) => b.stats.totalPoints - a.stats.totalPoints);
});

onMounted(async () => {
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
  } finally {
    loading.value = false;
  }
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
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
}
.expand-enter-to,
.expand-leave-from {
  max-height: 500px;
  opacity: 1;
}
</style>
