<template>
  <transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="transform opacity-0 translate-y-2"
    enter-to-class="transform opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="transform opacity-100 translate-y-0"
    leave-to-class="transform opacity-0 translate-y-2"
  >
    <div
      v-if="show"
      :class="[
        'fixed top-5 right-5 z-[100] flex items-center gap-x-3 rounded-lg border bg-white p-3 shadow-md dark:border-gray-700 dark:bg-gray-800',
        typeClasses.wrapper,
      ]"
      role="alert"
    >
      <div class="flex-shrink-0">
        <svg
          v-if="props.type === 'success'"
          :class="['h-5 w-5', typeClasses.icon]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-if="props.type === 'error'"
          :class="['h-5 w-5', typeClasses.icon]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-if="props.type === 'info'"
          :class="['h-5 w-5', typeClasses.icon]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <div class="text-[13px] font-medium text-gray-700 dark:text-gray-200">
        {{ message }}
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "success", // 'success', 'error', ou 'info'
  },
  duration: {
    type: Number,
    default: 3000,
  },
});

const show = ref(false);
let timeout = null;

const typeClasses = computed(() => {
  switch (props.type) {
    case "success":
      return {
        wrapper: "border-l-4 border-green-400",
        icon: "text-green-400",
      };
    case "error":
      return {
        wrapper: "border-l-4 border-red-400",
        icon: "text-red-400",
      };
    case "info":
      return {
        wrapper: "border-l-4 border-blue-400",
        icon: "text-blue-400",
      };
    default:
      return {
        wrapper: "border-l-4 border-gray-400",
        icon: "text-gray-400",
      };
  }
});

const showToast = () => {
  show.value = true;
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    show.value = false;
  }, props.duration);
};

watch(
  () => props.message,
  (newMessage) => {
    if (newMessage) {
      showToast();
    }
  }
);
</script>
