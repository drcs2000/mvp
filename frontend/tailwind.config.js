module.exports = {
  purge: ['./components/**/*.{vue,js}', './layouts/**/*.vue', './pages/**/*.vue', './plugins/**/*.{js,ts}', './nuxt.config.{js,ts}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        '153b44': '#153b44',
        'c6de41': '#c6de41',
      }
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
