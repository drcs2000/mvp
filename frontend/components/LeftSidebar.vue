<template>
  <aside class="flex flex-col h-full px-3">
    <div class="px-3 mb-6 text-2xl font-bold shrink-0">MVP</div>

    <nav class="flex-1 overflow-y-auto no-scrollbar">
      <div>
        <h3
          class="px-3 mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase"
        >
          Gerenciar
        </h3>
        <NuxtLink
          to="/tournaments/create"
          class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md text-gray-600 hover:bg-gray-100"
          active-class="bg-green-50 text-green-600 font-semibold"
        >
          <PlusCircleIcon class="w-4 h-4 mr-2 shrink-0" />
          <span class="text-[13px] font-medium">Criar Torneio</span>
        </NuxtLink>
        <NuxtLink
          to="/tournaments"
          class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md text-gray-600 hover:bg-gray-100"
          active-class="bg-green-50 text-green-600 font-semibold"
        >
          <QueueListIcon class="w-4 h-4 mr-2 shrink-0" />
          <span class="text-[13px] font-medium">Listar Torneios</span>
        </NuxtLink>

        <NuxtLink
          to="/tournaments/my"
          class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md text-gray-600 hover:bg-gray-100"
          active-class="bg-green-50 text-green-600 font-semibold"
        >
          <TrophyIcon class="w-4 h-4 mr-2 shrink-0" />
          <span class="text-[13px] font-medium">Meus Torneios</span>
        </NuxtLink>
      </div>

      <hr class="my-6 border-t border-gray-200" />

      <div>
        <h3
          class="px-3 mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase"
        >
          Navegar
        </h3>
        <div
          @click="isFootballMenuOpen = !isFootballMenuOpen"
          class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md cursor-pointer transition-colors duration-200"
          :class="
            isFootballActive
              ? 'bg-green-50 border border-green-600 text-green-600'
              : 'border border-gray-800 text-gray-800 font-semibold hover:bg-gray-800 hover:text-white'
          "
        >
          <SparklesIcon class="w-4 h-4 mr-2 shrink-0" />
          <span class="text-[13px] font-medium">Futebol</span>
          <div class="flex-grow"></div>
          <ChevronRightIcon
            class="w-4 h-4 ml-auto transition-transform duration-300"
            :class="{ 'rotate-90': isFootballMenuOpen }"
          />
        </div>

        <div
          class="submenu-container"
          :style="{ maxHeight: isFootballMenuOpen ? '700px' : '0px' }"
        >
          <div v-for="continent in menuData" :key="continent.title">
            <div
              class="flex items-center w-full min-h-[36px] px-3 pl-7 mb-1.5 rounded-md cursor-pointer hover:bg-gray-100"
              :class="{
                'text-green-600 font-semibold': isParentActive(continent),
              }"
              @click="toggleMenu(continent)"
            >
              <span class="text-sm font-medium">{{ continent.title }}</span>
              <ChevronRightIcon
                class="w-4 h-4 ml-auto transition-transform duration-300"
                :class="{ 'rotate-90': continent.isOpen }"
              />
            </div>

            <div
              class="submenu-container"
              :style="{ maxHeight: continent.isOpen ? '500px' : '0px' }"
            >
              <div v-for="country in continent.children" :key="country.title">
                <div v-if="country.children">
                  <div
                    class="flex items-center w-full min-h-[36px] px-3 pl-11 mb-1.5 rounded-md cursor-pointer hover:bg-gray-100"
                    :class="{
                      'text-green-600 font-semibold': isParentActive(country),
                    }"
                    @click="toggleMenu(country)"
                  >
                    <span class="text-sm font-medium">{{ country.title }}</span>
                    <ChevronRightIcon
                      class="w-4 h-4 ml-auto transition-transform duration-300"
                      :class="{ 'rotate-90': country.isOpen }"
                    />
                  </div>
                  <div
                    class="submenu-container"
                    :style="{ maxHeight: country.isOpen ? '200px' : '0px' }"
                  >
                    <NuxtLink
                      v-for="league in country.children"
                      :key="league.path"
                      :to="league.path"
                      class="block w-full min-h-[32px] px-3 pl-16 py-1.5 rounded-md text-gray-500 hover:text-gray-900"
                      active-class="!text-green-600 font-semibold"
                    >
                      <span class="text-sm">{{ league.title }}</span>
                    </NuxtLink>
                  </div>
                </div>
                <NuxtLink
                  v-else
                  :to="country.path"
                  class="flex items-center w-full min-h-[36px] px-3 pl-11 mb-1.5 rounded-md text-gray-500 hover:text-gray-900"
                  active-class="!bg-green-50 !text-green-600 font-semibold"
                >
                  <span class="text-sm font-medium">{{ country.title }}</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div class="shrink-0 pt-4">
      <hr class="my-6 border-t border-gray-200" />
      <NuxtLink
        to="/settings"
        class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md text-gray-600 hover:bg-gray-100"
        active-class="bg-green-50 text-green-600 font-semibold"
      >
        <Cog6ToothIcon class="w-4 h-4 mr-2 shrink-0" />
        <span class="text-[13px] font-medium">Configurações</span>
      </NuxtLink>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from "vue";
import {
  SparklesIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  PlusCircleIcon,
  QueueListIcon,
  TrophyIcon, // Ícone Adicionado
} from "@heroicons/vue/24/outline";

const route = useRoute();
const isFootballMenuOpen = ref(false);

const menuData = ref([
  {
    title: "América",
    basePath: "/football/america",
    isOpen: false,
    children: [
      {
        title: "Brasil",
        basePath: "/football/america/brasil",
        isOpen: false,
        children: [
          { title: "Brasileirão", path: "/football/america/brasil/serie-a" },
          {
            title: "Copa do Brasil",
            path: "/football/america/brasil/copa-do-brasil",
          },
        ],
      },
      { title: "Libertadores", path: "/football/america/libertadores" },
    ],
  },
  {
    title: "Europa",
    basePath: "/football/europa",
    isOpen: false,
    children: [
      {
        title: "Inglaterra",
        basePath: "/football/europa/inglaterra",
        isOpen: false,
        children: [
          { title: "EPL", path: "/football/europa/inglaterra/premier-league" },
          { title: "FA Cup", path: "/football/europa/inglaterra/fa-cup" },
        ],
      },
    ],
  },
]);

const toggleMenu = (item) => {
  item.isOpen = !item.isOpen;
};

const isParentActive = (parentItem) => {
  return route.path.startsWith(parentItem.basePath);
};

const isFootballActive = computed(() => {
  return route.path.startsWith("/football");
});
</script>

<style scoped>
.submenu-container {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease-in-out;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
