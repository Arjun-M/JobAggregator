import { NextRequest, NextResponse } from "next/server";
import { getStagingById, updateStagingById } from "@/lib/repositories";
import { getDb } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string | string[] }> }
) {
  const resolvedParams = await params;
  const db = await getDb();
  const itemId = Array.isArray(resolvedParams.id) ? resolvedParams.id[0] : resolvedParams.id;
  if (typeof itemId !== "string") {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  const item = await getStagingById(db, itemId);

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string | string[] }> }
) {
  const resolvedParams = await params;
  const db = await getDb();
  const body = await _req.json();
  const itemId = Array.isArray(resolvedParams.id) ? resolvedParams.id[0] : resolvedParams.id;
  if (typeof itemId !== "string") {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  const item = await updateStagingById(db, itemId, body);

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}