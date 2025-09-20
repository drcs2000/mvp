import type { Ref } from 'vue';

export const useSidebar = (): Ref<boolean> => useState<boolean>('isSidebarOpen', () => false);