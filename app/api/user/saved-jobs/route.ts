import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { jwtVerify } from "jose";
import { loadEnv } from "@/lib/config";
import { toggleSavedJob } from "@/lib/repositories";

const env = loadEnv();

async function getUserIdFromToken(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7);
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as string;
  } catch (err) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromToken(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId } = await req.json();
  if (!jobId) return NextResponse.json({ error: "Missing jobId" }, { status: 400 });

  const db = await getDb();
  const result = await toggleSavedJob(db, userId, jobId);

  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromToken(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const profile = await db.collection("user_profiles").findOne({ userId });
  if (!profile) return NextResponse.json({ items: [] });

  const savedJobsIds = profile.saved_jobs || [];
  if (savedJobsIds.length === 0) return NextResponse.json({ items: [] });

  const items = await db.collection("jobs")
    .find({ _id: { $in: savedJobsIds.map((id: string) => (global as any).ObjectId ? new (global as any).ObjectId(id) : require("mongodb").ObjectId.createFromHexString(id)) } })
    .toArray();

  return NextResponse.json({ items });
}
