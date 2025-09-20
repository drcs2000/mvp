<template>
  <header
    class="flex items-center justify-between h-14 bg-white shadow-md px-4 shrink-0 z-20"
  >
    <button
      class="p-2 rounded-full hover:bg-gray-100"
      @click="$emit('toggleLeft')"
    >
      <Bars3Icon class="w-6 h-6 text-gray-700" />
    </button>

    <NuxtLink to="/" class="text-xl font-bold"> MVP </NuxtLink>

    <button
      class="p-2 rounded-full hover:bg-gray-100"
      @click="$emit('toggleRight')"
    >
      <TableCellsIcon class="w-6 h-6 text-gray-700" />
    </button>
  </header>
</template>

<script setup>
import { Bars3Icon, TableCellsIcon } from "@heroicons/vue/24/outline";

// Define os eventos que o componente pode emitir
defineEmits(["toggleLeft", "toggleRight"]);
</script>