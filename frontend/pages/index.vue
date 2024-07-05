<template>
  <HomePage />
</template>

<script>
export default {
  components: {
    HomePage: () => import('~/pages/home.vue')
  }
}
</script>
