export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  ssr: true,

  modules: [
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/eslint',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    'nuxt-icon',
  ],

  app: {
    head: {
      title: 'MVP',
      titleTemplate: '%s'
    }
  },

  plugins: [
    '~/plugins/auth-init.client.ts',
    '~/plugins/theme-init.client.ts',
  ],

  routeRules: {
    '/api/**': {
      proxy: `${process.env.API_PROXY_URL}/**`,
    }
  },

  tailwindcss: {
    config: {
      darkMode: 'class',
    },
  }
})