import colors from 'vuetify/es5/util/colors'

export default {
  // Global page headers
  head: {
    titleTemplate: '%s',
    title: 'frontend',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.6/css/flag-icon.min.css' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;700&display=swap' }
    ]
  },

  // Global CSS
  css: [
    '~/assets/css/tailwind.css', 
    '~/assets/css/main.css'
  ],

  // Plugins to run before rendering page
  plugins: [
    '~/plugins/i18n.js'
  ],

  // Auto import components
  components: true,

  // Modules for dev and build (recommended)
  buildModules: [
    '@nuxtjs/vuetify'
  ],

  // Modules
  modules: [
    '@nuxtjs/axios'
  ],

  // Axios module configuration
  axios: {
    baseURL: '/'
  },

  // Vuetify module configuration
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      themes: {
        light: {
          primary: '#C6DE41',
          secondary: '#153B44',
          tertiary: '#2D6E7E',
        },
        dark: {
          primary: '#C6DE41',
          secondary: '#153B44',
          tertiary: '#153B44',
        }
      }
    },
    defaultAssets: {
      font: {
        family: 'Roboto Slab'
      }
    }
  },

  // Build Configuration
  build: {},

  // Configuração do i18n
  i18n: {
    locales: [
      { code: 'en', name: 'English' },
      { code: 'pt', name: 'Português' }
    ],
    defaultLocale: 'pt',
    vueI18n: {
      fallbackLocale: 'pt',
      messages: {
        en: require('./i18n/en.json'),
        pt: require('./i18n/pt.json')
      }
    }
  },

  // Custom layouts
  layoutTransition: 'layout',
  layouts: {
    login: '~/layouts/login.vue'
  }
}
