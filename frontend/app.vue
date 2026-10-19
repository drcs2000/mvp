<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { locale } = useI18n();

useHead({
  htmlAttrs: {
    lang: () => locale.value,
  },
});
</script>
