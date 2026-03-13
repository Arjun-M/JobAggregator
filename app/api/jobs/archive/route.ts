import { NextRequest, NextResponse } from "next/server";
import { listArchivedJobs } from "@/lib/repositories";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const db = await getDb();
  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);

  const data = await listArchivedJobs(db, { page, limit });
  return NextResponse.json(data);
}
