import { NextRequest, NextResponse } from "next/server";
import { approveStagingById } from "@/lib/repositories";
import { getDb } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string | string[] }> }
) {
  const resolvedParams = await params;
  const db = await getDb();
  const itemId = Array.isArray(resolvedParams.id) ? resolvedParams.id[0] : resolvedParams.id;
  if (typeof itemId !== "string") {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  const item = await approveStagingById(db, itemId);

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}
