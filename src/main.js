import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
// import { ipcRenderer } from 'electron'

// window.ipcRenderer = ipcRenderer

createApp(App)
  .use(store)
  .use(router)
  .mount("#app");
