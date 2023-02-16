const fs = require("fs");
const lodash = require("lodash");
const stringify = require("json-stable-stringify");

class JsonLinesStorage {
  #mutex;
  #path;
  #sortFn;

  constructor(path, sortFn = _ => _) {
    this.#path = path;
    this.#sortFn = sortFn;
  }

  async insert(row) {
    await this.insertAll(row);
  }

  async insertAll(rows) {
    await this.#lock(async () => {
      await this.replaceAll(lodash.sortBy((await this.readAll()).concat(rows), this.#sortFn));
    })
  }

  async replaceAll(rows) {
    await fs.promises.writeFile(this.#path, rows
      .map((row) => stringify(row) + "\n")
      .join(""));
  }

  async readAll() {
    try {
      return (await fs.promises.readFile(this.#path, "utf-8"))
        .trimEnd()
        .split(/\n/)
        .map((_) => JSON.parse(_))
    } catch (error) {
      if (error.errno == -2) {
        return [];
      }
      throw error;
    }
  }

  async unlink() {
    try {
      await fs.promises.unlink(this.#path);
    } catch (error) {
      if (error.errno !== -2) {
        throw error;
      }
    }
  }

  async #lock(fn) {
    while (this.#mutex) {
      await this.#mutex;
    }
    let resolve;
    this.#mutex = new Promise((res) => { resolve = res });
    await fn();
    this.#mutex = null;
    resolve();
  }
}

exports.JsonLinesStorage = JsonLinesStorage;
