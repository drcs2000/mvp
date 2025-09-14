<template>
  <aside class="flex flex-col h-full gap-6">
    <div class="sticky top-0 z-10 pt-1 bg-white">
      <div v-if="stores.auth.isAuthenticated && stores.auth.currentUser">
        <Menu as="div" class="relative" v-slot="{ open }">
          <MenuButton
            class="flex items-center w-full px-2 py-1 transition-colors duration-200 border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
          >
            <img
              class="w-6 h-6 rounded-full"
              src="https://i.pravatar.cc/28"
              :alt="stores.auth.currentUser.name"
            />
            <span class="ml-2 text-[13px] font-medium text-gray-800"
              >Olá, {{ firstName }}</span
            >
            <div class="flex-grow"></div>
            <ChevronDownIcon
              class="w-4 h-4 text-gray-500 transition-transform duration-300"
              :class="{ 'rotate-180': open }"
            />
          </MenuButton>

          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <MenuItems
              class="absolute right-0 w-full mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none"
            >
              <div class="px-1 py-1">
                <MenuItem v-slot="{ active }">
                  <NuxtLink
                    to="/profile"
                    :class="[
                      active ? 'bg-gray-100' : '',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700',
                    ]"
                  >
                    <UserCircleIcon class="w-5 h-5 mr-2 text-gray-400" />
                    Meu Perfil
                  </NuxtLink>
                </MenuItem>
              </div>
              <div class="px-1 py-1">
                <MenuItem v-slot="{ active }">
                  <button
                    @click="handleLogout"
                    :class="[
                      active ? 'bg-gray-100' : '',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700',
                    ]"
                  >
                    <ArrowRightOnRectangleIcon
                      class="w-5 h-5 mr-2 text-gray-400"
                    />
                    Logout
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </transition>
        </Menu>
      </div>

      <div v-else>
        <NuxtLink
          to="/login"
          class="flex items-center justify-center w-full px-2 py-1 font-semibold text-white transition-colors duration-200 bg-gray-800 border border-transparent rounded-md text-[13px] hover:bg-gray-900"
        >
          Entrar
        </NuxtLink>
      </div>
      <hr class="mt-4 border-t border-gray-200" />
    </div>

    <div class="p-4 border border-gray-200 rounded-lg">
      <h3 class="text-base font-semibold text-gray-800">Your place</h3>
    </div>
  </aside>
</template>

<script setup>
import { computed } from "vue";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import {
  ChevronDownIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/vue/24/outline";

const stores = useStores();

const firstName = computed(() => {
  if (stores.auth.currentUser && stores.auth.currentUser.name) {
    return stores.auth.currentUser.name.split(" ")[0];
  }
  return "";
});

const handleLogout = async () => {
  await stores.auth.logout();
};
</script>
