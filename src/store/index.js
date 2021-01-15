import { createStore } from "vuex";

export default createStore({
  state: {
    status: "disconnect",
    configFile: "",

    logger: ""
  },
  mutations: {
    setConfigFileName(state, ctx) {
      state.configFile = ctx;
      state.status = "connected";
    },
    disconnect(state) {
      state.status = "disconnect";
      state.configFile = "";
    },
    log(state, contex) {
      if (state.logger !== "") state.logger += "\n";
      state.logger += contex;
    }
  },
  actions: {},
  modules: {}
});
