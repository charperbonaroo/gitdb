const fs = require("fs");
const path = require("path");
const { JsonLinesStorage } = require("./JsonLinesStorage");

class TextDatabase {
  #dir;

  constructor(dir) {
    this.#dir = dir;
  }

  get dir() {
    return this.#dir;
  }

  async create(ifNotExists) {
    try {
      await fs.promises.mkdir(this.#dir);
      return true;
    } catch (error) {
      if (ifNotExists && error.code === "EEXIST") {
        return false;
      }
      throw error;
    }
  }

  table(tableName, sortFn) {
    return new JsonLinesStorage(path.join(this.#dir, `${tableName}.jsonl`), sortFn);
  }

  async unlink() {
    await fs.promises.rm(this.#dir, { recursive: true, force: true });
  }
}

exports.TextDatabase = TextDatabase;
