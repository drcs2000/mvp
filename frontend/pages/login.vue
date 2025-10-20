<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-gray-200 dark:from-gray-900 dark:to-slate-800 md:px-4"
  >
    <div
      class="flex flex-col justify-center w-full min-h-screen p-8 space-y-8 bg-white dark:bg-gray-800 md:min-h-0 md:h-auto md:rounded-2xl md:shadow-xl md:max-w-md"
    >
      <div class="text-center">
        <NuxtLink
          to="/"
          class="inline-block text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
        >
          MVP
        </NuxtLink>
        <div class="mt-4">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {{ tab === "login" ? "Bem-vindo de volta" : "Crie sua conta" }}
          </h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{
              tab === "login"
                ? "Insira seus dados para continuar."
                : "Preencha os campos para começar."
            }}
          </p>
        </div>
      </div>

      <div class="flex p-1 bg-slate-100 dark:bg-gray-700 rounded-lg">
        <button
          :class="[
            'w-full py-2.5 text-sm font-semibold rounded-md transition-all',
            tab === 'login'
              ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100',
          ]"
          @click="tab = 'login'"
        >
          Entrar
        </button>
        <button
          :class="[
            'w-full py-2.5 text-sm font-semibold rounded-md transition-all',
            tab === 'register'
              ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100',
          ]"
          @click="tab = 'register'"
        >
          Criar Conta
        </button>
      </div>

      <div class="relative overflow-hidden">
        <Transition name="slide-fade" mode="out-in">
          <form
            v-if="tab === 'login'"
            class="space-y-5"
            :class="{ shake: loginError }"
            @submit.prevent="handleLogin"
          >
            <div :class="[
              'flex w-full items-center rounded-lg border shadow-sm transition-colors dark:bg-gray-700',
              'focus-within:ring-1',
              (isLoginEmailInvalid || loginError)
                ? 'border-red-500 ring-1 ring-red-500 focus-within:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus-within:ring-gray-800 dark:focus-within:ring-gray-200'
            ]">
              <div class="pl-3">
                <EnvelopeIcon class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="login-email"
                v-model="loginForm.email"
                type="email"
                required
                placeholder="seu@email.com"
                class="w-full appearance-none bg-transparent p-3 text-sm placeholder-gray-400 focus:outline-none dark:text-gray-200 dark:placeholder-gray-400"
              />
            </div>
            
            <div :class="[
              'flex w-full items-center rounded-lg border shadow-sm transition-colors dark:bg-gray-700',
              'focus-within:ring-1',
              loginError
                ? 'border-red-500 ring-1 ring-red-500 focus-within:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus-within:ring-gray-800 dark:focus-within:ring-gray-200'
            ]">
              <div class="pl-3">
                <LockClosedIcon class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="login-password"
                v-model="loginForm.password"
                type="password"
                required
                placeholder="Sua senha"
                class="w-full appearance-none bg-transparent p-3 text-sm placeholder-gray-400 focus:outline-none dark:text-gray-200 dark:placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-white bg-gray-800 border border-transparent rounded-lg shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:bg-gray-400 transition-all duration-300 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-300 dark:focus:ring-gray-400 dark:disabled:bg-gray-500"
            >
              <svg
                v-if="loading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-gray-800"
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
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>{{ loading ? "Entrando..." : "Entrar" }}</span>
            </button>
          </form>

          <form
            v-else
            class="space-y-5"
            :class="{ shake: registerError }"
            @submit.prevent="handleRegister"
          >
            <div :class="[
              'flex w-full items-center rounded-lg border shadow-sm transition-colors dark:bg-gray-700',
              'focus-within:ring-1',
              registerError
                ? 'border-red-500 ring-1 ring-red-500 focus-within:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus-within:ring-gray-800 dark:focus-within:ring-gray-200'
            ]">
              <div class="pl-3">
                <UserIcon class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="register-name"
                v-model="registerForm.name"
                type="text"
                required
                placeholder="Nome completo"
                class="w-full appearance-none bg-transparent p-3 text-sm placeholder-gray-400 focus:outline-none dark:text-gray-200 dark:placeholder-gray-400"
              />
            </div>
            
            <div>
              <div :class="[
                'flex w-full items-center rounded-lg border shadow-sm transition-colors dark:bg-gray-700',
                'focus-within:ring-1',
                (isRegisterEmailInvalid || registerError)
                  ? 'border-red-500 ring-1 ring-red-500 focus-within:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus-within:ring-gray-800 dark:focus-within:ring-gray-200'
              ]">
                <div class="pl-3">
                  <EnvelopeIcon class="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="register-email"
                  v-model="registerForm.email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  class="w-full appearance-none bg-transparent p-3 text-sm placeholder-gray-400 focus:outline-none dark:text-gray-200 dark:placeholder-gray-400"
                />
              </div>
              <p v-if="isRegisterEmailInvalid" class="mt-1 text-xs text-red-500">
                Por favor, insira um e-mail válido.
              </p>
            </div>
            
            <div :class="[
              'flex w-full items-center rounded-lg border shadow-sm transition-colors dark:bg-gray-700',
              'focus-within:ring-1',
              ((isPasswordInvalid && registerForm.password.length > 0) || registerError)
                ? 'border-red-500 ring-1 ring-red-500 focus-within:ring-red-500'
                : 'border-gray-300 dark:border-gray-600 focus-within:ring-gray-800 dark:focus-within:ring-gray-200'
            ]">
              <div class="pl-3">
                <LockClosedIcon class="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="register-password"
                v-model="registerForm.password"
                type="password"
                required
                placeholder="Crie uma senha"
                class="w-full appearance-none bg-transparent p-3 text-sm placeholder-gray-400 focus:outline-none dark:text-gray-200 dark:placeholder-gray-400"
              />
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <span
                  :class="[
                    'inline-flex items-center transition-colors',
                    passwordValidation.minLength ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  ]"
                >
                  <CheckCircleIcon class="w-4 h-4 mr-1.5"/>
                  Pelo menos 8 caracteres
                </span>
                <span
                  :class="[
                    'inline-flex items-center transition-colors',
                    passwordValidation.uppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  ]"
                >
                  <CheckCircleIcon class="w-4 h-4 mr-1.5"/>
                  Uma letra maiúscula
                </span>
                <span
                  :class="[
                    'inline-flex items-center transition-colors',
                    passwordValidation.lowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  ]"
                >
                  <CheckCircleIcon class="w-4 h-4 mr-1.5"/>
                  Uma letra minúscula
                </span>
                <span
                  :class="[
                    'inline-flex items-center transition-colors',
                    passwordValidation.number ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  ]"
                >
                  <CheckCircleIcon class="w-4 h-4 mr-1.5"/>
                  Pelo menos um número
                </span>
                 <span
                  :class="[
                    'inline-flex items-center transition-colors col-span-full',
                    passwordValidation.specialChar ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                  ]"
                >
                  <CheckCircleIcon class="w-4 h-4 mr-1.5"/>
                  Um caractere especial (@$!%*?&)
                </span>
            </div>

            <button
              type="submit"
              :disabled="loading || isRegisterEmailInvalid || isPasswordInvalid"
              class="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-white bg-gray-800 border border-transparent rounded-lg shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-300 dark:focus:ring-gray-400 dark:disabled:bg-gray-500"
            >
              <svg
                v-if="loading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white dark:text-gray-800"
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
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>{{
                loading ? "Registrando..." : "Finalizar Cadastro"
              }}</span>
            </button>
          </form>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue";
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  CheckCircleIcon,
} from "@heroicons/vue/24/solid";

definePageMeta({
  layout: "login",
});

useHead({
  title: "Acesso | MVP",
});

const tab = ref("login");
const loading = ref(false);
const stores = useStores();

const loginError = ref(false);
const registerError = ref(false);

const loginForm = reactive({ email: "", password: "" });
const registerForm = reactive({ name: "", email: "", password: "" });

const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const isLoginEmailInvalid = computed(() => {
  return loginForm.email.length > 0 && !isValidEmail(loginForm.email);
});

const isRegisterEmailInvalid = computed(() => {
  return registerForm.email.length > 0 && !isValidEmail(registerForm.email);
});

const passwordValidation = reactive({
  minLength: false,
  uppercase: false,
  lowercase: false,
  number: false,
  specialChar: false,
});

const isPasswordInvalid = computed(() => {
  return Object.values(passwordValidation).some(valid => !valid);
});

watch(() => registerForm.password, (newPassword) => {
    passwordValidation.minLength = newPassword.length >= 8;
    passwordValidation.uppercase = /[A-Z]/.test(newPassword);
    passwordValidation.lowercase = /[a-z]/.test(newPassword);
    passwordValidation.number = /\d/.test(newPassword);
    passwordValidation.specialChar = /[@$!%*?&]/.test(newPassword);
});

const handleLogin = async () => {
  loading.value = true;
  loginError.value = false;
  const result = await stores.auth.login(loginForm);
  if (result.success) {
    stores.ui.showToast("Login efetuado com sucesso!", "success");
  } else {
    stores.ui.showToast(
      result.error || "Credenciais inválidas. Tente novamente.",
      "error"
    );
    loginError.value = true;
    setTimeout(() => (loginError.value = false), 500);
  }
  loading.value = false;
};

const handleRegister = async () => {
  if (isRegisterEmailInvalid.value || isPasswordInvalid.value) {
      stores.ui.showToast("Por favor, corrija os campos em vermelho.", "error");
      registerError.value = true;
      setTimeout(() => (registerError.value = false), 500);
      return;
  }

  loading.value = true;
  registerError.value = false;
  const result = await stores.auth.register(registerForm);
  if (result.success) {
    stores.ui.showToast("Conta criada com sucesso!", "success");
    tab.value = "login";
  } else {
    stores.ui.showToast(
      result.error || "Erro ao criar a sua conta, tente novamente.",
      "error"
    );
    registerError.value = true;
    setTimeout(() => (registerError.value = false), 500);
  }
  loading.value = false;
};
</script>

<style>
.shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>

