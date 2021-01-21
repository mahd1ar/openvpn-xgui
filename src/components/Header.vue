<template>
  <nav class="bg-blue-900 text-gray-200 h-14">
    <ul class="flex flex-row justify-between items-center h-full px-4">
      <li
        class="cursor-pointer bg-blue-800 hover:bg-blue-700 p-2 rounded-md"
        v-if="$router.currentRoute.value.path === '/'"
        @click="isOpen = true"
      >
        import
      </li>
      <li
        class="cursor-pointer bg-blue-800 hover:bg-blue-700 p-2 rounded-md"
        v-else
        @click="$router.push('/')"
      >
        &lt;-go back
      </li>

      <li class="text-2xl font-bold">{{ $router.currentRoute.value.name }}</li>

      <li><router-link to="/about">script</router-link></li>
    </ul>
  </nav>
  <modal
    v-model:open="isOpen"
    v-show="isOpen"
    @refreshProfiles="$emit('refreshProfiles')"
  />
</template>

<script>
import Modal from "@/components/Modal.vue";

export default {
  name: "Header",
  emits: ["refreshProfile"],
  data() {
    return {
      isOpen: false
    };
  },
  components: {
    Modal
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
