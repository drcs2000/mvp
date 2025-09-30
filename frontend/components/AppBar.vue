<template>
  <header
    class="flex items-center justify-between h-14 bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700/50 px-4 shrink-0 z-20"
  >
    <button
      class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
      @click="$emit('toggleLeft')"
    >
      <Bars3Icon class="w-6 h-6 text-gray-700 dark:text-gray-300" />
    </button>

    <NuxtLink to="/" class="text-xl font-bold dark:text-white"> MVP </NuxtLink>

    <button
      class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
      @click="$emit('toggleRight')"
    >
      <TableCellsIcon class="w-6 h-6 text-gray-700 dark:text-gray-300" />
    </button>
  </header>
</template>

<script setup>
import { Bars3Icon, TableCellsIcon } from "@heroicons/vue/24/outline";

defineEmits(["toggleLeft", "toggleRight"]);
</script>
