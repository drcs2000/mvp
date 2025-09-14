<template>
  <section>
    <header class="flex items-center">
      <div class="relative flex-grow">
        <div
          class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
        >
          <MagnifyingGlassIcon class="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="search"
          placeholder="Pesquise"
          class="block w-full p-2 pl-10 text-sm text-gray-900 bg-gray-100 border-none rounded-lg focus:outline-none"
        />
      </div>

      <nav class="flex items-center flex-shrink-0 gap-2 ml-6">
        <NuxtLink
          to="/results"
          class="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100"
          active-class="!text-green-600 !font-bold"
          >Results</NuxtLink
        >
        <NuxtLink
          to="/statistics"
          class="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100"
          active-class="!text-green-600 !font-bold"
          >Statistics</NuxtLink
        >
        <NuxtLink
          to="/matches"
          class="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100"
          active-class="!text-green-600 !font-bold"
          >Matches</NuxtLink
        >
      </nav>
    </header>

    <div class="mt-6 rounded-xl bg-gray-800 p-4 min-h-[150px] text-white"></div>

    <div class="mt-6 overflow-hidden border border-gray-200 rounded-lg">
      <table
        class="min-w-full text-sm text-left text-gray-700 divide-y divide-gray-200"
      >
        <thead class="text-xs text-gray-500 uppercase bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3">Data</th>
            <th scope="col" class="px-6 py-3">Partida</th>
            <th scope="col" class="px-6 py-3">Arena</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="match in upcomingMatches"
            :key="match.id"
            class="bg-white hover:bg-gray-50"
          >
            <td class="px-6 py-4 whitespace-nowrap">{{ match.date }}</td>
            <td class="px-6 py-4 font-medium">{{ match.teams }}</td>
            <td class="px-6 py-4">{{ match.arena }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/outline";

const upcomingMatches = ref([
  {
    id: 1,
    date: "13 Set, 16:00",
    teams: "Flamengo vs Palmeiras",
    arena: "Maracanã",
  },
  {
    id: 2,
    date: "13 Set, 21:00",
    teams: "Corinthians vs São Paulo",
    arena: "Neo Química Arena",
  },
  {
    id: 3,
    date: "14 Set, 18:00",
    teams: "Grêmio vs Internacional",
    arena: "Arena do Grêmio",
  },
]);
</script>
