<template>
  <v-app>
    <NavBar />
    <v-main class="main-bg">
      <Nuxt />
    </v-main>
    <Footer />
  </v-app>
</template>

<script>
export default {
  components: {
    Footer: () => import('~/components/footer.vue'),
    NavBar: () => import('~/components/navBar.vue')
  }
}
</script>
