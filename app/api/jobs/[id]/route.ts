import { NextRequest, NextResponse } from "next/server";
import { autoArchiveExpiredJobs, getPublicJob } from "@/lib/repositories";
import { getDb } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const db = await getDb();
  await autoArchiveExpiredJobs(db);

  const job = await getPublicJob(db, resolvedParams.id);

  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(job);
}
