<template>
  <div class="bg-gray-100 dark:bg-gray-900 min-h-screen">
    <Teleport to="body">
      <AppToast :message="toastMessage" :type="toastType" />
    </Teleport>

    <main class="p-4">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';

const { theme } = useTheme();
useHead({
  htmlAttrs: {
    class: () => theme.value
  }
})

const stores = useStores();
const { toastMessage, toastType } = storeToRefs(stores.ui);

onMounted(() => {
  document.body.classList.add('overflow-hidden');
});

onUnmounted(() => {
  document.body.classList.remove('overflow-hidden');
});
</script>
