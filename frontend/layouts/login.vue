<template>
  <div class="bg-gray-100 min-h-screen">
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

const stores = useStores();
const { toastMessage, toastType } = storeToRefs(stores.ui);

onMounted(() => {
  document.body.classList.add('overflow-hidden');
});

onUnmounted(() => {
  document.body.classList.remove('overflow-hidden');
});
</script>