import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get("listId");
    const labelId = searchParams.get("labelId");
    const view = searchParams.get("view");
    const showCompleted = searchParams.get("showCompleted") === "true";
    const search = searchParams.get("search");

    let query = `
      SELECT DISTINCT t.*
      FROM tasks t
    `;

    const conditions: string[] = [];
    const params: any[] = [];

    if (listId) {
      conditions.push("t.list_id = ?");
      params.push(listId);
    }

    if (labelId) {
      query += `
        INNER JOIN task_labels tl ON t.id = tl.task_id
      `;
      conditions.push("tl.label_id = ?");
      params.push(labelId);
    }

    if (view === "today") {
      conditions.push("date(t.date) = date('now')");
    } else if (view === "next7days") {
      conditions.push(
        "date(t.date) >= date('now') AND date(t.date) <= date('now', '+7 days')"
      );
    } else if (view === "upcoming") {
      conditions.push("date(t.date) >= date('now') OR t.date IS NULL");
    }

    if (!showCompleted) {
      conditions.push("t.completed = 0");
    }

    if (search) {
      conditions.push("(t.name LIKE ? OR t.description LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    // Order primarily by explicit position within a list, falling back to date/created_at
    query +=
      " ORDER BY t.position IS NULL, t.position ASC, t.date ASC, t.created_at DESC";

    const tasks = db.prepare(query).all(...params) as any[];

    // Fetch labels and subtasks for each task
    const tasksWithRelations = tasks.map((task) => {
      const labels = db
        .prepare(
          `SELECT l.* FROM labels l
           INNER JOIN task_labels tl ON l.id = tl.label_id
           WHERE tl.task_id = ?`
        )
        .all(task.id);

      const subtasks = db
        .prepare("SELECT * FROM subtasks WHERE task_id = ? ORDER BY id")
        .all(task.id);

      return {
        ...task,
        labels,
        subtasks,
      };
    });

    return NextResponse.json(tasksWithRelations);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      list_id,
      name,
      description,
      date,
      deadline,
      reminder,
      estimate_minutes,
      actual_minutes,
      priority,
      recurring_type,
      recurring_config,
      attachment_path,
      labels,
      subtasks,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const targetListId = list_id || 1;

    // Compute the next position within the target list
    const { maxPosition } = db
      .prepare(
        "SELECT MAX(position) as maxPosition FROM tasks WHERE list_id = ?"
      )
      .get(targetListId) as { maxPosition: number | null };

    const nextPosition = (maxPosition ?? 0) + 1;

    const result = db
      .prepare(
        `INSERT INTO tasks (
          list_id, name, description, date, deadline, reminder,
          estimate_minutes, actual_minutes, priority, recurring_type,
          recurring_config, attachment_path, position
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        targetListId,
        name,
        description || null,
        date || null,
        deadline || null,
        reminder || null,
        estimate_minutes || null,
        actual_minutes || null,
        priority || "none",
        recurring_type || null,
        recurring_config || null,
        attachment_path || null,
        nextPosition
      );

    const task = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(result.lastInsertRowid) as any;

    // Add labels
    if (labels && Array.isArray(labels)) {
      const insertLabel = db.prepare(
        "INSERT INTO task_labels (task_id, label_id) VALUES (?, ?)"
      );
      for (const labelId of labels) {
        insertLabel.run(task.id, labelId);
      }
    }

    // Add subtasks
    if (subtasks && Array.isArray(subtasks)) {
      const insertSubtask = db.prepare(
        "INSERT INTO subtasks (task_id, name) VALUES (?, ?)"
      );
      for (const subtask of subtasks) {
        if (subtask.name) {
          insertSubtask.run(task.id, subtask.name);
        }
      }
    }

    // Log creation
    db.prepare(
      "INSERT INTO task_changes (task_id, field_name, new_value) VALUES (?, ?, ?)"
    ).run(task.id, "created", "Task created");

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
