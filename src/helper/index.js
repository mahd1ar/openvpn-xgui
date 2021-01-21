// import { ipcRenderer } from "electron";
const { spawn, spawnSync } = require("child_process");
var pidusage = require("pidusage");

// export class commandRunner {
//   constructor() {
//     this.stack = [];
//     this.resultStack = [];
//     this.pstack = [];
//   }

//   /**
//    *
//    * @param {String[]} cmd
//    * @returns {Promise}
//    */
//   r(cmd) {
//     this.resolving = true;

//     const command = spawn(cmd.splice(0, 1)[0], cmd);
//     return new Promise((resolve, reject) => {
//       command.stdout.on("data", data => {
//         command.on("close", code => {
//           resolve({ data, code });
//         });
//       });

//       command.stderr.on("data", data => {
//         command.on("close", code => {
//           reject({ data, code });
//         });
//       });
//     });
//   }

//   run(x) {
//     this.stack.push(x);
//     return this;
//   }

//   done() {
//     return new Promise((resolve, reject) => {
//       this.taskrunner(
//         this.stack,
//         res => {
//           resolve(res);
//         },
//         err => {
//           reject(err);
//         }
//       );
//     });
//   }

//   async taskrunner(arrayOfarrays, cb_res, cb_rej) {
//     if (arrayOfarrays.length === 0) {
//       cb_res(this.resultStack);

//       return;
//     }

//     const candidate = this.r(arrayOfarrays.shift());

//     try {
//       let f = await candidate;

//       this.resultStack.push(f);
//       this.taskrunner(arrayOfarrays, cb_res, cb_rej);
//     } catch (error) {
//       cb_rej(error);
//       return 0;
//     }
//   }
// }

// how to use command runner:

// let r = new commandRunner();

// r.run(["ls", "/"])
//   .run(["pwd"])
//   .run(["ping", "4.4.4.4", "-c", "1"])
//   .done()
//   .then(e => {
//     e.forEach(i => {
//       console.log(i.data.toString());
//     });
//   });

// export function exec(args) {
//   return new Promise((resolve, reject) => {
//     ipcRenderer.send("send_command", args); // prints "pong"

//     ipcRenderer.on("reply_command", (event, arg) => {
//       resolve(arg);
//     });

//     ipcRenderer.on("error_command", (event, arg) => {
//       reject(arg);
//     });
//   });
// }

class OvpnWrapper {
  constructor(profile = { name: null, method: null }) {
    this.instant = null;
    this.profile = profile;
    this._status = "disconnect";
  }

  get status() {
    return this._status;
  }

  set status(stat) {
    this.dispatchEvent(stat, () => null);
    this._status = stat;
  }

  static isFeasible() {
    const command = spawnSync("openvpn3", ["version"]);
    console.log("out", command.stdout.toString());
    console.log("err", command.stderr.toString());

    return command.status === 0 ? true : false;
  }

  static detectProfile() {
    const command = spawnSync("openvpn3", ["sessions-list"]);
    console.log(command);
    console.log(command.output[1].toString());

    if (command.output[1].toString().search("No sessions available") !== -1) {
      return null;
    }

    let output = command.stdout.toString();

    output = output.split(/-+\n/).filter(e => e !== "");
    if (output.length > 1) {
      return new Error("more than one session exists");
    }

    const status = output[0]
      .split("\n")
      .map(i => i.split(/:\s/g))
      .flat()
      .map(i => i.replace(/\s+/, ""));

    for (let i = 0; i < status.length; i++) {
      if (i.search("Path") !== -1) return status[i + 1];
    }

    return null;
  }

  connect(method, name) {
    if (typeof name !== "string") {
      return new Error("configuration profile is not included");
    }
    // const ls = spawn('openvpn3', ['session-start', '--config', '/home/mahdiyar/.config/ovpn-xgui/Kiev_KIEV_udp_53.ovpn'])

    this.instant = spawn("ping", ["4.2.2.4", "-c", "3"]);

    this.instant.stdout.on("data", data => {
      console.log(`stdout: ${data}`);
    });

    this.instant.stderr.on("data", data => {
      console.error(`stderr: ${data}`);
    });
  }

  disconnect() {}

  dispatchEvent(eventName, callback) {
    if (eventName === "connect") {
      callback();
    } else if (eventName === "disconnect") {
      callback();
    } else {
      return new Error("invalid argument");
    }
  }

  on(event, cb) {
    if (event === "closed") {
      const compute = async () => {
        const stats = await pidusage(this.instant.pid);
        console.log("stats", stats);
        // do something
      };

      const interval = async time => {
        setTimeout(async () => {
          try {
            await compute();
            interval(time);
          } catch (error) {
            console.log(error);
            cb();
          }
        }, time);
      };

      interval(1000);
    }
  }
}

OvpnWrapper.detectProfile();
