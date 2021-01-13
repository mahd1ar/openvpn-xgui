const { spawn } = require("child_process");

class commandRunner {
  constructor() {
    this.stack = [];
    this.resultStack = [];
    this.pstack = [];
  }

  /**
   *
   * @param {String[]} cmd
   * @returns {Promise}
   */
  r(cmd) {
    this.resolving = true;

    const command = spawn(cmd.splice(0, 1)[0], cmd);
    return new Promise((resolve, reject) => {
      command.stdout.on("data", data => {
        command.on("close", code => {
          resolve({ data, code });
        });
      });

      command.stderr.on("data", data => {
        command.on("close", code => {
          reject({ data, code });
        });
      });
    });
  }

  run(x) {
    this.stack.push(x);
    return this;
  }

  done() {
    return new Promise((resolve, reject) => {
      this.taskrunner(
        this.stack,
        res => {
          resolve(res);
        },
        err => {
          reject(err);
        }
      );
    });
  }

  async taskrunner(arrayOfarrays, cb_res, cb_rej) {
    if (arrayOfarrays.length === 0) {
      cb_res(this.resultStack);

      return;
    }

    const candidate = this.r(arrayOfarrays.shift());

    try {
      let f = await candidate;

      this.resultStack.push(f);
      this.taskrunner(arrayOfarrays, cb_res, cb_rej);
    } catch (error) {
      cb_rej(error);
      return 0;
    }
  }
}

let r = new commandRunner();

// r.run(['ls', '/']).run(['pwd']).run(['find', '/home', '-name', '"*.ovpn"']).done()

r.run(["ls", "/"])
  .run(["pwd"])
  .run(["ping", "4.4.4.4", "-c", "1"])
  .done()
  .then(e => {
    e.forEach(i => {
      console.log(i.data.toString());
    });
  });
