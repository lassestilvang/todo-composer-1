import { describe, it, expect, beforeEach, beforeAll } from "bun:test";

const isBun =
  typeof process !== "undefined" &&
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Boolean((process as any).versions?.bun);

if (isBun) {
  // Bun cannot load `better-sqlite3`, which backs our db module,
  // so we skip these integration tests when running under Bun.
  describe.skip("Database (better-sqlite3 not supported in Bun)", () => {
    it("is skipped in Bun test environment", () => {
      expect(true).toBe(true);
    });
  });
} else {
  // These tests are intended for a Node environment where better-sqlite3 works.
  // They verify basic schema and CRUD behaviour of the real database.
  describe("Database", () => {
    let db: {
      prepare: (sql: string) => {
        run: (...params: unknown[]) => { lastInsertRowid?: number };
        get: (...params: unknown[]) => Record<string, unknown> | undefined;
      };
    };

    beforeAll(async () => {
      const mod = await import("./db");
      db = mod.db;
    });

    beforeEach(() => {
      // Clean up test data if needed
    });

    it("should initialize database with Inbox list", () => {
      const inbox = db
        .prepare("SELECT * FROM lists WHERE id = 1")
        .get();

      expect(inbox).toBeDefined();
      expect(inbox && inbox.name).toBe("Inbox");
    });

    it("should create a new list", () => {
      const result = db
        .prepare("INSERT INTO lists (name, color, emoji) VALUES (?, ?, ?)")
        .run("Test List", "#ff0000", "🧪");

      const list = db
        .prepare("SELECT * FROM lists WHERE id = ?")
        .get(result.lastInsertRowid);

      expect(list).toBeDefined();
      expect(list && list.name).toBe("Test List");
      expect(list && list.color).toBe("#ff0000");
      expect(list && list.emoji).toBe("🧪");

      // Cleanup
      db.prepare("DELETE FROM lists WHERE id = ?").run(result.lastInsertRowid);
    });

    it("should create a new task", () => {
      const result = db
        .prepare(
          "INSERT INTO tasks (list_id, name, priority) VALUES (?, ?, ?)"
        )
        .run(1, "Test Task", "high");

      const task = db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(result.lastInsertRowid);

      expect(task).toBeDefined();
      expect(task && task.name).toBe("Test Task");
      expect(task && task.priority).toBe("high");
      expect(task && task.completed).toBe(0);

      // Cleanup
      db.prepare("DELETE FROM tasks WHERE id = ?").run(result.lastInsertRowid);
    });

    it("should create a label", () => {
      const result = db
        .prepare("INSERT INTO labels (name, color, emoji) VALUES (?, ?, ?)")
        .run("Test Label", "#00ff00", "🏷️");

      const label = db
        .prepare("SELECT * FROM labels WHERE id = ?")
        .get(result.lastInsertRowid);

      expect(label).toBeDefined();
      expect(label && label.name).toBe("Test Label");

      // Cleanup
      db.prepare("DELETE FROM labels WHERE id = ?").run(result.lastInsertRowid);
    });
  });
}
