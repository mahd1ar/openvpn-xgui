<template>
  <div id="app" class="bg-gray-100 relative">
    <head-bar />
    <router-view />
  </div>
</template>

<script>
import Header from "@/components/Header.vue";

export default {
  components: {
    headBar: Header
  },
  mounted() {
    window.ll = this;
    this.$store.dispatch("scanProfiles");
  }
};
</script>

<style>
#app {
  height: 100vh;
}

* {
  user-select: none;
}
</style>
