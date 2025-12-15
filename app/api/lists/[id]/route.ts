import { db } from "@/lib/db";
import type { List } from "@/lib/types";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const list = db
      .prepare("SELECT * FROM lists WHERE id = ?")
      .get(id) as List | undefined;

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch list" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, color, emoji } = body;

    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }
    if (color !== undefined) {
      updates.push("color = ?");
      values.push(color);
    }
    if (emoji !== undefined) {
      updates.push("emoji = ?");
      values.push(emoji);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push("updated_at = datetime('now')");
    values.push(id);

    db.prepare(
      `UPDATE lists SET ${updates.join(", ")} WHERE id = ?`
    ).run(...values);

    const result = db
      .prepare("SELECT * FROM lists WHERE id = ?")
      .get(id) as List | undefined;

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update list" },
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

    // Don't allow deleting the Inbox (id = 1)
    if (id === "1") {
      return NextResponse.json(
        { error: "Cannot delete the Inbox list" },
        { status: 400 }
      );
    }

    db.prepare("DELETE FROM lists WHERE id = ?").run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete list" },
      { status: 500 }
    );
  }
}
