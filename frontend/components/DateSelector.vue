<template>
  <div
    class="shrink-0 bg-white py-4 border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
  >
    <div class="flex items-center justify-center">
      <div class="flex items-center gap-2">
        <button
          :disabled="isFirst"
          class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="$emit('previous')"
        >
          <ChevronLeftIcon class="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        <p
          class="text-sm font-semibold text-gray-700 dark:text-gray-200 w-36 text-center"
        >
          {{ label }}
        </p>

        <button
          :disabled="isLast"
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
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";

defineProps({
  isFirst: {
    type: Boolean,
    default: false,
  },
  isLast: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: "",
  },
});

defineEmits(["previous", "next"]);
</script>
