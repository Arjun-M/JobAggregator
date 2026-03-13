import { NextRequest, NextResponse } from "next/server";
import { getProcessingStatus } from "@/lib/extraction-runner";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest) {
  const db = await getDb();
  const status = await getProcessingStatus(db);
  return NextResponse.json(status);
}
