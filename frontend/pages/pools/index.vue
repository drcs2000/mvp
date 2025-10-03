<template>
  <div>
    <header
      class="sticky top-0 z-10 p-4 bg-white/80 sm:p-6 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-800/80 dark:border-gray-700"
    >
      <div class="max-w-4xl mx-auto">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Bolões Públicos</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Encontre um bolão aberto e participe.
        </p>
      </div>
    </header>

    <main class="p-4 sm:p-6">
      <div class="max-w-4xl mx-auto">
        <div v-if="loading" class="text-center text-gray-500 dark:text-gray-400 py-10">
          Carregando bolões...
        </div>

        <div
          v-else-if="error"
          class="flex flex-col items-center justify-center p-6 bg-white border border-red-200 rounded-lg shadow-sm dark:bg-red-900/20 dark:border-red-500/30"
        >
          <ExclamationTriangleIcon class="w-10 h-10 text-red-400 dark:text-red-300" />
          <h3 class="mt-2 text-lg font-semibold text-red-800 dark:text-red-200">
            Ocorreu um erro
          </h3>
          <p class="mt-1 text-sm text-red-600 dark:text-red-300">{{ error }}</p>
        </div>

        <div v-else-if="stores.pools.publicPools.length > 0" class="space-y-4">
          <NuxtLink
            v-for="pool in stores.pools.publicPools"
            :key="pool.id"
            :to="`/pools/${pool.id}`"
            class="block p-4 transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-sm group hover:border-gray-400 hover:shadow-md dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-500"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-gray-800 truncate pr-4 dark:text-gray-200">
                {{ pool.name }}
              </span>

              <div
                class="hidden md:block relative h-5 shrink-0"
                style="width: 170px"
              >
                <div
                  class="absolute right-0 flex items-center gap-4 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:text-gray-400"
                >
                  <span class="flex items-center">
                    <UsersIcon class="inline-block w-4 h-4 mr-1" />
                    {{ pool.participants.length }} / {{ pool.maxParticipants }}
                  </span>
                  <span class="flex items-center">
                    <CurrencyDollarIcon class="inline-block w-4 h-4 mr-1" />
                    {{ formatCurrency(pool.entryFee) }}
                  </span>
                </div>

                <div
                  class="absolute right-0 transition-opacity duration-300 group-hover:opacity-0"
                >
                  <LockClosedIcon
                    v-if="pool.private"
                    class="w-5 h-5 text-gray-400 dark:text-gray-500"
                  />
                  <LockOpenIcon v-else class="w-5 h-5 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </div>

            <div
              class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 md:hidden dark:border-gray-700"
            >
              <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span class="flex items-center">
                  <UsersIcon class="inline-block w-4 h-4 mr-1" />
                  {{ pool.participants.length }} / {{ pool.maxParticipants }}
                </span>
                <span class="flex items-center">
                  <CurrencyDollarIcon class="inline-block w-4 h-4 mr-1" />
                  {{ formatCurrency(pool.entryFee) }}
                </span>
              </div>
              <div>
                <LockClosedIcon
                  v-if="pool.private"
                  class="w-5 h-5 text-gray-400 dark:text-gray-500"
                />
                <LockOpenIcon v-else class="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
          </NuxtLink>
        </div>

        <div
          v-else
          class="p-10 text-center text-gray-500 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 dark:text-gray-400"
        >
          <p class="font-medium">Nenhum torneio público encontrado.</p>
          <p class="mt-2 text-sm">
            Que tal
            <NuxtLink
              to="/pools/create"
              class="font-semibold text-gray-800 underline hover:text-black dark:text-gray-200 dark:hover:text-white"
            >
              criar um novo
            </NuxtLink>
            ?
          </p>
        </div>
      </div>
      {{ stores.pools.pools }}
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  LockClosedIcon,
  LockOpenIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/vue/24/outline";

useHead({
  title: "Bolões",
});

const stores = useStores();
const loading = ref(true);
const error = ref(null);

const formatCurrency = (value) => {
  if (value == null || value === 0) return "Grátis";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    // Agora, a função simplesmente é chamada.
    // Se ela falhar, o 'catch' será acionado.
    await stores.pools.fetchAllPublicPools();
  } catch (err) {
    // A store já logou o erro, aqui apenas definimos a mensagem para a UI.
    error.value = err.data?.error || 'Falha ao carregar os bolões.';
  } finally {
    // O 'finally' garante que o loading sempre terminará.
    loading.value = false;
  }
});
</script>
