<template>
  <div class="about">
    <h1>LOG</h1>
    <pre class="w-full whitespace-pre-wrap">
      {{ logger }}
    </pre>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  data() {
    return {};
  },
  computed: {
    ...mapState(["logger"])
  }
};
</script>

<style></style>
