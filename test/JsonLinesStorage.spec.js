const { JsonLinesStorage } = require("../src/JsonLinesStorage");
const crypto = require("crypto");

test("can read & write to storage", async () => {
  const storage = new JsonLinesStorage(
    `.tmp/${crypto.randomBytes(12).toString("base64url")}.jsonl`, "foo");
  try {
    await storage.insert({ a: 1, b: 2, foo: "b" });
    await storage.insert({ b: 2, a: 1, foo: "a" });
    expect(await storage.readAll()).toEqual([{ a: 1, b: 2, foo: "a" }, { a: 1, b: 2, foo: "b" }]);
  } finally {
    await storage.unlink();
  }
});

test("writing in parallel does properly write records", async () => {
  const storage = new JsonLinesStorage(
    `.tmp/${crypto.randomBytes(12).toString("base64url")}.jsonl`, "id");
  try {
    await Promise.all(new Array(24).fill(null).map((_, index) => storage.insert({ id: index })))
    expect(await storage.readAll()).toHaveLength(24);
  } finally {
    await storage.unlink();
  }
});
