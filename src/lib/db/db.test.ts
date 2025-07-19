import { assertEquals, assertExists } from "jsr:@std/assert";
import { CreateStore, SchemaDefinition } from "./db.ts"; // Adjust path if needed

// ===== TYPES =====
type User = { id: number; name: string };
type Post = { id: number; user_id: number; title: string };

// ===== SCHEMAS =====
const userSchema: SchemaDefinition = {
  name: "TEXT",
};

const postSchema: SchemaDefinition = {
  user_id: "INT",
  title: "TEXT",
};

// ===== GROUP 1: BASIC OPERATIONS =====
Deno.test("🧪 Basic CreateStore operations", async (t) => {
  const store = new CreateStore<User>("test_users", userSchema);
  store.db.exec("DELETE FROM test_users");

  let userId: number;

  await t.step("create user", async () => {
    const user = await store.create({ name: "Alice" });
    assertExists(user.id);
    assertEquals(user.name, "Alice");
    userId = user.id;
  });

  await t.step("get user", async () => {
    const user = await store.get(userId);
    assertEquals(user.name, "Alice");
  });

  await t.step("patch user", async () => {
    const updated = await store.patch(userId, { name: "Alice Updated" });
    assertEquals(updated.name, "Alice Updated");
  });

  await t.step("find users", async () => {
    const result = await store.find({ query: { name: "Alice Updated" } });
    assertEquals(result.total >= 1, true);
    assertEquals(result.data[0].name, "Alice Updated");
  });

  await t.step("remove user", async () => {
    const removed = await store.remove(userId);
    assertEquals(removed.id, userId);

    const result = await store.find({ query: { name: "Alice Updated" } });
    assertEquals(result.data.length, 0);
  });
});

// ===== GROUP 2: RELATIONAL OPERATIONS =====
Deno.test("🔗 Relational operations (user ↔ posts)", async (t) => {
  const userStore = new CreateStore<User>("test_users_rel", userSchema);
  const postStore = new CreateStore<Post>("test_posts_rel", postSchema);

  userStore.db.exec("DELETE FROM test_users_rel");
  postStore.db.exec("DELETE FROM test_posts_rel");

  let userId: number;

  await t.step("create user", async () => {
    const user = await userStore.create({ name: "Bob" });
    assertExists(user.id);
    userId = user.id;
  });

  await t.step("create posts for user", async () => {
    const posts = await postStore.create([
      { user_id: userId, title: "First Post" },
      { user_id: userId, title: "Second Post" },
    ]);
    assertEquals(posts.length, 2);
    assertEquals(posts[0].user_id, userId);
  });

  await t.step("query posts by user_id", async () => {
    const result = await postStore.find({ query: { user_id: userId } });
    assertEquals(result.total, 2);
    for (const post of result.data) {
      assertEquals(post.user_id, userId);
    }
  });

  await t.step("remove user without cascade", async () => {
    await userStore.remove(userId);
    const postsRemaining = await postStore.find({ query: { user_id: userId } });
    assertEquals(postsRemaining.total, 2); // posts still exist
  });
});
