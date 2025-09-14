import { defineNuxtPlugin } from '#app';
import { useAuthStore } from '~/stores/auth';
import { usePoolStore } from '~/stores/pool';

export default defineNuxtPlugin((nuxtApp) => {
  const stores = {
    auth: useAuthStore(),
    pools: usePoolStore(),
  };

  return {
    provide: {
      stores: stores,
    },
  };
});
