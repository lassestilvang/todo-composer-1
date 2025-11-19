import { describe, it, expect, beforeEach } from "bun:test";
import { db } from "./db";

describe("Database", () => {
  beforeEach(() => {
    // Clean up test data if needed
  });

  it("should initialize database with Inbox list", () => {
    const inbox = db.prepare("SELECT * FROM lists WHERE id = 1").get() as any;
    expect(inbox).toBeDefined();
    expect(inbox.name).toBe("Inbox");
  });

  it("should create a new list", () => {
    const result = db
      .prepare("INSERT INTO lists (name, color, emoji) VALUES (?, ?, ?)")
      .run("Test List", "#ff0000", "🧪") as any;

    const list = db
      .prepare("SELECT * FROM lists WHERE id = ?")
      .get(result.lastInsertRowid) as any;

    expect(list).toBeDefined();
    expect(list.name).toBe("Test List");
    expect(list.color).toBe("#ff0000");
    expect(list.emoji).toBe("🧪");

    // Cleanup
    db.prepare("DELETE FROM lists WHERE id = ?").run(result.lastInsertRowid);
  });

  it("should create a new task", () => {
    const result = db
      .prepare(
        "INSERT INTO tasks (list_id, name, priority) VALUES (?, ?, ?)"
      )
      .run(1, "Test Task", "high") as any;

    const task = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(result.lastInsertRowid) as any;

    expect(task).toBeDefined();
    expect(task.name).toBe("Test Task");
    expect(task.priority).toBe("high");
    expect(task.completed).toBe(0);

    // Cleanup
    db.prepare("DELETE FROM tasks WHERE id = ?").run(result.lastInsertRowid);
  });

  it("should create a label", () => {
    const result = db
      .prepare("INSERT INTO labels (name, color, emoji) VALUES (?, ?, ?)")
      .run("Test Label", "#00ff00", "🏷️") as any;

    const label = db
      .prepare("SELECT * FROM labels WHERE id = ?")
      .get(result.lastInsertRowid) as any;

    expect(label).toBeDefined();
    expect(label.name).toBe("Test Label");

    // Cleanup
    db.prepare("DELETE FROM labels WHERE id = ?").run(result.lastInsertRowid);
  });
});
