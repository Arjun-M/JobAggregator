import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const db = await getDb();
  const { searchParams } = req.nextUrl;
  const period = searchParams.get("period") || "daily"; // daily, weekly, monthly

  const now = new Date();
  let startDate = new Date();

  if (period === "daily") startDate.setDate(now.getDate() - 1);
  else if (period === "weekly") startDate.setDate(now.getDate() - 7);
  else if (period === "monthly") startDate.setDate(now.getDate() - 30);

  const filter = {
    status: "approved",
    archived_at: null,
    verified_at: { $gte: startDate.toISOString() }
  };

  const items = await db.collection("jobs")
    .find(filter)
    .sort({ verified_at: -1 })
    .toArray();

  return NextResponse.json({ 
    period,
    count: items.length,
    items,
    generated_at: now.toISOString()
  });
}
