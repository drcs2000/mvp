import { useNuxtApp } from '#app';

export const useStores = () => {
  const { $stores } = useNuxtApp();

  return $stores;
}