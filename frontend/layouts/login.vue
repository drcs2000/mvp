<template>
  <v-app style="overflow: hidden;">
    <NavBar />
    <v-main class="main-bg">
      <Nuxt />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'Login',
  components: {
    NavBar: () => import('~/components/navBar.vue')
  }
}
</script>
