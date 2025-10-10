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

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3333'
    }
  },

  routeRules: {
    '/api/**': {
      proxy: 'http://localhost:3333/**',
    }
  },

  tailwindcss: {
    config: {
      darkMode: 'class',
    },
  }
})