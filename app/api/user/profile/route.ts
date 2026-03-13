import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { jwtVerify } from "jose";
import { loadEnv } from "@/lib/config";

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

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromToken(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const profile = await db.collection("user_profiles").findOne({ userId });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  return NextResponse.json(profile);
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromToken(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const db = await getDb();

  const timestamp = new Date().toISOString();
  await db.collection("user_profiles").updateOne(
    { userId },
    { 
      $set: { 
        ...body, 
        updated_at: timestamp 
      } 
    },
    { upsert: true }
  );

  return NextResponse.json({ success: true, updated_at: timestamp });
}
