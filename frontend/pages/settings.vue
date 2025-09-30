<template>
  <div class="bg-gray-50 dark:bg-gray-800 min-h-screen py-8 sm:py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <header class="mb-8">
        <h1
          class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
        >
          Configurações
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gerencie suas preferências de conta e aparência do site.
        </p>
      </header>

      <main>
        <div
          class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div class="p-4 sm:p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Aparência
            </h2>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Escolha como o site deve ser exibido para você.
            </p>

            <fieldset class="mt-4">
              <legend class="sr-only">Escolha do tema</legend>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Opção Claro -->
                <label
                  :class="[
                    'relative flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer border-2 transition-colors',
                    theme === 'light'
                      ? 'border-blue-500 bg-blue-50 dark:bg-gray-700'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50',
                  ]"
                >
                  <input
                    type="radio"
                    name="theme-option"
                    value="light"
                    class="sr-only"
                    :checked="theme === 'light'"
                    @change="setTheme('light')"
                  >
                  <SunIcon
                    class="w-8 h-8 mb-2"
                    :class="
                      theme === 'light'
                        ? 'text-blue-600'
                        : 'text-gray-500 dark:text-gray-400'
                    "
                  />
                  <span
                    class="font-medium text-sm"
                    :class="
                      theme === 'light'
                        ? 'text-blue-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    "
                  >
                    Claro
                  </span>
                  <span
                    v-if="theme === 'light'"
                    class="absolute top-3 right-3 text-blue-600"
                  >
                    <CheckCircleIcon class="w-5 h-5" />
                  </span>
                </label>

                <!-- Opção Escuro -->
                <label
                  :class="[
                    'relative flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer border-2 transition-colors',
                    theme === 'dark'
                      ? 'border-blue-500 bg-blue-900/10 dark:bg-gray-700'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50',
                  ]"
                >
                  <input
                    type="radio"
                    name="theme-option"
                    value="dark"
                    class="sr-only"
                    :checked="theme === 'dark'"
                    @change="setTheme('dark')"
                  >
                  <MoonIcon
                    class="w-8 h-8 mb-2"
                    :class="
                      theme === 'dark'
                        ? 'text-blue-500'
                        : 'text-gray-500 dark:text-gray-400'
                    "
                  />
                  <span
                    class="font-medium text-sm"
                    :class="
                      theme === 'dark'
                        ? 'text-blue-500 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    "
                  >
                    Escuro
                  </span>
                  <span
                    v-if="theme === 'dark'"
                    class="absolute top-3 right-3 text-blue-500"
                  >
                    <CheckCircleIcon class="w-5 h-5" />
                  </span>
                </label>
              </div>
            </fieldset>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { SunIcon, MoonIcon, CheckCircleIcon } from "@heroicons/vue/24/solid";

const { theme, setTheme: rawSetTheme } = useTheme();

const setTheme = (newTheme) => {
  if (newTheme === "light" || newTheme === "dark") {
    rawSetTheme(newTheme);
  }
};
</script>
