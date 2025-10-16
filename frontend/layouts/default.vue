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
          <div id="v-step-3" class="grid-column">
            <LeftSidebar />
          </div>
          <div class="grid-column flex flex-col">
            <slot />
          </div>
          <div id="v-step-4" class="grid-column">
            <RightSidebar @navigate="closeSidebars" />
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col h-screen w-screen overflow-hidden">
        <AppBar
          class="shrink-0"
          :invitation-count="invitationCount"
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
import { useRoute } from "#app";
import { useRouter } from "vue-router";

import AppToast from "~/components/AppToast.vue";
import LeftSidebar from "~/components/LeftSidebar.vue";
import RightSidebar from "~/components/RightSidebar.vue";
import AppBar from "~/components/AppBar.vue";

import { useTour } from "~/composables/useTour";

const { theme } = useTheme();

useHead({
  htmlAttrs: {
    class: () => theme.value,
  },
});

const { addSteps, start, tour } = useTour();

const stores = useStores();
const router = useRouter();

const { toastMessage, toastType } = storeToRefs(stores.ui);

const invitationCount = computed(() => stores.invitations.invitationCount);

const { width } = useWindowSize();
const isMobile = computed(() => width.value < 1250);

const isLeftSidebarOpen = ref(false);
const isRightSidebarOpen = ref(false);

const isMounted = ref(false);

const checkAuthStatus = () => {
  stores.auth.checkTokenValidity();
};

onMounted(async () => {
  await stores.auth.initializeAuth();
  isMounted.value = true;

  if (
    stores.auth.isAuthenticated &&
    stores.users.myProfile.firstAccess
  ) {
    router.push("/");
    addSteps([
      {
        id: "step-1",
        attachTo: { element: "#v-step-1", on: "bottom" },
        title: "Jogo em Destaque",
        text: "Aqui você sempre verá um jogo do dia.",
        buttons: [
          { text: "Pular", action: tour.cancel, secondary: true },
          { text: "Próximo", action: tour.next },
        ],
        classes: "shepherd-custom",
      },
      {
        id: "step-2",
        attachTo: { element: "#v-step-2", on: "top" },
        title: "Lista de Jogos",
        text: "Abaixo, você encontra a lista completa de todos os jogos agendados para a data.",
        buttons: [
          { text: "Anterior", action: tour.back, secondary: true },
          {
            text: "Próximo",
            action: tour.next,
          },
        ],
        classes: "shepherd-custom",
      },
      {
        id: "step-2.5",
        attachTo: { element: "#header", on: "bottom" },
        title: "Lista de Campeonatos",
        text: "Acima você consegue selecionar um de nossos principais campeonatos para ver seus próximos jogos e classificação.",
        buttons: [
          { text: "Anterior", action: tour.back, secondary: true },
          {
            text: "Próximo",
            action: tour.next,
          },
        ],
        classes: "shepherd-custom",
      },
      {
        id: "step-3",
        title: "Menu Principal",
        text: "Ao lado vcê vê as opções do sistema, como criar seu bolão ou entrar em um bolão em andamento.",
        buttons: [
          { text: "Anterior", action: tour.back, secondary: true },
          {
            text: "Próximo",
            action: isMobile.value
              ? () => {
                  toggleLeftSidebar();
                  tour.next();
                }
              : tour.next,
          },
        ],
        classes: "shepherd-custom",
        attachTo: {
          element: isMobile.value ? "#mobile-app-bar-left-button" : "#v-step-3",
          on: isMobile.value ? "bottom" : "right",
        },
      },
      {
        id: "step-3.1",
        title: "Criar Bolão",
        text: "Esse botão te redireciona para a página de criação de bolão.",
        buttons: [
          { text: "Anterior", action: tour.back, secondary: true },
          { text: "Próximo", action: tour.next },
        ],
        classes: "sheperd-custom",
        attachTo: {
          element: "#create-pool",
          on: isMobile.value ? "bottom" : "right",
        },
      },
      {
        id: "step-3.2",
        title: "Listar Bolões Públicos",
        text: "Esse botão te redireciona para a página de listagem de bolões públicos.",
        buttons: [
          { text: "Anterior", action: tour.back, secondary: true },
          { text: "Próximo", action: tour.next },
        ],
        classes: "sheperd-custom",
        attachTo: {
          element: "#list-pools",
          on: isMobile.value ? "bottom" : "right",
        },
      },
      {
        id: "step-3.3",
        title: "Listar Meus Bolões",
        text: "Esse botão te redireciona para a página de listagem dos bolões em que você faz parte.",
        buttons: [
          { text: "Anterior", action: tour.back, secondary: true },
          {
            text: "Próximo",
            action: isMobile.value
              ? () => {
                  toggleLeftSidebar();
                  tour.next();
                }
              : tour.next,
          },
        ],
        classes: "sheperd-custom",
        attachTo: {
          element: "#list-my-pools",
          on: isMobile.value ? "bottom" : "right",
        },
      },
      {
        id: "step-4",
        title: "Notificações",
        text: "Aqui você pode ver seu Perfil e a Classificação do campeonato onde você está.",
        buttons: [
          { text: "Anterior", action: tour.back, secondary: true },
          {
            text: "Próximo",
            action: isMobile.value
              ? () => {
                  toggleRightSidebar();
                  tour.next();
                }
              : tour.next,
          },
        ],
        classes: "shepherd-custom",
        attachTo: {
          element: isMobile.value
            ? "#mobile-app-bar-right-button"
            : "#v-step-4",
          on: isMobile.value ? "bottom" : "left",
        },
      },
      {
        id: "step-4.1",
        title: "Perfil",
        text: "Esse botão te mostra o seu Perfil, convites enviados ou recebidos e a opção de deslogar de nosso sistema.",
        buttons: [
          { text: "Anterior", action: tour.back, secondary: true },
          { text: "Próximo", action: tour.next },
        ],
        classes: "sheperd-custom",
        attachTo: {
          element: "#profile",
          on: isMobile.value ? "bottom" : "left",
        },
      },
      {
        id: "step-4.1",
        title: "Classificação",
        text: "Aqui nós te mostramos a classificação do campeonato em que você está.",
        buttons: [
          { text: "Anterior", action: tour.back, secondary: true },
          { text: "Concluir", action: tour.complete },
        ],
        classes: "sheperd-custom",
        attachTo: {
          element: "#standings",
          on: "left",
        },
      },
    ]);
    setTimeout(() => {
      start('firstAccess');
    }, 1000);
  }
});

const route = useRoute();
watch(
  () => route.path,
  () => {
    checkAuthStatus();
  },
  { deep: true, immediate: true }
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

.shepherd-element.shepherd-custom {
  max-width: 320px;
  border-radius: 8px;
  background-color: #212b36;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); 
  border: 1px solid rgba(255, 255, 255, 0.08); 
}

.shepherd-element.shepherd-custom .shepherd-header {
  background-color: transparent; 
  padding: 0.75rem 1rem 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.shepherd-element.shepherd-custom .shepherd-title {
  color: #64748b;
  font-weight: 700;
  font-size: 1.05rem;
}

.shepherd-element.shepherd-custom .shepherd-cancel-icon {
  color: #64748b;
  font-size: 1rem;
  transition: color 0.2s ease;
}
.shepherd-element.shepherd-custom .shepherd-cancel-icon:hover {
  color: #cbd5e1;
}

.shepherd-element.shepherd-custom .shepherd-text {
  color: #a0aec0;
  padding: 0.75rem 1rem 1rem; 
  font-size: 0.875rem;
  line-height: 1.5;
}

.shepherd-element.shepherd-custom .shepherd-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05); 
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.shepherd-element.shepherd-custom .shepherd-button {
  background-color: transparent;
  color: #fff;
  padding: 0.375rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 6px;
  transition: background-color 0.2s ease, transform 0.1s ease;
}
.shepherd-element.shepherd-custom .shepherd-button:hover {
  transform: translateY(-1px); 
}
.shepherd-element.shepherd-custom .shepherd-button:active {
  transform: translateY(0);
}

.shepherd-element.shepherd-custom .shepherd-button.shepherd-button-secondary {
  background-color: transparent;
  color: #9ca3af;
  font-weight: 500;
  border: none;
}
.shepherd-element.shepherd-custom
  .shepherd-button.shepherd-button-secondary:hover {
  color: #e2e8f0; 
  background-color: rgba(255, 255, 255, 0.05);
  transform: none;
}

.shepherd-modal-overlay-container {
  background-color: rgba(0, 0, 0, 0.6);
}

@media (max-width: 767px) {
  .shepherd-element.shepherd-custom {
    max-width: 90%;
  }
  .shepherd-element.shepherd-custom .shepherd-footer {
    justify-content: space-between; 
  }
}
</style>
