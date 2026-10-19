export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  ssr: true,

  css: [
    '~/assets/css/main.css',
  ],

  modules: [
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/eslint',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    'nuxt-icon',
    '@nuxtjs/i18n',
  ],

  i18n: {
    locales: [
      { code: 'pt-BR', language: 'pt-BR', name: 'Português', file: 'pt-BR.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'pt-BR',
    strategy: 'no_prefix',
    langDir: 'locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'mvp_locale',
      redirectOn: 'root',
    },
  },

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
