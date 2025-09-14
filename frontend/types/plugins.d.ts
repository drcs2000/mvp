import { useAuthStore } from '~/stores/auth';

// Define o formato do nosso objeto $stores
interface IStores {
  auth: ReturnType<typeof useAuthStore>;
  // games: ReturnType<typeof useGamesStore>; // Exemplo
}

// Augmenta os tipos do Nuxt e do Vue
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