<template>
  <button
    type="button"
    class="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
    :title="switchLabel"
    :aria-label="switchLabel"
    @click="setLocale(nextLocale)"
  >
    <LanguageIcon class="h-4 w-4" />
    <span>{{ nextLocale === 'en' ? 'EN' : 'PT' }}</span>
  </button>
</template>

<script setup lang="ts">
import { LanguageIcon } from '@heroicons/vue/24/outline';

const { locale, setLocale, t } = useI18n();
const nextLocale = computed(() => locale.value === 'en' ? 'pt-BR' : 'en');
const switchLabel = computed(() => t(`language.switchTo.${nextLocale.value}`));
</script>
