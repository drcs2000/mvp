<template>
  <button
    type="button"
    :disabled="isSyncing"
    class="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-wait dark:text-gray-300 dark:hover:text-blue-400"
    :title="$t('pools.syncTitle')"
    @click="handleSync"
  >
    <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': isSyncing }" />
    <span class="hidden sm:inline">{{ $t('pools.sync') }}</span>
  </button>
</template>

<script setup>
import { ref } from "vue";
import { ArrowPathIcon } from "@heroicons/vue/20/solid";

const props = defineProps({
  championshipId: {
    type: Number,
    required: true,
  },
  afterSync: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits(["synced"]);
const stores = useStores();
const { t } = useI18n();
const isSyncing = ref(false);

const handleSync = async () => {
  if (isSyncing.value) return;

  isSyncing.value = true;
  try {
    await stores.standings.syncChampionship(props.championshipId);
    await stores.matches.syncChampionship(props.championshipId);
    await Promise.all([
      stores.standings.fetchStandingsByChampionshipId(props.championshipId, true),
      stores.matches.fetchByChampionship(props.championshipId, true),
    ]);
    if (props.afterSync) {
      await props.afterSync();
    }

    emit("synced");
    stores.ui.showToast(t('pools.syncSuccess'), "success");
  } catch (error) {
    stores.ui.showToast(
      error?.data?.message ||
        error?.message ||
        t('pools.syncError'),
      "error"
    );
  } finally {
    isSyncing.value = false;
  }
};
</script>
