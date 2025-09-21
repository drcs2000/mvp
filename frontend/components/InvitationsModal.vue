<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="closeModal">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex items-center justify-center min-h-full p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md p-5 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg"
              @click="handlePanelClick"
            >
              <TabGroup
                :selected-index="selectedIndex"
                @change="selectedIndex = $event"
              >
                <TabList class="flex border-b border-gray-100">
                  <Tab
                    v-for="category in ['Convites', 'Convidar']"
                    :key="category"
                    v-slot="{ selected }"
                    as="template"
                  >
                    <button
                      :class="[
                        'w-full py-3 text-sm font-medium leading-5 transition-colors duration-150',
                        'focus:outline-none -mb-px',
                        selected
                          ? 'text-gray-900 border-b-2 border-gray-800'
                          : 'text-gray-500 hover:text-gray-700',
                      ]"
                    >
                      {{ category }}
                    </button>
                  </Tab>
                </TabList>

                <TabPanels class="mt-4 h-80">
                  <TabPanel class="h-full flex flex-col focus:outline-none">
                    <DialogTitle
                      as="h3"
                      class="text-sm font-medium text-gray-900"
                    >
                      Convites Pendentes
                    </DialogTitle>
                    <div class="mt-3 flex-1 overflow-y-auto pr-1">
                      <div v-if="invitations.length > 0" class="space-y-3">
                        <div
                          v-for="invitation in invitations"
                          :key="invitation.id"
                          class="p-3 transition-colors border border-gray-100 rounded-lg hover:bg-gray-50"
                        >
                          <div class="flex items-start gap-3">
                            <div
                              class="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
                            >
                              <span class="text-sm font-medium text-gray-600">
                                {{ getInitials(invitation.inviter.name) }}
                              </span>
                            </div>
                            <div class="flex-1 min-w-0">
                              <p class="text-sm text-gray-900 font-medium">
                                {{ invitation.inviter.name }}
                              </p>
                              <p class="text-sm text-gray-600">
                                convidou você para o bolão:
                              </p>
                            </div>
                          </div>
                          <div class="flex items-end justify-between mt-3">
                            <div>
                              <p class="font-medium text-gray-800">
                                {{ invitation.pool.name }}
                              </p>
                              <p class="text-xs text-gray-500 mt-1">
                                Recebido em
                                {{ formatDate(invitation.createdAt) }}
                              </p>
                            </div>
                            <div class="flex justify-end space-x-2">
                              <button
                                class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                                @click="declineInvitation(invitation.id)"
                              >
                                Recusar
                              </button>
                              <button
                                class="px-3 py-1.5 text-xs font-medium text-white bg-gray-800 rounded hover:bg-gray-900 transition-colors"
                                @click="acceptInvitation(invitation.id)"
                              >
                                Aceitar
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        v-else
                        class="h-full flex flex-col items-center justify-center text-sm text-gray-500"
                      >
                        <div
                          class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-8 w-8 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <p>Nenhum convite pendente</p>
                      </div>
                    </div>
                  </TabPanel>

                  <TabPanel class="h-full flex flex-col focus:outline-none">
                    <DialogTitle
                      as="h3"
                      class="text-sm font-medium text-gray-900"
                    >
                      Convidar para um Bolão
                    </DialogTitle>
                    <div v-if="isAdmin" class="mt-3 flex-1">
                      <div class="space-y-4">
                        <div class="relative" @click.stop>
                          <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                            >Buscar Bolão</label
                          >
                          <input
                            v-model="poolSearch"
                            type="text"
                            placeholder="Digite para buscar bolões"
                            class="block w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                            @focus="showPoolSuggestions = true"
                          >
                          <div
                            v-if="showPoolSuggestions && filteredPools.length"
                            class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto custom-scrollbar"
                          >
                            <div
                              v-for="pool in filteredPools"
                              :key="pool.id"
                              class="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                              @mousedown="selectPool(pool)"
                            >
                              {{ pool.name }}
                            </div>
                          </div>
                        </div>

                        <div class="relative" @click.stop>
                          <label
                            class="block text-sm font-medium text-gray-700 mb-1"
                            >Buscar Usuário</label
                          >
                          <input
                            v-model="userSearch"
                            type="text"
                            placeholder="Digite nome ou e-mail do usuário"
                            class="block w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                            @focus="showUserSuggestions = true"
                          >
                          <div
                            v-if="showUserSuggestions && filteredUsers.length"
                            class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto custom-scrollbar"
                          >
                            <div
                              v-for="user in filteredUsers"
                              :key="user.id"
                              class="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                              @mousedown="selectUser(user)"
                            >
                              {{ user.name }} ({{ user.email }})
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabPanel>
                </TabPanels>
              </TabGroup>

              <div class="mt-4 pt-4 border-t border-gray-100">
                <div class="flex justify-end space-x-3">
                  <button
                    type="button"
                    class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors focus:outline-none"
                    @click="closeModal"
                  >
                    Fechar
                  </button>
                  <button
                    v-if="selectedIndex === 1"
                    type="button"
                    class="px-4 py-2.5 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-900 transition-colors focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed"
                    :disabled="!selectedPool || !selectedUser"
                    @click="handleCreateInvitation"
                  >
                    Enviar Convite
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
// ... (imports e props como antes)
import { ref, computed, onMounted, watch } from "vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@headlessui/vue";

const stores = useStores();

defineProps({
  isOpen: Boolean,
  invitations: Array,
  isAdmin: Boolean,
});

const emit = defineEmits(["close"]);
const selectedIndex = ref(0);
const poolSearch = ref("");
const userSearch = ref("");
const selectedPool = ref(null);
const selectedUser = ref(null);
const showPoolSuggestions = ref(false);
const showUserSuggestions = ref(false);

const handlePanelClick = () => {
  showPoolSuggestions.value = false;
  showUserSuggestions.value = false;
};

const adminPools = computed(() => {
  if (stores.pools && stores.pools.myPools && stores.auth.user) {
    return stores.pools.myPools.filter((pool) =>
      pool.participants.some(
        (p) => p.userId === stores.auth.user.id && p.role === "admin"
      )
    );
  }
  return [];
});

const allUsers = computed(() => {
  if (!stores.users?.users || !stores.auth.user) return [];
  return stores.users.users.filter((user) => user.id !== stores.auth.user.id);
});

const filteredPools = computed(() => {
  if (!poolSearch.value) return adminPools.value;
  const searchTerm = poolSearch.value.toLowerCase();
  return adminPools.value.filter((pool) =>
    pool.name.toLowerCase().includes(searchTerm)
  );
});

const filteredUsers = computed(() => {
  if (!userSearch.value) return allUsers.value;
  const searchTerm = userSearch.value.toLowerCase();
  return allUsers.value.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
  );
});

const selectPool = (pool) => {
  selectedPool.value = pool;
  poolSearch.value = pool.name;
  showPoolSuggestions.value = false;
};

const selectUser = (user) => {
  selectedUser.value = user;
  userSearch.value = `${user.name}`;
  showUserSuggestions.value = false;
};

const resetInviteForm = () => {
  selectedPool.value = null;
  selectedUser.value = null;
  poolSearch.value = "";
  userSearch.value = "";
};

watch(selectedIndex, (newIndex) => {
  if (newIndex !== 1) {
    resetInviteForm();
  }
});

onMounted(() => {
  if (stores.pools.myPools.length === 0) {
    stores.pools.fetchMyPools();
  }
  stores.users.fetchAllUsers();
});

const closeModal = () => {
  resetInviteForm();
  emit("close");
};

const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

const formatDate = (dateString) => {
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  return new Date(dateString).toLocaleDateString("pt-BR", options);
};

async function acceptInvitation(invitationId) {
  const result = await stores.invitations.acceptInvitation(invitationId);
  if (result.success) {
    stores.ui.showToast("Convite aceito com sucesso!", "success");
    await stores.pools.fetchMyPools();
  } else {
    stores.ui.showToast(result.error || "Erro ao aceitar o convite.", "error");
  }
}

async function declineInvitation(invitationId) {
  const result = await stores.invitations.declineInvitation(invitationId);
  if (result.success) {
    stores.ui.showToast("Convite recusado.", "success");
  } else {
    stores.ui.showToast(result.error || "Erro ao recusar o convite.", "error");
  }
}

async function handleCreateInvitation() {
  if (!selectedPool.value || !selectedUser.value) {
    stores.ui.showToast("Por favor, selecione um bolão e um usuário.", "error");
    return;
  }

  const result = await stores.invitations.createInvitation({
    poolId: selectedPool.value.id,
    inviteeId: selectedUser.value.id,
  });

  if (result.success) {
    stores.ui.showToast("Convite enviado com sucesso!", "success");
    resetInviteForm();
  } else {
    stores.ui.showToast(result.error || "Não foi possível enviar o convite.", "error");
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}
</style>
