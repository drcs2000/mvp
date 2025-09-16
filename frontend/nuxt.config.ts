export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

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
  ],

  routeRules: {
    '/api/**': {
      proxy: 'http://localhost:3333/**',
    }
  },
})