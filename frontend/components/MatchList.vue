<template>
  <div class="sm:px-6 pb-6">
    <div
      v-if="loading"
      class="pt-8 text-center text-gray-500 dark:text-gray-400"
    >
      A carregar jogos...
    </div>
    <div v-else-if="Object.keys(matchesByDay).length > 0" class="mt-2">
      <div v-for="(matches, day) in matchesByDay" :key="day" class="mb-6">
        <div class="space-y-px">
          <slot name="match" v-bind="{ matches }">
            <div
              v-for="match in matches"
              :key="match.id"
              class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
            >
              <div
                class="grid grid-cols-1 md:grid-cols-[100px_1fr_100px] gap-4 items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
              >
                <div
                  class="hidden md:block text-sm font-medium text-gray-800 dark:text-gray-300 text-left"
                >
                  {{ formatTime(match.date) }}
                </div>

                <div class="flex items-center justify-between text-sm gap-2">
                  <div class="flex items-center gap-2 flex-1 justify-end">
                    <span
                      class="text-right truncate max-w-[120px] dark:text-gray-200"
                    >
                      {{ match.homeTeamName }}
                    </span>
                    <img
                      :src="match.homeTeamLogoUrl"
                      class="object-contain w-6 h-6 shrink-0"
                    >
                  </div>

                  <div class="flex flex-col items-center">
                    <div
                      class="flex items-center gap-1 font-bold text-base text-gray-800 dark:text-gray-200"
                    >
                      <span class="w-8 text-center">{{
                        match.homeScore ?? ""
                      }}</span>
                      <span class="dark:text-gray-200">-</span>
                      <span class="w-8 text-center">{{
                        match.awayScore ?? ""
                      }}</span>
                    </div>
                    <span
                      class="md:hidden text-xs text-gray-500 dark:text-gray-400 mt-1"
                    >
                      <span
                        v-if="match.status === 'NS' || match.status === 'PST'"
                        >{{ formatTime(match.date) }}</span
                      >
                      <span v-else>{{ getStatusText(match.status) }}</span>
                    </span>
                  </div>

                  <div class="flex items-center gap-2 flex-1 justify-start">
                    <img
                      :src="match.awayTeamLogoUrl"
                      class="object-contain w-6 h-6 shrink-0"
                    >
                    <span
                      class="text-left truncate max-w-[120px] dark:text-gray-200"
                    >
                      {{ match.awayTeamName }}
                    </span>
                  </div>
                </div>

                <div
                  class="hidden md:block text-sm font-medium text-gray-500 dark:text-gray-300 text-right"
                >
                  {{ getStatusText(match.status) }}
                </div>
              </div>
            </div>
          </slot>
        </div>
      </div>
    </div>
    <div v-else class="pt-8 text-center text-gray-500 dark:text-gray-400">
      <p>Nenhum jogo encontrado para esta rodada.</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  matchesByDay: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: ''
  }
});

const formatTime = (dateString) =>
  new Date(dateString).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const getStatusText = (status) =>
  ({
    NS: "Agendado",
    PST: "Adiado",
    FT: "Encerrado",
    HT: "Intervalo",
    "1H": "1º Tempo",
    "2H": "2º Tempo",
  }[status] || status);
</script>
