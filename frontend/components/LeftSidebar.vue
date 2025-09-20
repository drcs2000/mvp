<template>
  <aside
    class="flex flex-col h-full bg-white p-3 transition-transform duration-300 ease-in-out z-50 fixed top-0 left-0 w-64 shadow-lg transform xl:relative xl:w-full xl:shadow-none xl:translate-x-0 xl:p-0"
    :class="{
      'translate-x-0': isSidebarOpen,
      '-translate-x-full': !isSidebarOpen,
    }"
  >
    <div class="flex items-center justify-between shrink-0 xl:block">
      <NuxtLink to="/" class="px-3 mb-6 text-2xl font-bold"> MVP </NuxtLink>
      <button @click="isSidebarOpen = false" class="xl:hidden p-1">
        <XMarkIcon class="w-6 h-6" />
      </button>
    </div>

    <div class="shrink-0">
      <h3
        class="px-3 mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase"
      >
        Gerenciar
      </h3>
      <NuxtLink
        to="/pools/create"
        class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md text-gray-600 hover:bg-gray-100"
        active-class="bg-green-50 text-green-600 font-semibold"
      >
        <PlusCircleIcon class="w-4 h-4 mr-2 shrink-0" />
        <span class="text-[13px] font-medium truncate">Criar Bolão</span>
      </NuxtLink>
      <NuxtLink
        to="/pools"
        class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md text-gray-600 hover:bg-gray-100"
        active-class="bg-green-50 text-green-600 font-semibold"
      >
        <QueueListIcon class="w-4 h-4 mr-2 shrink-0" />
        <span class="text-[13px] font-medium truncate">Listar Bolões</span>
      </NuxtLink>

      <NuxtLink
        to="/pools/my"
        class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md text-gray-600 hover:bg-gray-100"
        active-class="bg-green-50 text-green-600 font-semibold"
      >
        <TrophyIcon class="w-4 h-4 mr-2 shrink-0" />
        <span class="text-[13px] font-medium truncate">Meus Bolões</span>
      </NuxtLink>
    </div>

    <hr class="my-6 border-t border-gray-200" />

    <div class="flex-1 overflow-hidden flex flex-col">
      <h3
        class="px-3 mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase shrink-0"
      >
        Navegar
      </h3>

      <nav class="flex-1 overflow-y-auto no-scrollbar">
        <div>
          <div
            class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md cursor-pointer transition-colors duration-200"
            :class="{
              'bg-green-50 text-green-600 font-semibold': isFootballActive,
              'text-gray-800 hover:bg-green-50 hover:text-green-600':
                !isFootballActive,
            }"
            @click="isFootballMenuOpen = !isFootballMenuOpen"
          >
            <svg-icon
              type="mdi"
              :path="mdiSoccer"
              class="w-4 h-4 mr-2 shrink-0"
            />
            <span class="text-[13px] font-medium truncate">Futebol</span>
            <div class="flex-grow" />
            <ChevronRightIcon
              class="w-4 h-4 ml-auto transition-transform duration-300 flex-shrink-0"
              :class="{ 'rotate-90': isFootballMenuOpen }"
            />
          </div>

          <div
            class="submenu-container"
            :style="{ maxHeight: isFootballMenuOpen ? '700px' : '0px' }"
          >
            <div v-for="continent in menuData" :key="continent.title">
              <div
                class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md cursor-pointer transition-colors duration-200"
                :class="{
                  'bg-green-50 text-green-600 font-semibold':
                    isParentActive(continent),
                  'hover:bg-green-50 hover:text-green-600 text-gray-800':
                    !isParentActive(continent),
                }"
                @click="toggleMenu(continent)"
              >
                <span
                  class="text-[13px] font-medium truncate"
                  :title="continent.title"
                  >{{ continent.title }}</span
                >
                <ChevronRightIcon
                  class="w-4 h-4 ml-auto transition-transform duration-300 flex-shrink-0"
                  :class="{ 'rotate-90': continent.isOpen }"
                />
              </div>
              <div
                class="submenu-container"
                :style="{ maxHeight: continent.isOpen ? '500px' : '0px' }"
              >
                <div v-if="continent.title === 'Internacional'">
                  <NuxtLink
                    v-for="league in continent.children"
                    :key="league.id"
                    :to="league.path"
                    class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md text-gray-500 hover:bg-green-50 hover:text-green-600 relative group"
                    active-class="!bg-green-50 !text-green-600 font-semibold"
                  >
                    <img
                      :src="league.logo"
                      alt="League Logo"
                      class="w-4 h-4 mr-2 flex-shrink-0"
                    />
                    <span class="text-[13px] truncate">{{ league.title }}</span>
                    <div class="tooltip">{{ league.title }}</div>
                  </NuxtLink>
                </div>
                <div
                  v-for="country in continent.children"
                  v-else
                  :key="country.title"
                >
                  <div
                    v-if="country.children"
                    class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md cursor-pointer transition-colors duration-200"
                    :class="{
                      'bg-green-50 text-green-600 font-semibold':
                        isParentActive(country),
                      'hover:bg-green-50 hover:text-green-600 text-gray-800':
                        !isParentActive(country),
                    }"
                    @click="toggleMenu(country)"
                  >
                    <img
                      v-if="country.flagUrl"
                      :src="country.flagUrl"
                      alt="Country Flag"
                      class="w-4 h-4 mr-2 flex-shrink-0"
                    />
                    <span
                      class="text-[13px] font-medium truncate"
                      :title="country.title"
                      >{{ country.title }}</span
                    >
                    <ChevronRightIcon
                      class="w-4 h-4 ml-auto transition-transform duration-300 flex-shrink-0"
                      :class="{ 'rotate-90': country.isOpen }"
                    />
                  </div>
                  <div
                    class="submenu-container"
                    :style="{ maxHeight: country.isOpen ? '200px' : '0px' }"
                  >
                    <NuxtLink
                      v-for="league in country.children"
                      :key="league.id"
                      :to="league.path"
                      class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md text-gray-500 hover:bg-green-50 hover:text-green-600 relative group"
                      active-class="!bg-green-50 !text-green-600 font-semibold"
                    >
                      <img
                        :src="league.logo"
                        alt="League Logo"
                        class="w-4 h-4 mr-2 flex-shrink-0"
                      />
                      <span class="text-[13px] truncate">{{
                        league.title
                      }}</span>
                      <div class="tooltip">{{ league.title }}</div>
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>

    <div class="shrink-0 pt-4">
      <hr class="my-6 border-t border-gray-200" />
      <NuxtLink
        to="/settings"
        class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md text-gray-600 hover:bg-gray-100"
        active-class="bg-green-50 text-green-600 font-semibold"
      >
        <Cog6ToothIcon class="w-4 h-4 mr-2 shrink-0" />
        <span class="text-[13px] font-medium truncate">Configurações</span>
      </NuxtLink>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import {
  ChevronRightIcon,
  Cog6ToothIcon,
  PlusCircleIcon,
  QueueListIcon,
  TrophyIcon,
  XMarkIcon, // 1. IMPORTAR O ÍCONE DE FECHAR
} from "@heroicons/vue/24/outline";
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiSoccer } from "@mdi/js";

// 2. USAR O ESTADO GLOBAL COMPARTILHADO
const isSidebarOpen = useSidebar();

// O resto do seu script original permanece igual
const route = useRoute();
const stores = useStores();
const isFootballMenuOpen = ref(false);

const menuData = ref([]);

onMounted(() => {
  const savedState = localStorage.getItem("footballMenuOpen");
  if (savedState !== null) {
    isFootballMenuOpen.value = JSON.parse(savedState);
  }

  stores.championships.fetchAllChampionships().then(() => {
    buildMenuData();
    expandActiveMenuItems();
  });
});

watch(isFootballMenuOpen, (newValue) => {
  localStorage.setItem("footballMenuOpen", JSON.stringify(newValue));
});

const getContinent = (country) => {
  const continents = {
    Brazil: "america",
    Spain: "europa",
    Germany: "europa",
    England: "europa",
    Italy: "europa",
    France: "europa",
    World: "internacional",
  };
  return continents[country] || "outros";
};

const slugify = (text) => {
  if (!text) return "";
  return text.toString().toLowerCase().replace(/\s+/g, "-");
};

const buildMenuData = () => {
  const data = {};
  const sport = "football";

  const sortedChampionships = [...stores.championships.championships].sort(
    (a, b) => {
      return (
        a.countryName.localeCompare(b.countryName) ||
        a.name.localeCompare(b.name)
      );
    }
  );

  sortedChampionships.forEach((champ) => {
    const continentName = getContinent(champ.countryName);
    const countryName = champ.countryName;

    const continentTitle =
      continentName.charAt(0).toUpperCase() + continentName.slice(1);
    const basePath = `/${sport}/${continentName}`;
    const countryPath = `${basePath}/${slugify(countryName)}`;

    const path = `${countryPath}/${champ.apiFootballId}`;

    if (!data[continentTitle]) {
      data[continentTitle] = {
        title: continentTitle,
        basePath: basePath,
        isOpen: false,
        children: {},
      };
    }

    if (!data[continentTitle].children[countryName]) {
      data[continentTitle].children[countryName] = {
        title: countryName,
        basePath: countryPath,
        flagUrl: champ.countryFlagUrl,
        isOpen: false,
        children: [],
      };
    }

    data[continentTitle].children[countryName].children.push({
      id: champ.apiFootballId,
      title: champ.name,
      path: path,
      logo: champ.leagueLogoUrl,
    });
  });

  menuData.value = Object.values(data).map((continent) => {
    if (continent.title === "Internacional") {
      const internationalLeagues = Object.values(continent.children).flatMap(
        (country) => country.children
      );

      internationalLeagues.forEach((league) => {
        league.path = `/${sport}/internacional/${league.id}`;
      });

      return {
        ...continent,
        children: internationalLeagues,
      };
    }
    return {
      ...continent,
      children: Object.values(continent.children),
    };
  });
};

const expandActiveMenuItems = () => {
  const currentPath = route.path;

  menuData.value.forEach((continent) => {
    if (currentPath.startsWith(continent.basePath)) {
      continent.isOpen = true;
      isFootballMenuOpen.value = true;

      if (continent.children && continent.children.length) {
        continent.children.forEach((country) => {
          if (country.basePath && currentPath.startsWith(country.basePath)) {
            country.isOpen = true;

            if (country.children && country.children.length) {
              country.children.forEach((league) => {
                if (league.path === currentPath) {
                  country.isOpen = true;
                  continent.isOpen = true;
                  isFootballMenuOpen.value = true;
                }
              });
            }
          }
        });
      }
    }
  });
};

watch(
  () => route.path,
  () => {
    expandActiveMenuItems();
  }
);

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
/* Estilos originais não precisam de alteração */
.submenu-container {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease-in-out;
  margin-left: 12px;
  border-left: 1px solid #e5e7eb;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.tooltip {
  @apply absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  z-index: 50;
}

.group:hover .tooltip {
  opacity: 1;
  visibility: visible;
}
</style>
