<template>
  <header
    class="p-4 sm:p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm"
  >
    <div
      class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
    >
      <div class="flex items-center gap-4">
        <slot name="left">
          <img
            v-if="championship?.leagueLogoUrl"
            :src="championship.leagueLogoUrl"
            class="w-8 h-8 object-contain"
          >
          <h1 v-if="championship?.name" class="text-xl font-bold text-gray-900">
            {{ championship.name }}
          </h1>
        </slot>
      </div>

      <div class="flex items-center justify-start md:justify-end gap-x-4">
        <slot name="right" />
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  championship: {
    type: Object,
    default: null,
  },
});
</script>
