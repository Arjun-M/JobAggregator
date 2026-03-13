import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest) {
  const db = await getDb();
  
  // Weekly report: jobs in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  // Monthly report: jobs in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [weekly, monthly, archived] = await Promise.all([
    db.collection("jobs").countDocuments({ verified_at: { $gte: sevenDaysAgo.toISOString() } }),
    db.collection("jobs").countDocuments({ verified_at: { $gte: thirtyDaysAgo.toISOString() } }),
    db.collection("jobs").countDocuments({ archived_at: { $ne: null } })
  ]);

  // Get trending tags
  const recentJobs = await db.collection("jobs")
    .find({ verified_at: { $gte: thirtyDaysAgo.toISOString() } })
    .project({ "job.tags": 1 })
    .toArray();

  const tagCounts: Record<string, number> = {};
  recentJobs.forEach(job => {
    job.job?.tags?.forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const trendingTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);

  return NextResponse.json({
    weekly_count: weekly,
    monthly_count: monthly,
    archived_count: archived,
    trending_tags: trendingTags
  });
}
