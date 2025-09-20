<template>
  <div>
    <header
      class="sticky top-0 z-10 p-4 bg-white/80 sm:p-6 backdrop-blur-sm border-b border-gray-200"
    >
      <div class="max-w-5xl">
        <h1 class="text-2xl font-bold text-gray-900">Bolões</h1>
        <p class="mt-1 text-sm text-gray-500">
          Encontre um bolão aberto e participe.
        </p>
      </div>
    </header>

    <main class="p-4 sm:p-6">
      <div class="space-y-3">
        <div v-if="loading" class="text-center text-gray-500">
          Carregando bolões...
        </div>

        <div
          v-else-if="error"
          class="p-4 text-center text-red-700 bg-red-100 rounded-lg"
        >
          {{ error }}
        </div>

        <div v-else-if="stores.pools.pools.length > 0">
          <NuxtLink
            v-for="pool in stores.pools.pools"
            :key="pool.id"
            :to="`/pools/${pool.id}`"
            class="relative flex items-center p-4 transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-sm group hover:border-gray-400 hover:shadow-md mb-4"
          >
            <span class="text-sm font-semibold text-gray-800">
              {{ pool.name }}
            </span>

            <div class="flex items-center ml-auto">
              <div
                class="flex items-center gap-4 text-xs text-gray-500 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
              >
                <span>
                  <UsersIcon class="inline-block w-4 h-4 mr-1" />
                  {{ pool.participants.length }} / {{ pool.maxParticipants }}
                </span>
                <span>
                  <CurrencyDollarIcon class="inline-block w-4 h-4 mr-1" />
                  R$ {{ pool.entryFee }}
                </span>
              </div>

              <div
                class="absolute right-4 transition-opacity duration-300 group-hover:opacity-0"
              >
                <LockClosedIcon
                  v-if="pool.private"
                  class="w-5 h-5 text-gray-400"
                />
                <LockOpenIcon v-else class="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </NuxtLink>
        </div>

        <div
          v-else
          class="p-10 text-center text-gray-500 border-2 border-dashed rounded-lg border-gray-300"
        >
          <p class="font-medium">Nenhum torneio público encontrado.</p>
          <p class="mt-2 text-sm">
            Que tal
            <NuxtLink to="/pools/create" class="text-green-600 underline">
              criar um novo
            </NuxtLink>
            ?
          </p>
        </div>
      </div>
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
} from "@heroicons/vue/24/outline";

useHead({
  title: "Bolões",
});

const stores = useStores();
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  const result = await stores.pools.fetchAllPublicPools();
  if (!result.success) {
    error.value = result.error;
  }
  loading.value = false;
});
</script>
