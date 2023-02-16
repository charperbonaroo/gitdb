const { GitDatabase } = require("../src/GitDatabase");
const crypto = require("crypto");

test("can read & write to storage", async () => {
  const db = new GitDatabase(`.tmp/${crypto.randomBytes(12).toString("base64url")}`);

  try {
    await db.create("if-not-exists");
    await db.create("if-not-exists");
    const users = db.table("users", "id");

    await users.insertAll(buildUsers(4));
    await db.commit("Insert master users");

    await db.createBranch("foo");
    await users.insertAll(buildUsers(4));
    await db.commit("Insert foo users");

    expect(await users.readAll()).toHaveLength(8);

    await db.switchBranch("master");
    expect(await users.readAll()).toHaveLength(4);

    await db.createBranch("bar");
    await users.insertAll(buildUsers(4));
    await db.commit("Insert bar users");
    expect(await users.readAll()).toHaveLength(8);

    await db.switchBranch("master");
    await db.merge("bar");

    await users.insert({ id: 5, email: "info@example.com" });
    await db.commit("Rename user 5");

    await db.merge("foo");
    expect(await users.readAll()).toHaveLength(13);
  } finally {
    await db.unlink();
  }
});

let nextId = 0;

function buildUsers(n) {
  return new Array(n).fill(null).map(() => ({ id: ++nextId, email: `user-${nextId}@example.com` }))
}
