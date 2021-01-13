<template>
  <div class="about">
    <h1>This is an about page</h1>
    <pre>
      {{ ls }}
    </pre>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";

function exec(args) {
  return new Promise((resolve, reject) => {
    ipcRenderer.send("send_command", args); // prints "pong"

    ipcRenderer.on("reply_command", (event, arg) => {
      resolve(arg);
    });

    ipcRenderer.on("error_command", (event, arg) => {
      reject(arg);
    });
  });
}

// window.ipcRenderer = ipcRenderer
export default {
  data() {
    return {
      ls: "ss"
    };
  },
  async mounted() {
    this.ls = await exec(["ls", "-lh", "/usr"]);
  }
};
</script>

<style></style>
