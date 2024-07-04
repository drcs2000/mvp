<template>
  <v-app>
    <v-main class="main-bg">
      <Nuxt />
    </v-main>
    <Footer />
  </v-app>
</template>

<script>
import Footer from '~/components/footer.vue';

export default {
  components: {
    Footer
  }
}
</script>

<style scoped>
.main-bg {
  background-color: #071C21;
}
</style>
