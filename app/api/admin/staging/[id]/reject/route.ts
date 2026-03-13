import { NextRequest, NextResponse } from "next/server";
import { rejectStagingById } from "@/lib/repositories";
import { getDb } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string | string[] }> }
) {
  const resolvedParams = await params;
  const db = await getDb();
  const { reason } = await _req.json();
  const itemId = Array.isArray(resolvedParams.id) ? resolvedParams.id[0] : resolvedParams.id;
  if (typeof itemId !== "string") {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  const item = await rejectStagingById(db, itemId, reason);

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}
