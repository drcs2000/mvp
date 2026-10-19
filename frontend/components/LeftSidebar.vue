<template>
  <aside
    class="flex flex-col h-full px-3 dark:bg-gray-800"
    @click="handleNavigation"
  >
    <NuxtLink
      to="/"
      class="px-3 mb-6 text-2xl font-bold shrink-0 dark:text-white"
    >
      MVP
    </NuxtLink>

    <div class="shrink-0">
      <h3
        class="px-3 mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase dark:text-gray-500"
      >
        {{ $t('navigation.manage') }}
      </h3>
      <NuxtLink
        id="create-pool"
        to="/pools/create"
        class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        active-class="bg-green-50 text-green-600 font-semibold dark:!bg-green-900/50 dark:!text-green-400"
      >
        <PlusCircleIcon class="w-4 h-4 mr-2 shrink-0" />
        <span class="text-[13px] font-medium truncate">{{ $t('navigation.createPool') }}</span>
      </NuxtLink>
      <NuxtLink
        id="list-pools"
        to="/pools"
        class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        active-class="bg-green-50 text-green-600 font-semibold dark:!bg-green-900/50 dark:!text-green-400"
      >
        <QueueListIcon class="w-4 h-4 mr-2 shrink-0" />
        <span class="text-[13px] font-medium truncate">{{ $t('navigation.publicPools') }}</span>
      </NuxtLink>

      <NuxtLink
        id="list-my-pools"
        to="/pools/my"
        class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        active-class="bg-green-50 text-green-600 font-semibold dark:!bg-green-900/50 dark:!text-green-400"
      >
        <TrophyIcon class="w-4 h-4 mr-2 shrink-0" />
        <span class="text-[13px] font-medium truncate">{{ $t('navigation.myPools') }}</span>
      </NuxtLink>
    </div>

    <hr class="my-6 border-t border-gray-200 dark:border-gray-700" >

    <div class="flex-1 overflow-hidden flex flex-col">
      <h3
        class="px-3 mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase shrink-0 dark:text-gray-500"
      >
        {{ $t('navigation.browse') }}
      </h3>

      <nav class="flex-1 overflow-y-auto no-scrollbar">
        <div>
          <div
            class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md cursor-pointer transition-colors duration-200"
            :class="{
              'bg-green-50 text-green-600 font-semibold dark:!bg-green-900/50 dark:!text-green-400':
                isFootballActive,
              'text-gray-800 hover:bg-green-50 hover:text-green-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200':
                !isFootballActive,
            }"
            @click="isFootballMenuOpen = !isFootballMenuOpen"
          >
            <svg-icon
              type="mdi"
              :path="mdiSoccer"
              class="w-4 h-4 mr-2 shrink-0"
            />
            <span class="text-[13px] font-medium truncate">{{ $t('navigation.football') }}</span>
            <div class="flex-grow" />
            <ChevronRightIcon
              class="w-4 h-4 ml-auto transition-transform duration-300 flex-shrink-0"
              :class="{ 'rotate-90': isFootballMenuOpen }"
            />
          </div>

          <div
            class="submenu-container border-l border-gray-200 dark:border-gray-700"
            :style="{ maxHeight: isFootballMenuOpen ? '700px' : '0px' }"
          >
            <div v-for="group in menuData" :key="group.title">
              <div
                class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md cursor-pointer transition-colors duration-200"
                :class="{
                  'bg-green-50 text-green-600 font-semibold dark:!bg-green-900/50 dark:!text-green-400':
                    isParentActive(group),
                  'hover:bg-green-50 hover:text-green-600 text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200':
                    !isParentActive(group),
                }"
                @click="toggleMenu(group)"
              >
                <span
                  class="text-[13px] font-medium truncate"
                  :title="group.title"
                  >{{ group.title }}</span
                >
                <ChevronRightIcon
                  class="w-4 h-4 ml-auto transition-transform duration-300 flex-shrink-0"
                  :class="{ 'rotate-90': group.isOpen }"
                />
              </div>
              <div
                class="submenu-container border-l border-gray-200 dark:border-gray-700"
                :style="{ maxHeight: group.isOpen ? '500px' : '0px' }"
              >
                <NuxtLink
                  v-for="league in group.children"
                  :key="league.id"
                  :to="league.path"
                  class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md text-gray-500 hover:bg-green-50 hover:text-green-600 relative group dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                  active-class="!bg-green-50 !text-green-600 font-semibold dark:!bg-green-900/50 dark:!text-green-400"
                >
                  <img
                    v-if="league.logo"
                    :src="league.logo"
                    alt="League Logo"
                    class="w-4 h-4 mr-2 flex-shrink-0"
                  >
                  <span class="text-[13px] truncate">{{ league.title }}</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>

    <div class="shrink-0 pt-4 mt-auto">
      <hr class="my-6 border-t border-gray-200 dark:border-gray-700" >
      <LanguageSwitcher class="mb-1.5 w-full" />
      <button
        class="flex items-center w-full px-2 py-1 mb-1.5 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        @click="toggleTheme"
      >
        <SunIcon v-if="theme === 'dark'" class="w-4 h-4 mr-2 shrink-0" />
        <MoonIcon v-else class="w-4 h-4 mr-2 shrink-0" />

        <span class="text-[13px] font-medium truncate">
          {{ themeButtonText }}
        </span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import {
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
  PlusCircleIcon,
  QueueListIcon,
  TrophyIcon,
} from "@heroicons/vue/24/outline";
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiSoccer } from "@mdi/js";

const { theme, setTheme } = useTheme();
const { t, locale } = useI18n();
const route = useRoute();
const stores = useStores();

const isFootballMenuOpen = ref(false);
const menuData = ref([]);

onMounted(async () => {
  await stores.championships.fetchAllChampionships();
  buildMenuData();
  updateMenuStateFromRoute(route.path);
});

watch(
  () => route.path,
  (newPath) => {
    updateMenuStateFromRoute(newPath);
  }
);

const updateMenuStateFromRoute = (currentPath) => {
  if (!currentPath.startsWith("/championship/")) {
    isFootballMenuOpen.value = false;
    menuData.value.forEach((group) => (group.isOpen = false));
    return;
  }

  isFootballMenuOpen.value = true;

  menuData.value.forEach((group) => {
    const isChildActive = group.children.some(
      (child) => child.path === currentPath
    );
    group.isOpen = isChildActive;
  });
};

const toggleMenu = (clickedItem) => {
  const wasOpen = clickedItem.isOpen;

  menuData.value.forEach((item) => {
    if (item !== clickedItem) {
      item.isOpen = false;
    }
  });

  clickedItem.isOpen = !wasOpen;
};

const isParentActive = (parentItem) => {
  return parentItem.children.some((child) => child.path === route.path);
};

const isFootballActive = computed(() => {
  return route.path.startsWith("/championship/");
});

const emit = defineEmits(["navigate"]);
const handleNavigation = (event) => {
  if (event.target.closest("a")) {
    emit("navigate");
  }
};

const buildMenuData = () => {
  const data = {};
  const getContinent = (slug) => {
    if (slug.startsWith("conmebol.")) return locale.value === 'en' ? "South America" : "América do Sul";
    if (slug.startsWith("uefa.")) return locale.value === 'en' ? "International" : "Internacional";
    if (slug.startsWith("bra.")) return locale.value === 'en' ? "Brazil" : "Brasil";
    if (slug.startsWith("eng.")) return locale.value === 'en' ? "England" : "Inglaterra";
    if (slug.startsWith("esp.")) return locale.value === 'en' ? "Spain" : "Espanha";
    if (slug.startsWith("ita.")) return locale.value === 'en' ? "Italy" : "Itália";
    if (slug.startsWith("ger.")) return locale.value === 'en' ? "Germany" : "Alemanha";
    if (slug.startsWith("fra.")) return locale.value === 'en' ? "France" : "França";
    return locale.value === 'en' ? "Other" : "Outros";
  };

  const sortedChampionships = [...stores.championships.allChampionships].sort(
    (a, b) => a.name.localeCompare(b.name)
  );

  sortedChampionships.forEach((champ) => {
    const continentName = getContinent(champ.apiEspnSlug);
    if (!data[continentName]) {
      data[continentName] = {
        title: continentName,
        isOpen: false,
        children: [],
      };
    }
    data[continentName].children.push({
      id: champ.id,
      title: champ.name,
      path: `/championship/${champ.id}`,
      logo: champ.logoUrl,
    });
  });

  menuData.value = Object.values(data).sort((a, b) =>
    a.title.localeCompare(b.title)
  );
};

watch(locale, buildMenuData);

const toggleTheme = () => {
  setTheme(theme.value === "dark" ? "light" : "dark");
};

const themeButtonText = computed(() => {
  return theme.value === "dark" ? t('navigation.lightTheme') : t('navigation.darkTheme');
});
</script>

<style scoped>
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
</style>
