<template>
  <div class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
    <Teleport to="body">
      <AppToast :message="toastMessage" :type="toastType" />
    </Teleport>

    <div
      class="bg-white w-full h-[90vh] rounded-2xl shadow-lg p-6 grid grid-cols-[180px_1fr_260px] gap-6"
    >
      <div class="grid-column">
        <LeftSidebar />
      </div>

      <div class="grid-column flex flex-col">
        <slot />
      </div>

      <div class="grid-column">
        <RightSidebar />
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";

import AppToast from "~/components/AppToast.vue";
import LeftSidebar from "~/components/LeftSidebar.vue";
import RightSidebar from "~/components/RightSidebar.vue";

const stores = useStores();

const { toastMessage, toastType } = storeToRefs(stores.ui);
</script>

<style>
html,
body,
#__nuxt,
#__layout {
  height: 100%;
  width: 100%;
}

.grid-column {
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.grid-column::-webkit-scrollbar {
  display: none;
}
</style>
