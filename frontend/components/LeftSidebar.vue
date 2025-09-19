<template>
  <aside class="flex flex-col h-full px-3">
    <NuxtLink to="/" class="px-3 mb-6 text-2xl font-bold shrink-0">
      MVP
    </NuxtLink>

    <nav class="flex-1 overflow-y-auto no-scrollbar">
      <div>
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
          <span class="text-[13px] font-medium">Criar Bolão</span>
        </NuxtLink>
        <NuxtLink
          to="/pools"
          class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md text-gray-600 hover:bg-gray-100"
          active-class="bg-green-50 text-green-600 font-semibold"
        >
          <QueueListIcon class="w-4 h-4 mr-2 shrink-0" />
          <span class="text-[13px] font-medium">Listar Bolões</span>
        </NuxtLink>

        <NuxtLink
          to="/pools/my"
          class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md text-gray-600 hover:bg-gray-100"
          active-class="bg-green-50 text-green-600 font-semibold"
        >
          <TrophyIcon class="w-4 h-4 mr-2 shrink-0" />
          <span class="text-[13px] font-medium">Meus Bolões</span>
        </NuxtLink>
      </div>

      <hr class="my-6 border-t border-gray-200" >

      <div>
        <h3
          class="px-3 mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase"
        >
          Navegar
        </h3>
        <div
          class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md cursor-pointer transition-colors duration-200 border border-gray-800 font-semibold"
          :class="{
            'bg-gray-800 text-white': isFootballActive || isFootballMenuOpen,
            'text-gray-800 hover:bg-gray-800 hover:text-white':
              !isFootballActive && !isFootballMenuOpen,
          }"
          @click="isFootballMenuOpen = !isFootballMenuOpen"
        >
          <svg-icon
            type="mdi"
            :path="mdiSoccer"
            class="w-4 h-4 mr-2 shrink-0"
          />
          <span class="text-[13px] font-medium">Futebol</span>
          <div class="flex-grow"/>
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
              class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md cursor-pointer transition-colors duration-200"
              :class="{
                'bg-gray-100 text-gray-800 font-semibold':
                  isParentActive(continent) || continent.isOpen,
                'hover:bg-gray-100 text-gray-800':
                  !isParentActive(continent) && !continent.isOpen,
              }"
              @click="toggleMenu(continent)"
            >
              <span class="text-[13px] font-medium">{{ continent.title }}</span>
              <ChevronRightIcon
                class="w-4 h-4 ml-auto transition-transform duration-300"
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
                  class="flex flex-row items-center w-full px-2 py-1 mb-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  active-class="!bg-gray-100 !text-gray-900 font-semibold"
                >
                  <img
                    :src="league.logo"
                    alt="League Logo"
                    class="w-4 h-4 mr-2"
                  >
                  <span class="text-[13px]">{{ league.title }}</span>
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
                    'bg-gray-100 text-gray-800 font-semibold':
                      isParentActive(country) || country.isOpen,
                    'hover:bg-gray-100 text-gray-800':
                      !isParentActive(country) && !country.isOpen,
                  }"
                  @click="toggleMenu(country)"
                >
                  <img
                    v-if="country.flagUrl"
                    :src="country.flagUrl"
                    alt="Country Flag"
                    class="w-4 h-4 mr-2"
                  >
                  <span class="text-[13px] font-medium">{{
                    country.title
                  }}</span>
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
                    :key="league.id"
                    :to="league.path"
                    class="flex flex-row items-center w-full px-2 py-1 mb-1.5 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    active-class="!bg-gray-100 !text-gray-900 font-semibold"
                  >
                    <img
                      :src="league.logo"
                      alt="League Logo"
                      class="w-4 h-4 mr-2"
                    >
                    <span class="text-[13px]">{{ league.title }}</span>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <div class="shrink-0 pt-4">
      <hr class="my-6 border-t border-gray-200" >
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
import { ref, computed, onMounted } from "vue";
import {
  ChevronRightIcon,
  Cog6ToothIcon,
  PlusCircleIcon,
  QueueListIcon,
  TrophyIcon,
} from "@heroicons/vue/24/outline";
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiSoccer } from "@mdi/js";

const route = useRoute();
const stores = useStores();
const isFootballMenuOpen = ref(false);

const menuData = ref([]);

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
  const sport = "football"; // Definido aqui para ser acessível em toda a função

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

    // O caminho final agora usa o apiFootballId para unicidade
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
      id: champ.apiFootballId, // Usar o apiFootballId como ID principal
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

      // Corrige o path para as ligas internacionais, que não têm país
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

const toggleMenu = (item) => {
  item.isOpen = !item.isOpen;
};

const isParentActive = (parentItem) => {
  return route.path.startsWith(parentItem.basePath);
};

const isFootballActive = computed(() => {
  return route.path.startsWith("/football");
});

onMounted(() => {
  stores.championships.fetchAllChampionships().then(() => {
    buildMenuData();
  });
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
