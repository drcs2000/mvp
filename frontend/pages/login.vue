<template>
  <div class="flex items-center justify-center min-h-screen px-4 bg-gray-100">
    <div
      class="w-full max-w-sm p-6 py-8 mx-auto bg-white border border-gray-200 rounded-lg shadow-sm"
    >
      <NuxtLink to="/" class="text-xl font-bold text-center text-gray-800">
        MVP
      </NuxtLink>

      <div class="flex p-1 mt-6 bg-gray-100 rounded-lg">
        <button
          :class="[
            'w-full py-2 text-[13px] font-semibold rounded-md transition-colors',
            tab === 'login'
              ? 'bg-white text-gray-800 shadow'
              : 'text-gray-500 hover:bg-gray-200',
          ]"
          @click="tab = 'login'"
        >
          Entrar
        </button>
        <button
          :class="[
            'w-full py-2 text-[13px] font-semibold rounded-md transition-colors',
            tab === 'register'
              ? 'bg-white text-gray-800 shadow'
              : 'text-gray-500 hover:bg-gray-200',
          ]"
          @click="tab = 'register'"
        >
          Criar Conta
        </button>
      </div>

      <div class="mt-5">
        <form
          v-if="tab === 'login'"
          class="space-y-4"
          @submit.prevent="handleLogin"
        >
          <div>
            <label
              for="login-email"
              class="block text-[13px] font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="login-email"
              v-model="loginForm.email"
              type="email"
              required
              :class="[
                'block w-full px-3 py-2 mt-1 text-[13px] placeholder-gray-400 border rounded-md shadow-sm appearance-none focus:outline-none',
                isLoginEmailInvalid
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-gray-800 focus:border-gray-800',
              ]"
            >
          </div>
          <div>
            <label
              for="login-password"
              class="block text-[13px] font-medium text-gray-700"
            >
              Senha
            </label>
            <input
              id="login-password"
              v-model="loginForm.password"
              type="password"
              required
              class="block w-full px-3 py-2 mt-1 text-[13px] placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-gray-800 focus:border-gray-800"
            >
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="flex items-center justify-center w-full px-4 py-2 mt-4 text-[13px] font-semibold text-white bg-gray-800 border border-transparent rounded-md shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:bg-gray-400"
          >
            <span v-if="!loading">Entrar</span><span v-else>Entrando...</span>
          </button>
        </form>

        <form
          v-if="tab === 'register'"
          class="space-y-4"
          @submit.prevent="handleRegister"
        >
          <div>
            <label
              for="register-name"
              class="block text-[13px] font-medium text-gray-700"
            >
              Nome Completo
            </label>
            <input
              id="register-name"
              v-model="registerForm.name"
              type="text"
              required
              class="block w-full px-3 py-2 mt-1 text-[13px] placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-gray-800 focus:border-gray-800"
            >
          </div>
          <div>
            <label
              for="register-email"
              class="block text-[13px] font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="register-email"
              v-model="registerForm.email"
              type="email"
              required
              :class="[
                'block w-full px-3 py-2 mt-1 text-[13px] placeholder-gray-400 border rounded-md shadow-sm appearance-none focus:outline-none',
                isRegisterEmailInvalid
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-gray-800 focus:border-gray-800',
              ]"
            >
          </div>
          <div>
            <label
              for="register-password"
              class="block text-[13px] font-medium text-gray-700"
            >
              Senha
            </label>
            <input
              id="register-password"
              v-model="registerForm.password"
              type="password"
              required
              class="block w-full px-3 py-2 mt-1 text-[13px] placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-gray-800 focus:border-gray-800"
            >
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="flex items-center justify-center w-full px-4 py-2 mt-4 text-[13px] font-semibold text-white bg-gray-800 border border-transparent rounded-md shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:bg-gray-400"
          >
            <span v-if="!loading">Registrar</span>
            <span v-else>Registrando...</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useStores } from "~/composables/useStores";

definePageMeta({
  layout: "login",
});

useHead({
  title: "Login",
});

const tab = ref("login");
const loading = ref(false);
const stores = useStores();

const showError = ref(false);
const errorMessage = ref("");
let errorTimeout = null;

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

const triggerErrorAlert = (message) => {
  errorMessage.value = message;
  showError.value = true;
  if (errorTimeout) clearTimeout(errorTimeout);
  errorTimeout = setTimeout(() => {
    showError.value = false;
  }, 5000);
};

const handleLogin = async () => {
  loading.value = true;
  const result = await stores.auth.login(loginForm);
  if (!result.success) {
    triggerErrorAlert(result.error);
  }
  loading.value = false;
};

const handleRegister = async () => {
  loading.value = true;
  const result = await stores.auth.register(registerForm);
  if (!result.success) {
    triggerErrorAlert(result.error);
  }
  loading.value = false;
};

// const handleGoogleLogin = () => {
//   loading.value = true;
//   console.log("Iniciando login com Google...");
//   setTimeout(() => {
//     triggerErrorAlert("Serviço do Google indisponível no momento.");
//     loading.value = false;
//   }, 1000);
// };

// const handleFacebookLogin = () => {
//   loading.value = true;
//   console.log("Iniciando login com Facebook...");
//   loading.value = false;
// };
</script>
