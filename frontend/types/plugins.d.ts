import type { useAuthStore } from '~/stores/auth';

interface IStores {
  auth: ReturnType<typeof useAuthStore>;
}

declare module '#app' {
  interface NuxtApp {
    $stores: IStores;
  }
}
declare module 'vue' {
  interface ComponentCustomProperties {
    $stores: IStores;
  }
}