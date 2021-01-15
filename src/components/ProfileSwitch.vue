<template>
  <div class="px-4 py-3 flex flex-row text-left">
    <div class="w-20 cursor-pointer">
      <div
        class="border-4 border-solid rounded-full flex w-16 h-9"
        :class="statusStyle.border"
      >
        <span
          class="block w-7 rounded-full h-full"
          :class="statusStyle.bullet"
        ></span>
      </div>
    </div>
    <div class="text-base text-gray-500 flex flex-col">
      <div>OpenVPN profile</div>
      <div class="text-gray-900 mt-1 leading-5">
        <div>{{ domain }}</div>
        <div>{{ name }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProfileSwitch",
  props: {
    status: String,
    domain: String,
    name: String
  },
  computed: {
    statusStyle() {
      switch (this.status) {
        case "connecting":
          return {
            bullet: "bg-yellow-500",
            border: "border-yellow-400 justify-center"
          };
        case "connected":
          return {
            bullet: "bg-green-800",
            border: "border-green-700 justify-end"
          };

        default:
          return {
            bullet: "bg-gray-500",
            border: "border-gray-400 justify-start"
          };
      }
    }
  }
};
</script>

<style></style>
