import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const overdue = db
      .prepare(
        `SELECT COUNT(*) as count FROM tasks
         WHERE deadline IS NOT NULL
         AND date(deadline) < date('now')
         AND completed = 0`
      )
      .get() as { count: number };

    return NextResponse.json({ count: overdue.count });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch overdue count" },
      { status: 500 }
    );
  }
}
