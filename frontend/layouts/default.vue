<template>
  <div v-if="isMounted">
    <div class="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <Teleport to="body">
        <AppToast :message="toastMessage" :type="toastType" />
      </Teleport>

      <div
        v-if="!isMobile"
        class="p-4 flex items-center justify-center h-screen"
      >
        <div
          class="bg-white dark:bg-gray-800 w-full h-[90vh] rounded-2xl shadow-lg p-6 grid grid-cols-[180px_1fr_260px] gap-6"
        >
          <div class="grid-column">
            <LeftSidebar />
          </div>
          <div class="grid-column flex flex-col">
            <slot />
          </div>
          <div class="grid-column">
            <RightSidebar @navigate="closeSidebars" />
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col h-screen w-screen overflow-hidden">
        <AppBar
          class="shrink-0"
          @toggle-left="toggleLeftSidebar"
          @toggle-right="toggleRightSidebar"
        />

        <main class="flex-1 bg-gray-50 dark:bg-gray-900/50 overflow-y-auto">
          <slot />
        </main>

        <div
          v-if="isLeftSidebarOpen || isRightSidebarOpen"
          class="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity"
          @click="closeSidebars"
        />

        <aside
          :class="[
            'fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-xl z-40 transform transition-transform duration-300 ease-in-out w-[250px] p-3',
            isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          ]"
        >
          <LeftSidebar @navigate="closeSidebars" />
        </aside>

        <aside
          :class="[
            'fixed top-0 right-0 h-full bg-white dark:bg-gray-800 shadow-xl z-40 transform transition-transform duration-300 ease-in-out w-[280px] p-3',
            isRightSidebarOpen ? 'translate-x-0' : 'translate-x-full',
          ]"
        >
          <RightSidebar @navigate="closeSidebars" />
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useWindowSize } from "@vueuse/core";
import { useRoute } from '#app';

import AppToast from "~/components/AppToast.vue";
import LeftSidebar from "~/components/LeftSidebar.vue";
import RightSidebar from "~/components/RightSidebar.vue";
import AppBar from "~/components/AppBar.vue";

const { theme } = useTheme();

useHead({
  htmlAttrs: {
    class: () => theme.value
  }
})

const stores = useStores();
const { toastMessage, toastType } = storeToRefs(stores.ui);

const { isAuthenticated } = storeToRefs(stores.auth);

const { width } = useWindowSize();
const isMobile = computed(() => width.value < 1250);

const isLeftSidebarOpen = ref(false);
const isRightSidebarOpen = ref(false);

const isMounted = ref(false);

const checkAuthStatus = () => {
  if (!isAuthenticated.value) {
    stores.ui.showToast("Sua sessão expirou. Por favor, faça login novamente.", "error");
    stores.auth.logout(); 
    return false;
  }
  return true;
};

onMounted(() => {
  if (checkAuthStatus()) {
    isMounted.value = true;
  }
});

const route = useRoute();
watch(
  () => route.path,
  () => {
    checkAuthStatus();
  }
);

const toggleLeftSidebar = () => {
  isLeftSidebarOpen.value = !isLeftSidebarOpen.value;
  if (isLeftSidebarOpen.value) {
    isRightSidebarOpen.value = false;
  }
};

const toggleRightSidebar = () => {
  isRightSidebarOpen.value = !isRightSidebarOpen.value;
  if (isRightSidebarOpen.value) {
    isLeftSidebarOpen.value = false;
  }
};

const closeSidebars = () => {
  isLeftSidebarOpen.value = false;
  isRightSidebarOpen.value = false;
};
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

