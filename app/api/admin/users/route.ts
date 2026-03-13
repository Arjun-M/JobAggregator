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

export async function GET(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = await getDb();
  const users = await db.collection("users").find({}, { projection: { password_hash: 0 } }).toArray();
  
  // Join with profiles to get status/preferences if needed
  const profiles = await db.collection("user_profiles").find({}).toArray();
  
  const augmentedUsers = users.map(user => {
    const profile = profiles.find(p => p.userId === user._id.toString());
    return {
      ...user,
      is_banned: profile?.is_banned || false,
      last_login: profile?.updated_at
    };
  });

  return NextResponse.json(augmentedUsers);
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId, action } = await req.json();
  const db = await getDb();

  if (action === "ban") {
    await db.collection("user_profiles").updateOne(
      { userId },
      { $set: { is_banned: true, updated_at: new Date().toISOString() } },
      { upsert: true }
    );
  } else if (action === "unban") {
    await db.collection("user_profiles").updateOne(
      { userId },
      { $set: { is_banned: false, updated_at: new Date().toISOString() } },
      { upsert: true }
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const db = await getDb();
  await Promise.all([
    db.collection("users").deleteOne({ _id: new ObjectId(userId) }),
    db.collection("user_profiles").deleteOne({ userId })
  ]);

  return NextResponse.json({ success: true });
}
