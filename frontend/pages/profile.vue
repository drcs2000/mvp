<template>
  <div class="bg-gray-50 min-h-screen">
    <div
      v-if="isLoading && !myProfile"
      class="flex items-center justify-center h-screen"
    >
      <div class="text-center text-gray-500">
        <svg
          class="animate-spin h-8 w-8 text-gray-400 mx-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p class="mt-4">Carregando seu perfil...</p>
      </div>
    </div>

    <div v-else-if="myProfile">
      <header
        class="sticky top-0 z-30 bg-gray-50/80 backdrop-blur-sm border-b border-gray-200"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            class="flex flex-col md:flex-row items-center justify-between gap-4 py-4"
          >
            <div class="flex items-center space-x-4">
              <div
                class="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-200 flex items-center justify-center shrink-0 ring-4 ring-white shadow"
              >
                <span class="text-xl md:text-2xl font-bold text-gray-600">{{
                  userInitials
                }}</span>
              </div>
              <div>
                <h1 class="text-xl md:text-2xl font-bold text-gray-900">
                  {{ myProfile.name }}
                </h1>
                <p class="text-sm text-gray-500 hidden sm:block">
                  Membro desde {{ formatDate(myProfile.createdAt) }}
                </p>
              </div>
            </div>
            <dl class="grid grid-cols-3 gap-3 sm:gap-5 text-center">
              <div
                class="px-3 py-2 bg-white/60 rounded-lg border border-gray-200/80"
              >
                <dt class="text-xs font-medium text-gray-500">Bolões</dt>
                <dd class="mt-1 text-lg md:text-xl font-semibold text-gray-900">
                  {{ myProfile.stats.totalPools }}
                </dd>
              </div>
              <div
                class="px-3 py-2 bg-white/60 rounded-lg border border-gray-200/80"
              >
                <dt class="text-xs font-medium text-gray-500">Palpites</dt>
                <dd class="mt-1 text-lg md:text-xl font-semibold text-gray-900">
                  {{ myProfile.stats.totalBets }}
                </dd>
              </div>
              <div
                class="px-3 py-2 bg-white/60 rounded-lg border border-gray-200/80"
              >
                <dt class="text-xs font-medium text-gray-500">Pontos</dt>
                <dd class="mt-1 text-lg md:text-xl font-semibold text-blue-600">
                  {{ myProfile.stats.totalPoints }}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav class="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              @click="activeTab = 'pools'"
              :class="[
                activeTab === 'pools'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors',
              ]"
            >
              Meus Bolões
            </button>
            <button
              @click="activeTab = 'invitations'"
              :class="[
                activeTab === 'invitations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors',
              ]"
            >
              Convites
            </button>
            <button
              @click="activeTab = 'settings'"
              :class="[
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors',
              ]"
            >
              Informações Pessoais
            </button>
          </nav>
        </div>
      </header>

      <main class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div v-show="activeTab === 'pools'" class="space-y-4">
          <div
            v-if="myProfile.pools.length === 0"
            class="text-center py-16 text-gray-500 bg-white rounded-xl shadow-sm"
          >
            <p>Você ainda não participa de nenhum bolão.</p>
          </div>
          <Disclosure
            v-for="pool in myProfile.pools"
            :key="pool.id"
            as="div"
            class="transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-sm"
            v-slot="{ open }"
          >
            <DisclosureButton class="w-full p-4 text-left focus:outline-none">
              <div class="flex items-center justify-between">
                <span
                  class="text-sm font-semibold text-gray-800 truncate pr-4"
                  >{{ pool.name }}</span
                >
                <ChevronDownIcon
                  :class="open ? 'rotate-180' : ''"
                  class="h-5 w-5 text-gray-400 transition-transform shrink-0"
                />
              </div>
            </DisclosureButton>
            <DisclosurePanel class="border-t border-gray-200 bg-gray-50/70">
              <div class="px-4 py-5 sm:px-6">
                <div
                  v-if="pool.bets.length === 0"
                  class="py-8 text-center text-sm text-gray-500"
                >
                  Nenhum palpite feito neste bolão.
                </div>
                <div v-else>
                  <div class="space-y-4">
                    <div
                      v-for="(bet, index) in getPaginatedBets(pool.id)"
                      :key="index"
                      class="p-4 bg-white rounded-lg border border-gray-200"
                    >
                      <div class="flex justify-between items-start">
                        <div class="flex-1">
                          <p
                            class="font-semibold text-gray-800 text-sm truncate"
                          >
                            {{ bet.matchDescription }}
                          </p>
                          <p class="text-xs text-gray-500">
                            {{ formatDate(bet.matchDate, true) }}
                          </p>
                        </div>
                        <div class="ml-4 text-right shrink-0">
                          <p class="text-xs text-gray-400">Pontos</p>
                          <p
                            class="font-bold text-lg"
                            :class="
                              bet.pointsEarned > 0
                                ? 'text-green-600'
                                : 'text-gray-500'
                            "
                          >
                            {{ bet.pointsEarned ?? "-" }}
                          </p>
                        </div>
                      </div>
                      <div
                        class="mt-3 flex items-stretch gap-3 sm:gap-4 text-center"
                      >
                        <div class="flex-1 p-2 bg-gray-100 rounded-md">
                          <p class="text-xs font-semibold text-gray-500">
                            Seu Palpite
                          </p>
                          <p class="font-mono text-xl font-bold text-gray-800">
                            {{ bet.betPlaced }}
                          </p>
                        </div>
                        <div
                          class="flex-1 p-2 bg-blue-50 border border-blue-200 rounded-md"
                        >
                          <p class="text-xs font-semibold text-blue-800">
                            Resultado Final
                          </p>
                          <p class="font-mono text-xl font-bold text-blue-900">
                            {{ bet.result ?? "- : -" }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <nav
                    v-if="getTotalPages(pool.id) > 1"
                    class="flex items-center justify-between pt-5 mt-4"
                  >
                    <button
                      @click="previousPage(pool.id)"
                      :disabled="getCurrentPage(pool.id) === 1"
                      class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon class="h-4 w-4" />Anterior
                    </button>
                    <div class="text-sm text-gray-600">
                      <span class="font-medium">{{
                        getCurrentPage(pool.id)
                      }}</span>
                      /
                      <span class="font-medium">{{
                        getTotalPages(pool.id)
                      }}</span>
                    </div>
                    <button
                      @click="nextPage(pool.id)"
                      :disabled="
                        getCurrentPage(pool.id) === getTotalPages(pool.id)
                      "
                      class="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próximo<ChevronRightIcon class="h-4 w-4" />
                    </button>
                  </nav>
                </div>
              </div>
              <div
                class="px-4 py-3 sm:px-6 bg-gray-100/60 border-t border-gray-200"
              >
                <NuxtLink
                  :to="`/pools/${pool.id}`"
                  class="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors w-full flex items-center justify-center gap-2"
                  >Ver bolão completo <ArrowRightIcon class="h-4 w-4"
                /></NuxtLink>
              </div>
            </DisclosurePanel>
          </Disclosure>
        </div>

        <div v-show="activeTab === 'invitations'" class="space-y-4">
          <Disclosure
            as="div"
            class="transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-sm"
            v-slot="{ open }"
            :default-open="true"
          >
            <DisclosureButton class="w-full p-4 text-left focus:outline-none">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-x-3">
                  <span class="text-sm font-semibold text-gray-800"
                    >Convites Recebidos</span
                  >
                  <span
                    v-if="
                      myProfile.invitations.received.filter(
                        (inv) => inv.status === 'pending'
                      ).length > 0
                    "
                    class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                  >
                    {{
                      myProfile.invitations.received.filter(
                        (inv) => inv.status === "pending"
                      ).length
                    }}
                    pendente(s)
                  </span>
                </div>
                <ChevronDownIcon
                  :class="open ? 'rotate-180' : ''"
                  class="h-5 w-5 text-gray-400 transition-transform shrink-0"
                />
              </div>
            </DisclosureButton>
            <DisclosurePanel class="border-t border-gray-200 bg-gray-50/70">
              <div class="px-4 py-5 sm:px-6">
                <div
                  v-if="myProfile.invitations.received.length === 0"
                  class="py-8 text-center text-sm text-gray-500"
                >
                  Você não tem convites.
                </div>
                <div v-else class="flow-root">
                  <ul class="-my-4 divide-y divide-gray-200">
                    <li
                      v-for="inv in myProfile.invitations.received"
                      :key="inv.id"
                      class="flex items-center justify-between py-4 gap-4"
                    >
                      <div class="flex items-center min-w-0">
                        <div
                          class="flex-shrink-0 bg-white rounded-full p-2 border"
                        >
                          <ArrowDownTrayIcon class="h-5 w-5 text-gray-500" />
                        </div>
                        <p class="ml-4 text-sm text-gray-600 truncate">
                          <span class="font-semibold text-gray-800">{{
                            inv.relatedUserName
                          }}</span>
                          te convidou para
                          <span class="font-semibold text-gray-800">{{
                            inv.poolName
                          }}</span>
                        </p>
                      </div>
                      <div
                        v-if="inv.status === 'pending'"
                        class="flex items-center gap-2 shrink-0"
                      >
                        <button
                          type="button"
                          class="p-2 rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                        >
                          <span class="sr-only">Recusar</span>
                          <XMarkIcon class="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          class="p-2 rounded-full text-green-600 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                        >
                          <span class="sr-only">Aceitar</span>
                          <CheckIcon class="h-5 w-5" />
                        </button>
                      </div>
                      <div v-else class="shrink-0">
                        <span
                          class="text-xs font-medium px-2.5 py-1 rounded-full"
                          :class="getInvitationStatusClass(inv.status)"
                        >
                          {{
                            inv.status.charAt(0).toUpperCase() +
                            inv.status.slice(1)
                          }}
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </DisclosurePanel>
          </Disclosure>

          <Disclosure
            as="div"
            class="transition-all duration-200 bg-white border border-gray-200 rounded-lg shadow-sm"
            v-slot="{ open }"
          >
            <DisclosureButton class="w-full p-4 text-left focus:outline-none">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-x-3">
                  <span class="text-sm font-semibold text-gray-800"
                    >Convites Enviados</span
                  >
                  <span
                    v-if="myProfile.invitations.sent.length > 0"
                    class="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
                  >
                    {{ myProfile.invitations.sent.length }}
                  </span>
                </div>
                <ChevronDownIcon
                  :class="open ? 'rotate-180' : ''"
                  class="h-5 w-5 text-gray-400 transition-transform shrink-0"
                />
              </div>
            </DisclosureButton>
            <DisclosurePanel class="border-t border-gray-200 bg-gray-50/70">
              <div class="px-4 py-5 sm:px-6">
                <div
                  v-if="myProfile.invitations.sent.length === 0"
                  class="py-8 text-center text-sm text-gray-500"
                >
                  Você não enviou nenhum convite.
                </div>
                <div v-else class="flow-root">
                  <ul class="-my-4 divide-y divide-gray-200">
                    <li
                      v-for="inv in myProfile.invitations.sent"
                      :key="inv.id"
                      class="flex items-center justify-between py-4 gap-4"
                    >
                      <div class="flex items-center min-w-0">
                        <div
                          class="flex-shrink-0 bg-white rounded-full p-2 border"
                        >
                          <PaperAirplaneIcon class="h-5 w-5 text-gray-500" />
                        </div>
                        <p class="ml-4 text-sm text-gray-600 truncate">
                          Convite para
                          <span class="font-semibold text-gray-800">{{
                            inv.relatedUserName
                          }}</span>
                          no bolão
                          <span class="font-semibold text-gray-800">{{
                            inv.poolName
                          }}</span>
                        </p>
                      </div>
                      <div class="shrink-0">
                        <span
                          class="text-xs font-medium px-2.5 py-1 rounded-full"
                          :class="getInvitationStatusClass(inv.status)"
                        >
                          {{
                            inv.status.charAt(0).toUpperCase() +
                            inv.status.slice(1)
                          }}
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div
                class="px-4 py-3 sm:px-6 bg-gray-100/60 border-t border-gray-200"
              >
                <button
                  @click="openInvitationsModal"
                  type="button"
                  class="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors w-full flex items-center justify-center gap-2"
                >
                  <PlusIcon class="h-4 w-4" />
                  Enviar Novo Convite
                </button>
              </div>
            </DisclosurePanel>
          </Disclosure>
        </div>

        <div v-show="activeTab === 'settings'">
          <form @submit.prevent="handleUpdateProfile" class="space-y-8">
            <div
              class="bg-white shadow-sm rounded-xl p-4 sm:p-6 border border-gray-200"
            >
              <h3 class="text-lg font-semibold text-gray-900">
                Informações de Perfil
              </h3>
              <p class="mt-1 text-sm text-gray-500">
                Suas informações públicas e de acesso.
              </p>
              <div class="mt-6 space-y-5">
                <div class="relative">
                  <label for="name" class="sr-only">Nome</label>
                  <UserIcon
                    class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  />
                  <input
                    type="text"
                    v-model="form.name"
                    id="name"
                    placeholder="Seu nome completo"
                    class="block w-full pl-10 pr-3 py-3 text-sm placeholder-gray-400 border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 transition-colors"
                  />
                </div>
                <div class="relative">
                  <label for="email" class="sr-only">Email</label>
                  <EnvelopeIcon
                    class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  />
                  <input
                    type="email"
                    v-model="form.email"
                    id="email"
                    placeholder="seu@email.com"
                    class="block w-full pl-10 pr-3 py-3 text-sm placeholder-gray-400 border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 transition-colors"
                  />
                </div>
              </div>
            </div>
            <div
              class="bg-white shadow-sm rounded-xl p-4 sm:p-6 border border-gray-200"
            >
              <h3 class="text-lg font-semibold text-gray-900">Alterar Senha</h3>
              <p class="mt-1 text-sm text-gray-500">
                Deixe os campos em branco para manter a senha atual.
              </p>
              <div class="mt-6 space-y-5">
                <div class="relative">
                  <label for="current_password" class="sr-only"
                    >Senha Atual</label
                  >
                  <LockClosedIcon
                    class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  />
                  <input
                    type="password"
                    v-model="form.currentPassword"
                    id="current_password"
                    placeholder="Senha Atual"
                    autocomplete="current-password"
                    class="block w-full pl-10 pr-3 py-3 text-sm placeholder-gray-400 border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 transition-colors"
                  />
                </div>
                <div class="relative">
                  <label for="new_password" class="sr-only">Nova Senha</label>
                  <KeyIcon
                    class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  />
                  <input
                    type="password"
                    v-model="form.newPassword"
                    id="new_password"
                    placeholder="Nova Senha"
                    autocomplete="new-password"
                    class="block w-full pl-10 pr-3 py-3 text-sm placeholder-gray-400 border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 transition-colors"
                  />
                </div>
                <div class="relative">
                  <label for="confirm_password" class="sr-only"
                    >Confirmar Nova Senha</label
                  >
                  <KeyIcon
                    class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  />
                  <input
                    type="password"
                    v-model="form.confirmPassword"
                    id="confirm_password"
                    placeholder="Confirmar Nova Senha"
                    autocomplete="new-password"
                    class="block w-full pl-10 pr-3 py-3 text-sm placeholder-gray-400 border border-gray-300 rounded-lg shadow-sm appearance-none focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div class="mt-8 flex justify-end">
              <button
                type="submit"
                disabled
                class="inline-flex items-center justify-center rounded-lg bg-gray-800 py-3 px-6 text-sm font-semibold text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  v-if="isLoading"
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span v-if="isLoading">Salvando...</span>
                <span v-else>Salvar Alterações</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  </div>
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
import { ref, computed, onMounted, watch } from "vue";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  KeyIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import InvitationsModal from "~/components/InvitationsModal.vue";

const stores = useStores();

const activeTab = ref("pools");
const betsPerPage = 5;
const currentPageByPool = ref({});
const form = ref({
  name: "",
  email: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const myProfile = computed(() => stores.users.myProfile);
const isLoading = computed(() => stores.users.isLoading);
const pendingInvitations = computed(() => []);

const isAdmin = computed(() => false);
const showInvitationsModal = ref(false);

const openInvitationsModal = async () => {
  showInvitationsModal.value = true;
};
const acceptInvitation = () => {};
const declineInvitation = () => {};

onMounted(() => {
  stores.users.fetchMyProfile();
});

watch(
  myProfile,
  (newProfile) => {
    if (newProfile) {
      form.value.name = newProfile.name;
      form.value.email = newProfile.email;
      form.value.currentPassword = "";
      form.value.newPassword = "";
      form.value.confirmPassword = "";
    }
  },
  { immediate: true }
);

const handleUpdateProfile = async () => {
  if (
    form.value.newPassword &&
    form.value.newPassword !== form.value.confirmPassword
  ) {
    stores.ui.showToast("As novas senhas não correspondem.", "error");
    return;
  }

  const payload = {
    name: form.value.name,
    email: form.value.email,
  };

  if (form.value.newPassword && form.value.currentPassword) {
    payload.newPassword = form.value.newPassword;
    payload.currentPassword = form.value.currentPassword;
  } else if (form.value.newPassword || form.value.currentPassword) {
    stores.ui.showToast(
      "Para alterar a senha, você precisa fornecer a senha atual e a nova senha.",
      "error"
    );
    return;
  }

  const result = await stores.users.updateMyProfile(payload);

  if (result.success) {
    stores.ui.showToast("Perfil atualizado com sucesso!", "success");
  } else {
    stores.ui.showToast(result.error || "Falha ao atualizar o perfil", "error");
  }
};

const userInitials = computed(() => {
  if (!myProfile.value?.name) return "";
  const names = myProfile.value.name.trim().split(" ");
  if (names.length > 1) {
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(
      0
    )}`.toUpperCase();
  }
  return names[0].charAt(0).toUpperCase();
});

const getCurrentPage = (poolId) => currentPageByPool.value[poolId] || 1;
const getTotalPages = (poolId) => {
  const pool = myProfile.value.pools.find((p) => p.id === poolId);
  return pool ? Math.ceil(pool.bets.length / betsPerPage) : 0;
};
const getPaginatedBets = (poolId) => {
  const pool = myProfile.value.pools.find((p) => p.id === poolId);
  if (!pool) return [];
  const page = getCurrentPage(poolId);
  const start = (page - 1) * betsPerPage;
  const end = start + betsPerPage;
  return pool.bets.slice(start, end);
};
const nextPage = (poolId) => {
  if (getCurrentPage(poolId) < getTotalPages(poolId)) {
    currentPageByPool.value[poolId] =
      (currentPageByPool.value[poolId] || 1) + 1;
  }
};
const previousPage = (poolId) => {
  if (getCurrentPage(poolId) > 1) {
    currentPageByPool.value[poolId] -= 1;
  }
};

const formatDate = (dateString, withTime = false) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: withTime ? "2-digit" : undefined,
    minute: withTime ? "2-digit" : undefined,
  };
  return new Date(dateString).toLocaleDateString("pt-BR", options);
};

const getInvitationStatusClass = (status) => {
  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    declined: "bg-red-100 text-red-800",
    expired: "bg-gray-100 text-gray-800",
    canceled: "bg-gray-100 text-gray-800",
  };
  return statusClasses[status] || "bg-gray-100 text-gray-800";
};
</script>
