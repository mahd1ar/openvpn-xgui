<template>
  <div
    id="modal-overlay"
    class="absolute z-10 flex justify-center items-center top-0 w-full h-full bg-gray-400 bg-opacity-70"
  >
    <div class="w-64 h-64 bg-white rounded-lg flex flex-col justify-between">
      <div class="h-2/3 flex flex-col justify-center ">
        <button
          v-if="!file"
          class="capitalize text-sm  hover:bg-blue-300 bg-blue-200 text-blue-600 p-2 mx-2 rounded-sm"
          @click="onFileChange"
        >
          import openvpn configuration file
        </button>
        <p
          v-else
          class="capitalize text-sm bg-green-100 text-green-700 p-2 mx-2 rounded-sm"
        >
          file : "{{ file }}" added successfully
        </p>
      </div>

      <button
        @click="file ? addAndClose() : closeWindow()"
        class="self-end bg-gray-100 text-gray-500 px-4 py-2 rounded-sm mb-2 mr-2"
      >
        close
      </button>
    </div>
  </div>
</template>

<script>
import { remote } from "electron";
import { sep } from "path";
import fse from "fs-extra";

export default {
  name: "Modal",
  data() {
    return {
      file: false
    };
  },
  props: {
    open: Boolean
  },
  methods: {
    closeWindow() {
      this.$emit("update:open", false);
    },
    addAndClose() {
      this.$emit("refreshProfiles");
      this.$emit("update:open", false);
    },
    alert(config) {
      const defaultOptions = {
        type: "info",
        buttons: ["ok"]
      };

      const configuration = Object.assign({}, config, defaultOptions);

      remote.dialog.showMessageBoxSync(configuration);
    },
    async onFileChange() {
      remote.dialog
        .showOpenDialog({
          properties: ["openFile"],
          filters: [{ name: "openvpn confiuration", extensions: ["ovpn"] }]
        })
        .then(e => {
          if (e.canceled) return;
          console.log(e);
          const fullpath =
            remote.getGlobal("globals").appLocalPath +
            "/" +
            e.filePaths[0].split(sep).pop();

          if (fse.existsSync(fullpath)) {
            this.alert({
              type: "error",
              title: "error",
              message: "this configuration file already exists"
            });
          } else {
            fse.copyFile(e.filePaths[0], fullpath).then(err => {
              if (err)
                this.alert({
                  type: "error",
                  title: "error",
                  message: err
                });

              this.file = e.filePaths[0].split(sep).pop();
            });
          }
        });
    }
  }
};
</script>

<style>
/* #modal-overlay{
    
} */
</style>
