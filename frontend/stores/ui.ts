import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', () => {
  const toastMessage = ref('');
  const toastType = ref<'success' | 'error' | 'info'>('success');
  let timeoutId: NodeJS.Timeout | null = null;

  function showToast(message: string, type: 'success' | 'error' | 'info' = 'success', duration: number = 4000) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    toastMessage.value = message;
    toastType.value = type;

    timeoutId = setTimeout(() => {
      hideToast();
    }, duration);
  }

  function hideToast() {
    toastMessage.value = '';
    timeoutId = null;
  }

  return {
    toastMessage,
    toastType,
    showToast,
  };
});