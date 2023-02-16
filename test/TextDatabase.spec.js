const { TextDatabase } = require("../src/TextDatabase");
const crypto = require("crypto");

test("can read & write to storage", async () => {
  const db = new TextDatabase(`.tmp/${crypto.randomBytes(12).toString("base64url")}`);

  try {
    await db.create();
    const users = db.table("users", "id");
    await users.insertAll(buildUsers(24));
  } finally {
    await db.unlink();
  }
});

function buildUsers(n) {
  return new Array(n).fill(null).map((_, index) => ({ id: index, email: `user-${index}@example.com` }))
}
