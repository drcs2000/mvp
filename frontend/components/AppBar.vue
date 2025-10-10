<template>
  <header
    class="flex items-center justify-between h-14 bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700/50 px-4 shrink-0 z-20"
  >
    <button
      id="mobile-app-bar-left-button"
      class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
      @click="$emit('toggleLeft')"
    >
      <Bars3Icon class="w-6 h-6 text-gray-700 dark:text-gray-300" />
    </button>

    <NuxtLink to="/" class="text-xl font-bold dark:text-white"> MVP </NuxtLink>

    <button
      id="mobile-app-bar-right-button"
      class="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
      @click="$emit('toggleRight')"
    >
      <TableCellsIcon class="w-6 h-6 text-gray-700 dark:text-gray-300" />

      <span
        v-if="invitationCount > 0"
        class="absolute top-1.5 right-1.5 block w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"
        aria-label="Novos convites"
      />
    </button>
  </header>
</template>

<script setup>
import { Bars3Icon, TableCellsIcon } from "@heroicons/vue/24/outline";
import { useTour } from "~/composables/useTour";
import { useRoute } from "#app";

const { addSteps, tour } = useTour();
const route = useRoute();

defineProps({
  invitationCount: {
    type: Number,
    default: 0,
  },
});

defineEmits(["toggleLeft", "toggleRight"]);

watch(
  () => route.query.tourStep,
  (newStep) => {
    if (newStep === "3") {
      const isMobileTour = route.query.isMobile === "true";

      console.log(route.query)

      if (isMobileTour) {
        // Lógica para o tour mobile
        const mobileSteps = [
          
        ];
        addSteps(mobileSteps);
        }

      // Inicia o tour no passo 3
      setTimeout(() => {
        tour.show("step-3");
      }, 500);
    }
  },
  { immediate: true }
);
</script>
