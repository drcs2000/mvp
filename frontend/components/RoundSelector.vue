<template>
  <div class="shrink-0 p-4 sm:p-6 border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700">
    <div class="flex items-center justify-center mt-4">
      <div class="flex items-center gap-2">
        <button
          :disabled="isFirstRound"
          class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="$emit('previous')"
        >
          <ChevronLeftIcon class="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <p class="text-sm font-semibold text-gray-700 dark:text-gray-200 w-24 text-center">
          Rodada {{ currentRoundNumber }}
        </p>
        <button
          :disabled="isLastRound"
          class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="$emit('next')"
        >
          <ChevronRightIcon class="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

defineProps({
  isFirstRound: Boolean,
  isLastRound: Boolean,
  currentRoundNumber: [String, Number]
})

defineEmits(['previous', 'next'])
</script>
