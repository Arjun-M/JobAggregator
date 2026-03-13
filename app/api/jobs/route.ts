import { NextRequest, NextResponse } from "next/server";
import { autoArchiveExpiredJobs } from "@/lib/repositories";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest) {
  const db = await getDb();
  await autoArchiveExpiredJobs(db);

  const { searchParams } = _req.nextUrl;
  const q = searchParams.get("q") || "";
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 20);

  
  // Initialize filter
  let filter: any = { archived_at: null, status: "approved" };

  if (q) {
    const searchRegex = new RegExp(q, "i");
    const searchQuery = {
      $or: [
        { "job.title": searchRegex },
        { "job.organization": searchRegex },
        { "job.location": searchRegex },
        { "job.tags": { $in: [searchRegex] } },
        { "job.description": searchRegex }
      ]
    };
    // Merge search query with existing filters if any
    if (Object.keys(filter).length > 2) { // more than status and archived_at
      filter = { $and: [filter, searchQuery] };
    } else {
      Object.assign(filter, searchQuery);
    }
  }

  const [items, total] = await Promise.all([
    db.collection("jobs")
      .find(filter)
      .sort({ verified_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    db.collection("jobs").countDocuments(filter)
  ]);

  return NextResponse.json({ items, total });
}
