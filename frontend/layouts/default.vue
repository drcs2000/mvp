<template>
  <div class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
    <div
      class="bg-white w-full max-w-[1600px] h-[90vh] rounded-2xl shadow-lg p-6 grid grid-cols-[180px_1fr_260px] gap-6"
    >
      <div class="grid-column">
        <LeftSidebar />
      </div>

      <div class="grid-column">
        <slot />
      </div>

      <div class="grid-column">
        <RightSidebar />
      </div>
    </div>
  </div>
</template>

<script>
import LeftSidebar from "~/components/LeftSidebar.vue";
import RightSidebar from "~/components/RightSidebar.vue";

export default {
  name: "DefaultLayout",
  components: {
    LeftSidebar,
    RightSidebar,
  },
};
</script>

<style>
html,
body,
#__nuxt,
#__layout {
  height: 100%;
  width: 100%;
}

.grid-column {
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.grid-column::-webkit-scrollbar {
  display: none;
}
</style>
