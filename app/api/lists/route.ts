import { db } from "@/lib/db";
import type { List } from "@/lib/types";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const lists = db.prepare("SELECT * FROM lists ORDER BY id").all();
    return NextResponse.json(lists);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch lists" },
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
        "INSERT INTO lists (name, color, emoji) VALUES (?, ?, ?)"
      )
      .run(name, color || "#3b82f6", emoji || "📋");

    const newList = db
      .prepare("SELECT * FROM lists WHERE id = ?")
      .get(result.lastInsertRowid) as List | undefined;

    return NextResponse.json(newList, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create list" },
      { status: 500 }
    );
  }
}
