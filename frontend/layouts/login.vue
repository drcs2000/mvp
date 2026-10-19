<template>
  <div class="bg-gray-100 dark:bg-gray-900 min-h-screen">
    <div class="fixed right-4 top-4 z-30 rounded-md bg-white/90 shadow-sm dark:bg-gray-800/90">
      <LanguageSwitcher />
    </div>
    <Teleport to="body">
      <AppToast :message="toastMessage" :type="toastType" />
    </Teleport>

    <main class="p-4">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';

const { theme } = useTheme();
useHead({
  htmlAttrs: {
    class: () => theme.value
  }
})

const stores = useStores();
const { toastMessage, toastType } = storeToRefs(stores.ui);
</script>
