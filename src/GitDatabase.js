const child_process = require("child_process");
const { TextDatabase } = require("./TextDatabase");
const util = require("util");
const fs = require("fs");
const path = require("path");

const execFile = util.promisify(child_process.execFile);
const exists = util.promisify(fs.exists);

class GitDatabase extends TextDatabase {
  constructor(dir) {
    super(dir);
  }

  async create(ifNotExists) {
    if (await super.create(ifNotExists) || !await exists(path.join(this.dir, ".git"))) {
      const { stdout, stderr } = await execFile("git", ["init"], { cwd: this.dir });
      if (stderr !== "") {
        throw new Error(`Error creating git repo: ${util.inspect({ stderr, stdout })}`)
      }
      return true;
    }
    return false;
  }

  async commit(message) {
    await execFile("git", ["add", "--all"])
    console.log(await execFile("git", ["commit", "--message", message]));
  }
}

exports.GitDatabase = GitDatabase;
