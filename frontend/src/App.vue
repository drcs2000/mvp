<template>
  <v-app>
    <v-main>
      <nav-bar />
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import navBar from "./components/navBar.vue";

export default {
  name: "App",

  data: () => ({
    //
  }),
  components: {
    navBar,
  },
};
</script>
