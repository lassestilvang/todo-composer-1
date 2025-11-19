import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const changes = db
      .prepare(
        "SELECT * FROM task_changes WHERE task_id = ? ORDER BY changed_at DESC"
      )
      .all(id);

    return NextResponse.json(changes);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch task changes" },
      { status: 500 }
    );
  }
}
