<template>
  <div id="home">
    <!-- navbar  -->
    <head-bar @refreshProfiles="fetchProfiles" />
    <main>
      <h3 class="p-4 font-bold text-gray-800 text-xl text-left uppercase">
        {{ status }}
      </h3>

      <profile-switch
        v-for="(profile, index) in profiles"
        :key="index"
        :domain="profile.domain"
        :name="profile.name"
        :status="profile.status"
        @click="
          status === 'connected' ? sessionEnd(index) : sessionStart(index)
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
// vue
import { mapState } from "vuex";

import fs from "fs";
import { remote, Debugger } from "electron";
// components
import Header from "@/components/Header.vue";
import ProfileSwitch from "@/components/ProfileSwitch.vue";
import { exec } from "@/helper";

export default {
  name: "Home",
  components: {
    headBar: Header,
    ProfileSwitch
  },
  data() {
    return {
      pathPrefix: "",
      profiles: []
    };
  },
  mounted() {
    this.fetchProfiles();
    this.pathPrefix = remote.getGlobal("globals").appLocalPath;
  },
  methods: {
    fetchProfiles() {
      const appLocalPath = remote.getGlobal("globals").appLocalPath;

      fs.readdir(appLocalPath + "/", (err, files) => {
        if (err) {
          console.error(err);
          return;
        }

        files.forEach(i => {
          fs.readFile(`${appLocalPath}/${i}`, (error, ctx) => {
            if (error) return;

            const remote = ctx
              .toString()
              .split("\n")
              .filter(row => row.search("remote") === 0);

            if (remote.length > 0) {
              const profileObject = {};
              profileObject.domain = remote[0].replace("remote", "");
              profileObject.name = i;
              profileObject.status = profileObject.name === this.configFile ?"connected" : "disconnected";
              this.profiles.push(profileObject);
            }
          });
        });
      });
    },
    decideOn(index) {
      // check on config file status
      // if connected
      // [disconnect]
      // if not connected
      // check if others are dissconnected as well
      //   if nothing is connected
      // [connect this one]
      //  else
      // [disconnect others]
      // [connect this]
    },
    async sessionStart(index) {
      // halt
      this.profiles[index].status = "connecting";

      try {
        const msg = await exec([
          "openvpn3",
          "session-start",
          "--config",
          `${this.pathPrefix}/${this.profiles[index]["name"]}`
        ]);
        this.log(msg);

        // succcess
        this.profiles[index].status = "connected";
        this.$store.commit("setConfigFileName", this.profiles[index]["name"]);
      
      } catch (error) {
      
      this.log(error);
        this.profiles[index].status = "connecting";
      }

      // openvpn3 session-start --config /home/mahdiyar/Downloads/Kiev_KIEV_udp_53.ovpn
    },
    async sessionEnd(index) {
      // halt
      this.profiles[index].status = "connecting";

      try {
        const msg = await exec([
          "openvpn3",
          "session-manage",
          "--disconnect",
          "--config",
          `${this.pathPrefix}/${this.profiles[index]["name"]}`
        ]);

        // success
        this.log(msg);
        this.profiles[index].status = "disconnected";
        this.$store.commit("disconnect", this.profiles[index]["name"]);
      
      } catch (error) {
        this.log(error);
      }
    },
    log(ctx) {
      console.log(ctx);
      this.$store.commit("log", ctx);
    }
  },
  computed: {
    ...mapState(["status", "configFile"])
  }
};
</script>

<style>
#home {
  height: 100vh;
}
</style>
