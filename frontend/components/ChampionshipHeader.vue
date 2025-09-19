<template>
  <header
    class="flex items-center shrink-0 p-4 sm:p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm gap-4"
  >
    <slot name="left">
      <img
        v-if="championship?.leagueLogoUrl"
        :src="championship.leagueLogoUrl"
        class="w-8 h-8 object-contain"
      />
      <h1 v-if="championship?.name" class="text-xl font-bold text-gray-900">
        {{ championship.name }}
      </h1>
    </slot>

    <div class="flex items-center gap-4 ml-auto text-right">
      <slot name="right" />
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
