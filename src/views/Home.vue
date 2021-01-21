<template>
  <div id="home">
    <!-- navbar  -->
    <main>
      <h3 class="p-4 font-bold text-gray-800 text-xl text-left uppercase">
        {{ connectionStatus }}
      </h3>

      <profile-switch
        v-for="(profile, index) in profiles"
        :key="index"
        :domain="profile.domain"
        :name="profile.name"
        v-model:status="profile.status"
        @click="
          profile.status === 'connected'
            ? sessionEnd(index)
            : sessionStart(index)
        "
      />

      <div
        class="absolute cursor-pointer w-14 h-14 bg-yellow-600 items-center rounded-full flex justify-center bottom-5 right-5"
      >
        <img src="@/assets/plus.svg" class="p-2" />
      </div>
    </main>
  </div>
</template>

<script>
// @ is an alias to /src
/* eslint-disable */
// vue "connected"
import { mapState, mapGetters, mapActions } from "vuex";

import fs from "fs";
import { remote } from "electron";

import ProfileSwitch from "@/components/ProfileSwitch.vue";
import { exec } from "@/helper";

export default {
  name: "Home",
  components: {
    ProfileSwitch
  },
  data() {
    return {
      pathPrefix: ""
    };
  },
  mounted() {
    this.pathPrefix = remote.getGlobal("globals").appLocalPath;
  },
  methods: {
    ...mapActions(["halt", "unhalt", "connect", "disconnect", "log"]),
    async sessionStart(index) {
      const fileName = this.profiles[index]["name"];
      // halt
      this.halt(fileName);

      try {
        const msg = await exec([
          "openvpn3",
          "session-start",
          "--config",
          `${this.pathPrefix}/${fileName}`
        ]);
        this.log(msg);

        // succcess
        this.connect(fileName);
        this.$router.push('/connected')
      } catch (error) {
        this.log(error);
        this.unhalt(fileName);
      }

      // openvpn3 session-start --config /home/mahdiyar/Downloads/Kiev_KIEV_udp_53.ovpn
    },
    async sessionEnd(index) {
      const fileName = this.profiles[index]["name"];

      this.halt(fileName);

      try {
        const msg = await exec([
          "openvpn3",
          "session-manage",
          "--disconnect",
          "--config",
          `${this.pathPrefix}/${fileName}`
        ]);

        // success;
        this.log(msg);

        this.disconnect(fileName);
      } catch (error) {
        this.log(error);
        this.unhalt(fileName);
      }
    }
  },
  computed: { ...mapState(["profiles"]), ...mapGetters(["connectionStatus"]) }
};
</script>

<style>
</style>
