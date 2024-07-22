<template>
  <v-app-bar app color="secondary" dark>
    <v-container class="navbar-container">
      <v-row align="center">
        <v-col cols="auto">
          <v-toolbar-title>
            <NuxtLink :to="'/'">
              <v-img :src="logo" contain width="50" height="50" />
            </NuxtLink>
          </v-toolbar-title>
        </v-col>

        <v-col class="d-flex justify-center">
          <v-btn text class="mr-2 primary--text">{{ $t("live") }}</v-btn>
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn text v-bind="attrs" v-on="on" class="mr-2 primary--text">
                {{ $t("championships") }}
              </v-btn>
            </template>
            <v-list>
              <v-list-item link>
                <v-list-item-title>{{ $t("championship1") }}</v-list-item-title>
              </v-list-item>
              <v-list-item link>
                <v-list-item-title>{{ $t("championship2") }}</v-list-item-title>
              </v-list-item>
              <v-list-item link>
                <v-list-item-title>{{ $t("championship3") }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn text v-bind="attrs" v-on="on" class="mr-2 primary--text">
                Bolão
              </v-btn>
            </template>
            <v-list align="center">
              <v-list-item link :to="'/pool/new'">
                <v-list-item-title>Novo</v-list-item-title>
              </v-list-item>
              <v-list-item link>
                <v-list-item-title>Meus</v-list-item-title>
              </v-list-item>
              <v-list-item link>
                <v-list-item-title>Todos</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-col>

        <v-col cols="auto" class="flex items-end">
          <v-btn outlined color="primary" to="/login">{{ $t("enter") }}</v-btn>
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on" class="flag-btn">
                <v-icon :class="`flag-icon flag-icon-${currentLang}`" />
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="lang in languages"
                :key="lang.value"
                @click="changeLanguage(lang.value)"
              >
                <v-icon
                  left
                  :class="`flag-icon flag-icon-${lang.value}`"
                />
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
import logo from "../assets/images/logo.png";

export default {
  name: "navBar",
  data() {
    return {
      logo,
      currentLang: "pt",
      languages: [
        { text: "English", value: "gb" },
        { text: "Português", value: "pt" },
      ],
    };
  },
  methods: {
    changeLanguage(lang) {
      this.currentLang = lang;
      this.$i18n.locale = lang === "gb" ? "en" : "pt";
      this.$store.dispatch("setLanguage", this.$i18n.locale);
    },
  },
};
</script>

<style scoped>
.flag-btn .v-icon {
  width: 24px;
  height: 24px;
}

.navbar-container {
  max-width: 1280px;
  margin: 0 auto;
}
</style>
