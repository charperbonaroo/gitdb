const { GitDatabase } = require("../src/GitDatabase");
const crypto = require("crypto");

test("can read & write to storage", async () => {
  const db = new GitDatabase(`.tmp/${crypto.randomBytes(12).toString("base64url")}`);

  try {
    await db.create("if-not-exists");
    await db.create("if-not-exists");
    const users = db.table("users", "id");
    await users.insertAll(buildUsers(24));

    await db.commit("Foo");
  } finally {
    // await db.unlink();
  }
});

function buildUsers(n) {
  return new Array(n).fill(null).map((_, index) => ({ id: index, email: `user-${index}@example.com` }))
}
