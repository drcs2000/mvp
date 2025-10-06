<template>
  <img :src="imageSource" :alt="alt" >
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    default: 'Logo',
  }
});

const GENERIC_EMBLEM = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJzaGllbGRHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlMGUwZTA7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojYjBiMGIwO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxwYXRoIGQ9Ik01MCAwIEw5NSAxNSBMOTUgNTUgQzk1IDg1IDUwIDEwMCA1MCAxMDAgQzUwIDEwMCA1IDg1IDUgNTUgTDUgMTUgWiIgZmlsbD0idXJsKCNzaGllbGRHcmFkaWVudCkiIHN0cm9rZT0iIzg4OCIgc3Ryb2tlLXdpZHRoPSIyIiAvPjx0ZXh0IHg9IjUwIiB5PSI2MCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM1NTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtd2VpZ2h0PSJib2xkIj4/PC90ZXh0Pjwvc3ZnPg==';

const imageSource = ref(GENERIC_EMBLEM);

const checkImage = (url) => {
  if (!url) {
    imageSource.value = GENERIC_EMBLEM;
    return;
  }
  
  const img = new Image();
  img.src = url;

  img.onload = () => {
    imageSource.value = url;
  };
  img.onerror = () => {
    imageSource.value = GENERIC_EMBLEM;
  };
};

watch(() => props.src, (newSrc) => {
  checkImage(newSrc);
}, { immediate: true });
</script>