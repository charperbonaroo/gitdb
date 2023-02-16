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
      await fs.promises.writeFile(path.join(this.dir, ".gitattributes"), `* merge=union\n`)
      return true;
    }
    return false;
  }

  async commit(message) {
    await execFile("git", ["add", "--all"], { cwd: this.dir })
    await execFile("git", ["commit", "--message", message], { cwd: this.dir });
  }

  async switchBranch(name) {
    await execFile("git", ["checkout", name], { cwd: this.dir });
  }

  async createBranch(name) {
    await execFile("git", ["checkout", "-b", name], { cwd: this.dir });
  }

  async merge(name) {
    await execFile("git", ["merge", name], { cwd: this.dir });
  }
}

exports.GitDatabase = GitDatabase;
