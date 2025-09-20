<template>
  <div class="pb-28 sm:pb-0">
    <transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform opacity-0 -translate-y-full"
      enter-to-class="transform opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform opacity-100 translate-y-0"
      leave-to-class="transform opacity-0 -translate-y-full"
    >
      <div
        v-if="notification.show"
        class="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 mt-5"
      >
        <div
          class="flex items-center p-4 mx-4 rounded-lg shadow-lg"
          :class="{
            'bg-red-100 border border-red-300': notification.type === 'error',
            'bg-green-100 border border-green-300':
              notification.type === 'success',
          }"
        >
          <XCircleIcon
            v-if="notification.type === 'error'"
            class="w-6 h-6 mr-3 text-red-600 shrink-0"
          />
          <CheckCircleIcon
            v-else
            class="w-6 h-6 mr-3 text-green-600 shrink-0"
          />
          <p
            class="text-[13px] font-medium"
            :class="{
              'text-red-800': notification.type === 'error',
              'text-green-800': notification.type === 'success',
            }"
          >
            {{ notification.message }}
          </p>
        </div>
      </div>
    </transition>

    <header
      class="sticky top-0 z-10 p-4 bg-white/80 sm:p-6 backdrop-blur-sm border-b border-gray-200"
    >
      <div class="max-w-3xl">
        <h1 class="text-2xl font-bold text-gray-900">Criar Novo Bolão</h1>
        <p class="mt-1 text-sm text-gray-500">
          Preencha os detalhes abaixo para configurar seu novo bolão.
        </p>
      </div>
    </header>

    <main class="p-4 sm:p-6">
      <form
        id="tournament-form"
        class="space-y-8"
        @submit.prevent="handleSubmit"
      >
        <div class="p-6 bg-white border border-gray-200 rounded-lg">
          <h2 class="text-base font-semibold leading-7 text-gray-900">
            Informações Gerais
          </h2>
          <div class="grid grid-cols-1 mt-6 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
            <div class="sm:col-span-2">
              <label
                for="tournament-name"
                class="block text-sm font-medium text-gray-700"
                >Nome do torneio</label
              >
              <input
                id="tournament-name"
                v-model="form.name"
                type="text"
                required
                class="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-gray-800 focus:border-gray-800 sm:text-sm"
              >
            </div>

            <div>
              <label
                for="max-participants"
                class="block text-sm font-medium text-gray-700"
                >Máx. de participantes</label
              >
              <input
                id="max-participants"
                v-model.number="form.maxParticipants"
                type="number"
                required
                min="2"
                class="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-gray-800 focus:border-gray-800 sm:text-sm"
              >
            </div>

            <div>
              <Listbox v-model="form.betDeadlineHours" as="div">
                <ListboxLabel class="block text-sm font-medium text-gray-700"
                  >Prazo para palpites</ListboxLabel
                >
                <div class="relative mt-1">
                  <ListboxButton
                    class="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-md shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 sm:text-sm"
                  >
                    <span class="block truncate"
                      >Até {{ form.betDeadlineHours }} hora(s) antes</span
                    >
                    <span
                      class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
                    >
                      <ChevronUpDownIcon
                        class="w-5 h-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </ListboxButton>
                  <transition
                    leave-active-class="transition duration-100 ease-in"
                    leave-from-class="opacity-100"
                    leave-to-class="opacity-0"
                  >
                    <ListboxOptions
                      class="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                    >
                      <ListboxOption
                        v-for="hour in deadlineOptions"
                        :key="hour"
                        v-slot="{ active, selected }"
                        :value="hour"
                      >
                        <li
                          :class="[
                            active ? 'bg-gray-100' : '',
                            'relative cursor-default select-none py-2 pl-10 pr-4',
                          ]"
                        >
                          <span
                            :class="[
                              selected ? 'font-semibold' : 'font-normal',
                              'block truncate',
                            ]"
                            >Até {{ hour }} hora(s) antes</span
                          >
                          <span
                            v-if="selected"
                            class="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600"
                          >
                            <CheckIcon class="w-5 h-5" aria-hidden="true" />
                          </span>
                        </li>
                      </ListboxOption>
                    </ListboxOptions>
                  </transition>
                </div>
              </Listbox>
            </div>

            <div class="sm:col-span-2">
              <Listbox v-model="form.baseChampionship" as="div">
                <ListboxLabel class="block text-sm font-medium text-gray-700"
                  >Campeonato base</ListboxLabel
                >
                <div class="relative mt-1">
                  <ListboxButton
                    class="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-md shadow-sm cursor-default focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 sm:text-sm"
                  >
                    <span class="block truncate">{{
                      form.baseChampionship?.name ?? "Carregando campeonatos..."
                    }}</span>
                    <span
                      class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
                    >
                      <ChevronUpDownIcon
                        class="w-5 h-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </ListboxButton>
                  <transition
                    leave-active-class="transition duration-100 ease-in"
                    leave-from-class="opacity-100"
                    leave-to-class="opacity-0"
                  >
                    <ListboxOptions
                      class="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                    >
                      <ListboxOption
                        v-for="championship in championships"
                        :key="championship.id"
                        v-slot="{ active, selected }"
                        :value="championship"
                      >
                        <li
                          :class="[
                            active ? 'bg-gray-100' : '',
                            'relative cursor-default select-none py-2 pl-10 pr-4',
                          ]"
                        >
                          <span
                            :class="[
                              selected ? 'font-semibold' : 'font-normal',
                              'block truncate',
                            ]"
                            >{{ championship.name }}</span
                          >
                          <span
                            v-if="selected"
                            class="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600"
                          >
                            <CheckIcon class="w-5 h-5" aria-hidden="true" />
                          </span>
                        </li>
                      </ListboxOption>
                    </ListboxOptions>
                  </transition>
                </div>
              </Listbox>
            </div>

            <div class="sm:col-span-2">
              <RadioGroup v-model="form.isPrivate">
                <RadioGroupLabel class="block text-sm font-medium text-gray-700"
                  >Visibilidade do torneio</RadioGroupLabel
                >
                <div class="grid grid-cols-2 gap-4 mt-2">
                  <RadioGroupOption
                    v-slot="{ checked }"
                    as="template"
                    :value="false"
                  >
                    <div
                      :class="[
                        checked
                          ? 'bg-gray-800 text-white'
                          : 'border-gray-300 bg-white text-gray-900',
                        'relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-colors duration-200',
                      ]"
                    >
                      <div class="flex items-center justify-center w-full">
                        <div class="text-center">
                          <RadioGroupLabel as="p" class="font-medium"
                            >Público</RadioGroupLabel
                          >
                          <RadioGroupDescription
                            as="span"
                            :class="[
                              checked ? 'text-gray-300' : 'text-gray-500',
                              'text-xs',
                            ]"
                            >Qualquer um pode entrar</RadioGroupDescription
                          >
                        </div>
                      </div>
                    </div>
                  </RadioGroupOption>
                  <RadioGroupOption
                    v-slot="{ checked }"
                    as="template"
                    :value="true"
                  >
                    <div
                      :class="[
                        checked
                          ? 'bg-gray-800 text-white'
                          : 'border-gray-300 bg-white text-gray-900',
                        'relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-colors duration-200',
                      ]"
                    >
                      <div class="flex items-center justify-center w-full">
                        <div class="text-center">
                          <RadioGroupLabel as="p" class="font-medium"
                            >Privado</RadioGroupLabel
                          >
                          <RadioGroupDescription
                            as="span"
                            :class="[
                              checked ? 'text-gray-300' : 'text-gray-500',
                              'text-xs',
                            ]"
                            >Apenas por convite</RadioGroupDescription
                          >
                        </div>
                      </div>
                    </div>
                  </RadioGroupOption>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        <div class="p-6 bg-white border border-gray-200 rounded-lg">
          <h2 class="text-base font-semibold leading-7 text-gray-900">
            Sistema de Pontuação
          </h2>
          <div
            class="grid grid-cols-1 mt-6 gap-y-6 sm:grid-cols-2 lg:grid-cols-2 sm:gap-x-6"
          >
            <div>
              <div class="flex items-center gap-1.5">
                <label
                  for="points-full"
                  class="block text-sm font-medium text-gray-700"
                  >Acerto completo</label
                >
                <div class="relative group">
                  <InformationCircleIcon class="w-4 h-4 text-gray-400" />
                  <span
                    class="absolute bottom-full left-1/2 -translate-x-1/2 w-48 p-2 mb-2 text-xs text-center text-white bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  >
                    O usuário acerta o placar exato do jogo. Ex: Palpite 2x1,
                    Resultado 2x1.
                  </span>
                </div>
              </div>
              <input
                id="points-full"
                v-model.number="form.points.full"
                type="number"
                min="0"
                required
                class="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-gray-800 focus:border-gray-800 sm:text-sm"
              >
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <label
                  for="points-partial"
                  class="block text-sm font-medium text-gray-700"
                  >Acerto parcial</label
                >
                <div class="relative group">
                  <InformationCircleIcon class="w-4 h-4 text-gray-400" />
                  <span
                    class="absolute bottom-full left-1/2 -translate-x-1/2 w-48 p-2 mb-2 text-xs text-center text-white bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  >
                    O usuário acerta quem venceu e o número de gols de um dos
                    times. Ex: Palpite 2x1, Resultado 3x1 ou 2x0.
                  </span>
                </div>
              </div>
              <input
                id="points-partial"
                v-model.number="form.points.partial"
                type="number"
                min="0"
                required
                class="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-gray-800 focus:border-gray-800 sm:text-sm"
              >
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <label
                  for="points-goal"
                  class="block text-sm font-medium text-gray-700"
                  >Acerto de gols</label
                >
                <div class="relative group">
                  <InformationCircleIcon class="w-4 h-4 text-gray-400" />
                  <span
                    class="absolute bottom-full left-1/2 -translate-x-1/2 w-48 p-2 mb-2 text-xs text-center text-white bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  >
                    O usuário acerta a quantidade de gols de um dos times, mas
                    erra o resultado. Ex: Palpite 2x1, Resultado 0x1.
                  </span>
                </div>
              </div>
              <input
                id="points-goal"
                v-model.number="form.points.goal"
                type="number"
                min="0"
                required
                class="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-gray-800 focus:border-gray-800 sm:text-sm"
              >
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <label
                  for="points-result"
                  class="block text-sm font-medium text-gray-700"
                  >Acerto de resultado</label
                >
                <div class="relative group">
                  <InformationCircleIcon class="w-4 h-4 text-gray-400" />
                  <span
                    class="absolute bottom-full left-1/2 -translate-x-1/2 w-48 p-2 mb-2 text-xs text-center text-white bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  >
                    O usuário acerta apenas o resultado final (quem venceu ou se
                    houve empate), sem acertar o placar.
                  </span>
                </div>
              </div>
              <input
                id="points-result"
                v-model.number="form.points.result"
                type="number"
                min="0"
                required
                class="block w-full px-3 py-2 mt-1 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-gray-800 focus:border-gray-800 sm:text-sm"
              >
            </div>
          </div>
        </div>

        <div class="p-6 bg-white border border-gray-200 rounded-lg">
          <h2 class="text-base font-semibold leading-7 text-gray-900">
            Detalhes Financeiros
          </h2>
          <div class="mt-6">
            <div class="flex items-center gap-1.5">
              <label
                for="entry-fee"
                class="block text-sm font-medium text-gray-700"
                >Taxa de inscrição (R$)</label
              >
              <div class="relative group">
                <InformationCircleIcon class="w-4 h-4 text-gray-400" />
                <span
                  class="absolute bottom-full left-1/2 -translate-x-1/2 w-56 p-2 mb-2 text-xs text-center text-white bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                >
                  O site não faz a intermediação financeira. O pagamento da taxa
                  e a distribuição dos prêmios são de responsabilidade do
                  administrador do bolão.
                </span>
              </div>
            </div>
            <div class="relative mt-1">
              <div
                class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
              >
                <span class="text-gray-500 sm:text-sm">R$</span>
              </div>
              <input
                id="entry-fee"
                v-model.number="form.entryFee"
                type="number"
                required
                min="0"
                step="0.01"
                class="block w-full px-3 py-2 pl-10 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-gray-800 focus:border-gray-800 sm:text-sm"
                placeholder="0.00"
              >
            </div>
          </div>
        </div>

        <div
          class="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200 sm:relative sm:p-0 sm:bg-transparent sm:border-none sm:pt-4 sm:flex sm:justify-end"
        >
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gray-800 border border-transparent rounded-md shadow-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto sm:py-2 sm:text-sm sm:shadow-sm"
          >
            <span v-if="!loading">Criar Torneio</span>
            <span v-else>Criando...</span>
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from "vue";
import {
  Listbox,
  ListboxButton,
  ListboxLabel,
  ListboxOption,
  ListboxOptions,
  RadioGroup,
  RadioGroupLabel,
  RadioGroupDescription,
  RadioGroupOption,
} from "@headlessui/vue";
import {
  CheckIcon,
  ChevronUpDownIcon,
  InformationCircleIcon,
  XCircleIcon,
  CheckCircleIcon,
} from "@heroicons/vue/20/solid";

useHead({
  title: "Criar Torneio",
});

const stores = useStores();
const loading = ref(false);
const notification = reactive({
  show: false,
  message: "",
  type: "success",
});
let notificationTimeout = null;

const showNotification = (message, type = "success") => {
  notification.message = message;
  notification.type = type;
  notification.show = true;

  if (notificationTimeout) clearTimeout(notificationTimeout);

  notificationTimeout = setTimeout(() => {
    notification.show = false;
  }, 5000);
};

const championships = computed(() => stores.championships.championships);
const deadlineOptions = ref(Array.from({ length: 12 }, (_, i) => i + 1));

const form = reactive({
  name: "",
  maxParticipants: 10,
  betDeadlineHours: 1,
  baseChampionship: null,
  isPrivate: false,
  points: {
    full: 25,
    partial: 12,
    goal: 5,
    result: 10,
  },
  entryFee: 0,
});

onMounted(async () => {
  if (championships.value.length === 0) {
    await stores.championships.fetchAllChampionships();
  }
  if (championships.value.length > 0) {
    form.baseChampionship = championships.value[0];
  }
});

const handleSubmit = async () => {
  loading.value = true;

  if (!form.baseChampionship) {
    showNotification("Por favor, selecione um campeonato base.", "error");
    loading.value = false;
    return;
  }

  const payload = {
    name: form.name,
    maxParticipants: form.maxParticipants,
    betDeadlineHours: form.betDeadlineHours,
    baseChampionshipId: form.baseChampionship.id,
    private: form.isPrivate,
    points: form.points,
    entryFee: form.entryFee,
    userId: stores.auth.user.id,
  };

  const result = await stores.pools.createPool(payload);

  if (!result.success) {
    showNotification(result.error, "error");
  } else {
    showNotification("Torneio criado com sucesso!", "success");
  }

  loading.value = false;
};
</script>
