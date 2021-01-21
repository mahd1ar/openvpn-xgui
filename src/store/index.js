import { createStore } from "vuex";
import { remote } from "electron";
import fs from "fs";

export default createStore({
  state: {
    profiles: [
      {
        name: "tst_file",
        domain: "netdom.ir",
        status: "connected"
      }
    ],
    configFile: "",
    logger: ""
  },
  mutations: {
    scanProfiles(state) {
      //empty current profiles
      // state.profiles.splice(0, state.profiles.length);

      const appLocalPath = remote.getGlobal("globals").appLocalPath,
        profiles = [];

      const files = fs.readdirSync(appLocalPath + "/");
      let file_length = files.length;

      files.forEach(i => {
        fs.readFile(`${appLocalPath}/${i}`, (error, ctx) => {
          if (error) return;

          const remote = ctx
            .toString()
            .split("\n")
            .filter(row => row.search("remote") === 0);

          if (remote.length > 0) {
            const p = {};
            p.domain = remote[0].replace("remote", "");
            p.name = i;
            p.status =
              p.name === state.configFile ? "connected" : "disconnected";
            p.timeMs = parseInt(fs.statSync(`${appLocalPath}/${i}`).mtimeMs);
            profiles.push(p);
          }

          //finally:
          if (file_length-- === 1)
            profiles
              .sort((a, b) => b.timeMs - a.timeMs)
              .forEach(i => state.profiles.push(i));
        });
      });
    },

    connect(state, config_file_name) {
      state.configFile = config_file_name;
      state.profiles.find(i => i.name === state.configFile).status =
        "connected";
    },
    disconnect(state, config_file_name) {
      state.profiles.find(i => i.name === config_file_name).status =
        "disconnected";
      state.configFile = "";
    },
    halt(state, config_file_name) {
      state.profiles.find(i => i.name === config_file_name).status =
        "connecting";
    },
    unhalt(state, config_file_name) {
      state.profiles.find(i => i.name === config_file_name).status =
        "disconnected";
    },
    log(state, contex) {
      if (state.logger !== "") state.logger += "\n";
      state.logger += contex;
    }
  },
  actions: {
    scanProfiles({ commit }) {
      commit("scanProfiles");
    },
    halt({ commit: c }, ctx) {
      c("halt", ctx);
    },
    unhalt({ commit: c }, ctx) {
      c("unhalt", ctx);
    },
    connect({ commit: c }, ctx) {
      c("connect", ctx);
    },
    disconnect({ commit: c }, ctx) {
      c("disconnect", ctx);
    },
    log({ commit: c }, ctx) {
      console.log(ctx);
      c("log", ctx);
    }
  },
  getters: {
    connectionStatus(state) {
      return state.configFile !== "" ? "connected" : "disconnected";
    },
    connectedProfile(state) {
      return state.profiles.find(i => i.status === "connected");
    }
  },
  modules: {}
});
