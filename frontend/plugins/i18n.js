import Vue from 'vue'
import VueI18n from 'vue-i18n'
import en from '@/i18n/en.json'
import pt from '@/i18n/pt.json'

Vue.use(VueI18n)

export default ({ app, store }) => {
  const locale = store ? store.state.locale : 'pt'
  app.i18n = new VueI18n({
    locale: locale,
    fallbackLocale: 'pt',
    messages: {
      en,
      pt
    }
  })
}
