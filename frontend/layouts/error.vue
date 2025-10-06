<template>
  <div class="flex min-h-full flex-col items-center justify-center pt-16 pb-12 text-center">
    <main class="mx-auto flex w-full max-w-7xl flex-grow flex-col justify-center px-6 lg:px-8">
      <div v-if="error.statusCode === 404">
        <p class="text-base font-semibold text-blue-600 dark:text-blue-400">
          404
        </p>
        <h1 class="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Página não encontrada
        </h1>
        <p class="mt-6 text-base leading-7 text-gray-600 dark:text-gray-400">
          Desculpe, não conseguimos encontrar a página que você está procurando.
        </p>
      </div>

      <div v-else>
        <p class="text-base font-semibold text-red-600 dark:text-red-400">
          Erro {{ error.statusCode }}
        </p>
        <h1 class="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Ocorreu um erro
        </h1>
        <p class="mt-6 text-base leading-7 text-gray-600 dark:text-gray-400">
          {{ otherError }}
        </p>
      </div>

      <div class="mt-10 flex items-center justify-center gap-x-6">
        <NuxtLink
          to="/"
          class="rounded-md bg-gray-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white"
        >
          Voltar para a página inicial
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  layout: 'default',
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      pageNotFound: 'Página Não Encontrada',
      otherError: 'Parece que algo deu errado do nosso lado.'
    }
  },
  head () {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : `Erro ${this.error.statusCode}`
    return {
      title
    }
  }
}
</script>
