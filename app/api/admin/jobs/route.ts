import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { jwtVerify } from "jose";
import { loadEnv } from "@/lib/config";

const env = loadEnv();

async function isAdmin(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.substring(7);
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload.role === "admin";
  } catch (err) {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") || "";
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 50);

  let filter: any = {};
  if (q) {
    const regex = new RegExp(q, "i");
    filter.$or = [
      { "job.title": regex },
      { "job.organization": regex },
      { "job.location": regex }
    ];
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
