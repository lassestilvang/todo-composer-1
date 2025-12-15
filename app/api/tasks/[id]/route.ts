import { db } from "@/lib/db";
import type { TaskWithRelations } from "@/lib/types";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as
      | TaskWithRelations
      | undefined;

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Get labels
    const labels = db
      .prepare(
        `SELECT l.* FROM labels l
         INNER JOIN task_labels tl ON l.id = tl.label_id
         WHERE tl.task_id = ?`
      )
      .all(id);

    // Get subtasks
    const subtasks = db
      .prepare("SELECT * FROM subtasks WHERE task_id = ? ORDER BY id")
      .all(id);

    // Get change history
    const changes = db
      .prepare(
        "SELECT * FROM task_changes WHERE task_id = ? ORDER BY changed_at DESC"
      )
      .all(id);

    return NextResponse.json({
      ...task,
      labels,
      subtasks,
      changes,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const MAX_POSITION = 10_000;

    const { id } = await params;
    const body = await request.json();

    // Validate and normalize "position" if provided
    if (body.position !== undefined) {
      const rawPosition = body.position;
      const parsedPosition =
        typeof rawPosition === "number"
          ? rawPosition
          : parseInt(String(rawPosition), 10);

      if (
        !Number.isFinite(parsedPosition) ||
        !Number.isInteger(parsedPosition) ||
        parsedPosition < 0 ||
        parsedPosition > MAX_POSITION
      ) {
        return NextResponse.json(
          { error: "Invalid position value" },
          { status: 400 }
        );
      }

      body.position = parsedPosition;
    }

    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as
      | TaskWithRelations
      | undefined;

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const fields = [
      "list_id",
      "name",
      "description",
      "date",
      "deadline",
      "reminder",
      "estimate_minutes",
      "actual_minutes",
      "priority",
      "recurring_type",
      "recurring_config",
      "attachment_path",
      "position",
      "completed",
    ];

    const updates: string[] = [];
    const values: unknown[] = [];

    // Track changes for logging
    const logChanges = db.prepare(
      "INSERT INTO task_changes (task_id, field_name, old_value, new_value) VALUES (?, ?, ?, ?)"
    );

    const taskRecord = task as unknown as Record<string, unknown>;

    for (const field of fields) {
      if (field in body) {
        const oldValue = taskRecord[field];
        // Normalize empty string recurring_type to null for consistency with POST
        const newValue =
          field === "recurring_type" && body[field] === "" ? null : body[field];

        if (oldValue !== newValue) {
          updates.push(`${field} = ?`);
          values.push(newValue);

          // Log the change
          logChanges.run(
            id,
            field,
            oldValue?.toString() || null,
            newValue?.toString() || null
          );
        }
      }
    }

    if (body.completed === 1 && !task.completed) {
      updates.push("completed_at = datetime('now')");
    } else if (body.completed === 0 && task.completed) {
      updates.push("completed_at = NULL");
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      values.push(id);

      db.prepare(`UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`).run(
        ...values
      );

      const result = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as
        | TaskWithRelations
        | undefined;

      // Update labels if provided
      if (body.labels !== undefined) {
        db.prepare("DELETE FROM task_labels WHERE task_id = ?").run(id);
        if (Array.isArray(body.labels) && body.labels.length > 0) {
          const insertLabel = db.prepare(
            "INSERT INTO task_labels (task_id, label_id) VALUES (?, ?)"
          );
          for (const labelId of body.labels) {
            insertLabel.run(id, labelId);
          }
        }
      }

      // Update subtasks if provided
      if (body.subtasks !== undefined) {
        db.prepare("DELETE FROM subtasks WHERE task_id = ?").run(id);
        if (Array.isArray(body.subtasks) && body.subtasks.length > 0) {
          const insertSubtask = db.prepare(
            "INSERT INTO subtasks (task_id, name, completed) VALUES (?, ?, ?)"
          );
          for (const subtask of body.subtasks) {
            if (subtask.name) {
              insertSubtask.run(id, subtask.name, subtask.completed || 0);
            }
          }
        }
      }

      return NextResponse.json(result);
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
