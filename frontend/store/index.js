export const state = () => ({
  locale: 'pt'
})

export const mutations = {
  SET_LANG(state, locale) {
    state.locale = locale
  }
}

export const actions = {
  setLanguage({ commit }, locale) {
    commit('SET_LANG', locale)
  }
}
