import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const labels = db.prepare("SELECT * FROM labels ORDER BY name").all();
    return NextResponse.json(labels);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch labels" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, color, emoji } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const result = db
      .prepare(
        "INSERT INTO labels (name, color, emoji) VALUES (?, ?, ?)"
      )
      .run(name, color || "#6b7280", emoji || "🏷️");

    const newLabel = db
      .prepare("SELECT * FROM labels WHERE id = ?")
      .get(result.lastInsertRowid) as any;

    return NextResponse.json(newLabel, { status: 201 });
  } catch (error: any) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return NextResponse.json(
        { error: "Label with this name already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create label" },
      { status: 500 }
    );
  }
}
