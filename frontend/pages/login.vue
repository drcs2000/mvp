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
            <div class="relative">
              <EnvelopeIcon
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              />
              <input
                id="login-email"
                v-model="loginForm.email"
                type="email"
                required
                placeholder="seu@email.com"
                :class="[
                  'block w-full pl-10 pr-3 py-3 text-sm placeholder-gray-400 border rounded-lg shadow-sm appearance-none focus:outline-none transition-colors dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400',
                  isLoginEmailInvalid || loginError
                    ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-gray-800 dark:focus:ring-gray-200 focus:border-gray-800 dark:focus:border-gray-200',
                ]"
              >
            </div>
            <div class="relative">
              <LockClosedIcon
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              />
              <input
                id="login-password"
                v-model="loginForm.password"
                type="password"
                required
                placeholder="Sua senha"
                :class="[
                  'block w-full pl-10 pr-3 py-3 text-sm placeholder-gray-400 border rounded-lg shadow-sm appearance-none focus:outline-none transition-colors dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400',
                  loginError
                    ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-gray-800 dark:focus:ring-gray-200 focus:border-gray-800 dark:focus:border-gray-200',
                ]"
              >
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
            <div class="relative">
              <UserIcon
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              />
              <input
                id="register-name"
                v-model="registerForm.name"
                type="text"
                required
                placeholder="Nome completo"
                :class="[
                  'block w-full pl-10 pr-3 py-3 text-sm placeholder-gray-400 border rounded-lg shadow-sm appearance-none focus:outline-none transition-colors dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400',
                  registerError
                    ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-gray-800 dark:focus:ring-gray-200 focus:border-gray-800 dark:focus:border-gray-200',
                ]"
              >
            </div>
            <div class="relative">
              <EnvelopeIcon
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              />
              <input
                id="register-email"
                v-model="registerForm.email"
                type="email"
                required
                placeholder="seu@email.com"
                :class="[
                  'block w-full pl-10 pr-3 py-3 text-sm placeholder-gray-400 border rounded-lg shadow-sm appearance-none focus:outline-none transition-colors dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400',
                  isRegisterEmailInvalid || registerError
                    ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-gray-800 dark:focus:ring-gray-200 focus:border-gray-800 dark:focus:border-gray-200',
                ]"
              >
            </div>
            <div class="relative">
              <LockClosedIcon
                class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              />
              <input
                id="register-password"
                v-model="registerForm.password"
                type="password"
                required
                placeholder="Crie uma senha"
                :class="[
                  'block w-full pl-10 pr-3 py-3 text-sm placeholder-gray-400 border rounded-lg shadow-sm appearance-none focus:outline-none transition-colors dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400',
                  registerError
                    ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-1 focus:ring-gray-800 dark:focus:ring-gray-200 focus:border-gray-800 dark:focus:border-gray-200',
                ]"
              >
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
import { ref, reactive, computed } from "vue";
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
} from "@heroicons/vue/24/outline";

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
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isLoginEmailInvalid = computed(() => {
  return loginForm.email.length > 0 && !isValidEmail(loginForm.email);
});

const isRegisterEmailInvalid = computed(() => {
  return registerForm.email.length > 0 && !isValidEmail(registerForm.email);
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
  loading.value = true;
  registerError.value = false;
  const result = await stores.auth.register(registerForm);
  if (result.success) {
    stores.ui.showToast("Conta criada com sucesso!", "success");
    tab.value = "login"; // Muda para a aba de login após o sucesso
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
/* Estilos para a animação de erro */
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

/* Estilos para a transição do formulário */
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

