import { NextRequest, NextResponse } from "next/server";
import { triggerPendingProcessing } from "@/lib/extraction-runner";
import { getDb } from "@/lib/db";

export async function POST(_req: NextRequest) {
  const db = await getDb();
  const result = await triggerPendingProcessing(db);
  return NextResponse.json(result);
}
