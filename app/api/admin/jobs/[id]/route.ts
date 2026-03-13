import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { jwtVerify } from "jose";
import { loadEnv } from "@/lib/config";
import { ObjectId } from "@/lib/db";

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { action, jobData } = await req.json();
  const db = await getDb();

  if (action === "archive") {
    await db.collection("jobs").updateOne(
      { _id: new ObjectId(id) },
      { $set: { archived_at: new Date().toISOString(), updated_at: new Date().toISOString() } }
    );
  } else if (action === "unarchive") {
    await db.collection("jobs").updateOne(
      { _id: new ObjectId(id) },
      { $set: { archived_at: null, updated_at: new Date().toISOString() } }
    );
  } else if (action === "edit" && jobData) {
    await db.collection("jobs").updateOne(
      { _id: new ObjectId(id) },
      { $set: { "job": jobData, updated_at: new Date().toISOString() } }
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = await getDb();

  await db.collection("jobs").deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ success: true });
}
