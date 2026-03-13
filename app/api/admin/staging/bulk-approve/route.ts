import { NextRequest, NextResponse } from "next/server";
import { bulkApprove } from "@/lib/repositories";
import { getDb } from "@/lib/db";
import { loadEnv } from "@/lib/config";

const env = loadEnv();

export async function POST(req: NextRequest) {
  const db = await getDb();
  const { ids, status } = await req.json();
  const approved = await bulkApprove(db, {
    ids,
    status,
    threshold: env.CONFIDENCE_APPROVE_THRESHOLD,
  });

  return NextResponse.json({ approved_count: approved.length, approved });
}
