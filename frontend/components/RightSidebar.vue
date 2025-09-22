<template>
  <aside class="flex flex-col h-full gap-6">
    <div class="sticky top-0 z-10 pt-1 bg-white shrink-0">
      <div v-if="stores.auth.isAuthenticated && stores.auth.currentUser">
        <Menu v-slot="{ open }" as="div" class="relative">
          <MenuButton
            class="flex items-center w-full px-2 py-1 transition-colors duration-200 border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
          >
            <div class="flex-shrink-0">
              <span
                class="flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full"
                :class="[
                  invitationCount > 0
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-600',
                ]"
              >
                {{ invitationCount }}
              </span>
            </div>

            <span class="ml-2 text-[13px] font-medium text-gray-800"
              >Olá, {{ firstName }}</span
            >
            <div class="flex-grow" />
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
                <MenuItem v-slot="{ active }">
                  <button
                    :class="[
                      active ? 'bg-gray-100' : '',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700 relative',
                    ]"
                    @click="openInvitationsModal"
                  >
                    <EnvelopeIcon class="w-5 h-5 mr-2 text-gray-400" />
                    Convites
                    <span
                      v-if="invitationCount > 0"
                      class="absolute right-2 flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full"
                    >
                      {{ invitationCount }}
                    </span>
                  </button>
                </MenuItem>
              </div>
              <div class="px-1 py-1">
                <MenuItem v-slot="{ active }">
                  <button
                    :class="[
                      active ? 'bg-gray-100' : '',
                      'group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-700',
                    ]"
                    @click="handleLogout"
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
      <hr class="mt-4 border-t border-gray-200" >
    </div>

    <div
      class="flex flex-col flex-1 p-3 overflow-hidden border border-gray-200 rounded-lg"
    >
      <div v-if="selectedChampionship" class="flex flex-col flex-1 min-h-0">
        <div class="shrink-0">
          <h3 class="mb-3 text-sm font-semibold text-gray-800">
            {{ selectedChampionship.name }}
          </h3>
          <div
            class="grid grid-cols-12 gap-2 text-center text-gray-500 border-b border-gray-200 text-[9px] uppercase"
          >
            <div class="col-span-1 py-1 font-normal text-left">#</div>
            <div class="col-span-6 py-1 font-normal text-left">Time</div>
            <div class="col-span-1 py-1 font-normal">P</div>
            <div class="col-span-1 py-1 font-normal">J</div>
            <div class="col-span-1 py-1 font-normal">V</div>
            <div class="col-span-1 py-1 font-normal">E</div>
            <div class="col-span-1 py-1 font-normal">D</div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto no-scrollbar">
          <div
            v-if="stores.standings.isLoading"
            class="flex items-center justify-center h-full text-gray-500 text-[10px]"
          >
            Carregando...
          </div>
          <div v-else-if="stores.standings.standings.length > 0">
            <table class="w-full text-center table-fixed">
              <tbody class="text-gray-800">
                <tr
                  v-for="team in stores.standings.standings"
                  :key="team.teamApiId"
                  class="grid grid-cols-12 gap-2 items-center border-b border-gray-100 last:border-b-0 text-[9px]"
                  :class="getRowStyle(team.description)"
                >
                  <td class="col-span-1 py-2 font-medium text-left">
                    {{ team.rank }}
                  </td>
                  <td class="col-span-6 py-2 text-left truncate">
                    <div class="flex items-center">
                      <img :src="team.teamLogoUrl" class="w-4 h-4 mr-2" >
                      <span class="whitespace-nowrap">{{ team.teamName }}</span>
                    </div>
                  </td>
                  <td class="col-span-1 py-2 font-bold">{{ team.points }}</td>
                  <td class="col-span-1 py-2 text-gray-500">
                    {{ team.played }}
                  </td>
                  <td class="col-span-1 py-2 text-gray-500">{{ team.win }}</td>
                  <td class="col-span-1 py-2 text-gray-500">{{ team.draw }}</td>
                  <td class="col-span-1 py-2 text-gray-500">{{ team.lose }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            v-else
            class="flex items-center justify-center h-full text-gray-500 text-[10px]"
          >
            Classificação não disponível.
          </div>
        </div>

        <div
          v-if="stores.standings.standings.length > 0"
          class="pt-3 mt-auto border-t border-gray-100 shrink-0"
        >
          <div class="space-y-1">
            <div
              v-for="legend in rankLegends"
              :key="legend.label"
              class="flex items-center gap-2"
            >
              <span
                :class="getLegendIndicatorClass(legend.label)"
                class="block w-2 h-2 rounded-full"
              />
              <span class="text-gray-600 text-[9px]">{{ legend.label }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <h3 class="text-base font-semibold text-gray-800">Classificação</h3>
        <p class="mt-2 text-gray-500 text-[10px]">
          Selecione um campeonato para ver a tabela.
        </p>
      </div>
    </div>
  </aside>
  <Teleport to="body">
    <InvitationsModal
      v-if="showInvitationsModal"
      :is-open="showInvitationsModal"
      :invitations="pendingInvitations"
      :is-admin="isAdmin"
      @close="showInvitationsModal = false"
      @accept="acceptInvitation"
      @decline="declineInvitation"
    />
  </Teleport>
</template>

<script setup>
import { computed, watch, ref, onMounted } from "vue";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";
import {
  ChevronDownIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  EnvelopeIcon,
} from "@heroicons/vue/24/outline";
import InvitationsModal from "~/components/InvitationsModal.vue";

const stores = useStores();

const selectedChampionship = computed(
  () => stores.championships.selectedChampionship
);

const firstName = computed(() => {
  if (stores.auth.currentUser && stores.auth.currentUser.name) {
    return stores.auth.currentUser.name.split(" ")[0];
  }
  return "";
});

const showInvitationsModal = ref(false);
const pendingInvitations = computed(() => stores.invitations.invitations);
const invitationCount = computed(() => stores.invitations.invitationCount);

const isAdmin = computed(() => {
  const currentUserId = stores.auth.user?.id;

  if (!currentUserId || !stores.pools.myPools) {
    return false;
  }

  return stores.pools.myPools.some((pool) =>
    pool.participants.some(
      (participant) =>
        participant.userId === currentUserId && participant.role === "admin"
    )
  );
});

const handleLogout = async () => {
  await stores.auth.logout();
};

const openInvitationsModal = async () => {
  if (stores.invitations.invitations.length === 0) {
    await stores.invitations.fetchPendingInvitations();
  }
  showInvitationsModal.value = true;
};

const getRowStyle = (description) => {
  if (!description) return "";
  const desc = description.toLowerCase();

  if (desc.includes("champions league") || desc.includes("libertadores"))
    return "bg-blue-50";
  if (desc.includes("europa league") || desc.includes("sudamericana"))
    return "bg-green-50";
  if (desc.includes("conference league") || desc.includes("qualification"))
    return "bg-teal-50";
  if (desc.includes("relegation") || desc.includes("rebaixamento"))
    return "bg-red-50";

  return "";
};

const getLegendIndicatorClass = (description) => {
  if (!description) return "bg-gray-400";
  const desc = description.toLowerCase();

  if (desc.includes("champions league") || desc.includes("libertadores"))
    return "bg-blue-500";
  if (desc.includes("europa league") || desc.includes("sudamericana"))
    return "bg-green-500";
  if (desc.includes("conference league") || desc.includes("qualification"))
    return "bg-teal-500";
  if (desc.includes("relegation") || desc.includes("rebaixamento"))
    return "bg-red-500";

  return "bg-gray-400";
};

const rankLegends = computed(() => {
  if (!stores.standings.standings) return [];
  const legends = new Map();
  stores.standings.standings.forEach((team) => {
    if (team.description) {
      if (!legends.has(team.description)) {
        legends.set(team.description, { label: team.description });
      }
    }
  });
  return Array.from(legends.values());
});

watch(
  selectedChampionship,
  (newChampionship) => {
    if (newChampionship && newChampionship.apiFootballId) {
      stores.standings.fetchStandingsByChampionshipId(
        newChampionship.apiFootballId
      );
    }
  },
  { immediate: true }
);

// Buscar convites pendentes quando o componente for montado
onMounted(async () => {
  if (stores.auth.isAuthenticated) {
    await stores.invitations.fetchPendingInvitations();
  }
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
