import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { loadEnv } from "@/lib/config";
import { getDb } from "@/lib/db";

const env = loadEnv();

export async function POST(req: NextRequest) {
  const { username, password, email, roll_no } = await req.json();

  if (!username || !password || !email || !roll_no) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Force lowercase for username and email for case-insensitive lookup later
  const cleanUsername = username.toLowerCase().trim();
  const cleanEmail = email.toLowerCase().trim();
  const cleanRollNo = roll_no.trim();

  const db = await getDb();
  const existingUser = await db.collection("users").findOne({ 
    $or: [
      { username: cleanUsername }, 
      { email: cleanEmail },
      { roll_no: cleanRollNo }
    ] 
  });

  if (existingUser) {
    return NextResponse.json({ error: "Username, email, or Roll No already exists" }, { status: 409 });
  }

  const timestamp = new Date().toISOString();
  const user = {
    username: cleanUsername,
    email: cleanEmail,
    roll_no: cleanRollNo,
    password_hash: password,
    role: "user",
    created_at: timestamp,
    updated_at: timestamp
  };

  const result = await db.collection("users").insertOne(user);
  const userId = result.insertedId.toString();

  // Create empty profile
  await db.collection("user_profiles").insertOne({
    userId,
    personalized_filters: { 
      employment_types: [],
      industries: [],
      functional_roles: [],
      seniority_levels: [],
      locations: [],
      min_salary: null 
    },
    newsletter_subscription: false,
    saved_jobs: [],
    updated_at: timestamp
  });

  const secret = new TextEncoder().encode(env.JWT_SECRET);
  const token = await new SignJWT({ role: "user", username: cleanUsername, userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);

  return NextResponse.json({ token, userId, username: cleanUsername });
}
