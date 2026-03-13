import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { loadEnv } from "@/lib/config";
import { getDb } from "@/lib/db";
import { log } from "@/lib/logger";

const env = loadEnv();

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  
  // Auto-lowercase the identifier (can be username or email)
  const identifier = username.toLowerCase().trim();

  log(`Login attempt for: ${identifier}`, "INFO");

  // Admin login check (env-based)
  // We check against the admin username/password from env
  if (identifier === env.ADMIN_USERNAME.toLowerCase() && password === env.ADMIN_PASSWORD) {
    log(`Admin login successful: ${identifier}`, "INFO");
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const token = await new SignJWT({ role: "admin", username: env.ADMIN_USERNAME })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(secret);
    return NextResponse.json({ token, role: "admin", userId: "admin", username: env.ADMIN_USERNAME });
  }

  // Database user login check: Search by username OR email OR roll_no
  const db = await getDb();
  const user = await db.collection("users").findOne({ 
    $or: [
      { username: identifier },
      { email: identifier },
      { roll_no: identifier }
    ],
    password_hash: password 
  });

  if (!user) {
    log(`Login failed for: ${identifier} - Invalid credentials`, "WARN");
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  log(`User login successful: ${user.username}`, "INFO");
  const secret = new TextEncoder().encode(env.JWT_SECRET);
  const token = await new SignJWT({ role: user.role, username: user.username, userId: user._id.toString() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);

  return NextResponse.json({ token, userId: user._id.toString(), role: user.role, username: user.username });
}
