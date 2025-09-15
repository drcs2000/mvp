<template>
  <transition
    enter-active-class="ease-out duration-300"
    enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    enter-to-class="opacity-100 translate-y-0 sm:scale-100"
    leave-active-class="ease-in duration-200"
    leave-from-class="opacity-100 translate-y-0 sm:scale-100"
    leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
  >
    <div
      v-if="show"
      :class="['fixed right-4 top-4 p-4 rounded-md shadow-lg text-white z-50 transition-all transform', type === 'success' ? 'bg-green-500' : 'bg-red-500']"
    >
      {{ message }}
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'info',
  },
  duration: {
    type: Number,
    default: 3000,
  },
});

const show = ref(false);
let timeout = null;

const showToast = () => {
  show.value = true;
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    show.value = false;
  }, props.duration);
};

watch(() => props.message, (newMessage, oldMessage) => {
  if (newMessage && newMessage !== oldMessage) {
    showToast();
  }
});
</script>