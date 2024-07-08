<template>
  <v-app-bar app color="secondary" dark>
    <v-container>
      <v-row align="center" justify="space-between">
        <v-col cols="auto">
          <v-img src="../assets/images/logo.png" contain width="50" height="50" />
        </v-col>

        <v-col class="d-flex justify-center">
          <v-btn text>{{ $t('live') }}</v-btn>
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn text v-bind="attrs" v-on="on">{{ $t('championships') }}</v-btn>
            </template>
            <v-list>
              <v-list-item link>
                <v-list-item-title>{{ $t('championship1') }}</v-list-item-title>
              </v-list-item>
              <v-list-item link>
                <v-list-item-title>{{ $t('championship2') }}</v-list-item-title>
              </v-list-item>
              <v-list-item link>
                <v-list-item-title>{{ $t('championship3') }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>

        <v-col cols="auto">
          <v-btn outlined color="primary" to="/login">{{ $t('enter') }}</v-btn>
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on" class="flag-btn">
                <v-icon :class="`flag-icon flag-icon-${currentLang}`" />
              </v-btn>
            </template>
            <v-list>
              <v-list-item v-for="lang in languages" :key="lang.value" @click="changeLanguage(lang.value)">
                <v-icon left :class="`flag-icon flag-icon-${lang.value}`"></v-icon>
                <v-list-item-title>{{ lang.text }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script>
export default {
  name: "navBar",
  data() {
    return {
      currentLang: 'pt',
      languages: [
        { text: 'English', value: 'gb' },
        { text: 'Português', value: 'pt' }
      ]
    }
  },
  methods: {
    changeLanguage(lang) {
      this.currentLang = lang
      this.$i18n.locale = lang === 'gb' ? 'en' : 'pt'
      this.$store.dispatch('setLanguage', this.$i18n.locale)
    }
  }
}
</script>

<style scoped>
.v-btn {
  margin-right: 10px;
}
.ml-3 {
  margin-left: 10px;
}
.flag-btn .v-icon {
  width: 24px;
  height: 24px;
}
</style>
