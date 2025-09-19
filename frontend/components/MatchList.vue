<template>
  <div class="px-4 sm:px-6 pb-6">
    <div v-if="loading" class="pt-8 text-center text-gray-500">
      A carregar jogos...
    </div>
    <div v-else-if="Object.keys(matchesByDay).length > 0" class="mt-2">
      <div v-for="(matches, day) in matchesByDay" :key="day" class="mb-6">
        <h3 class="py-2 text-sm font-semibold text-gray-500 text-left">
          {{ formatDate(day) }}
        </h3>
        <div class="space-y-px">
          <slot name="match" v-bind="{ matches }">
            <div
              v-for="match in matches"
              :key="match.id"
              class="bg-white border-b border-gray-200"
            >
              <div
                class="grid grid-cols-[100px_1fr_100px] gap-4 items-center px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
              >
                <div class="text-sm font-medium text-gray-800 text-left">
                  {{ formatTime(match.date) }}
                </div>

                <div class="flex items-center justify-between text-sm gap-2">
                  <div class="flex items-center gap-2 flex-1 justify-end">
                    <span class="text-right truncate max-w-[120px]">
                      {{ match.homeTeamName }}
                    </span>
                    <img
                      :src="match.homeTeamLogoUrl"
                      class="object-contain w-6 h-6 shrink-0"
                    >
                  </div>

                  <div class="flex items-center gap-1 font-bold text-base">
                    <span class="w-8 text-center">{{
                      match.homeScore ?? ""
                    }}</span>
                    <span>-</span>
                    <span class="w-8 text-center">{{
                      match.awayScore ?? ""
                    }}</span>
                  </div>

                  <div class="flex items-center gap-2 flex-1 justify-start">
                    <img
                      :src="match.awayTeamLogoUrl"
                      class="object-contain w-6 h-6 shrink-0"
                    >
                    <span class="text-left truncate max-w-[120px]">
                      {{ match.awayTeamName }}
                    </span>
                  </div>
                </div>

                <div class="text-sm font-medium text-gray-500 text-right">
                  {{ getStatusText(match.status) }}
                </div>
              </div>
            </div>
          </slot>
        </div>
      </div>
    </div>
    <div v-else class="pt-8 text-center text-gray-500">
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
    FT: "Encerrado",
    HT: "Intervalo",
    "1H": "1º Tempo",
    "2H": "2º Tempo",
  }[status] || status);
</script>
