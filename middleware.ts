import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { loadEnv } from "@/lib/config";

const env = loadEnv();
const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/admin/") && pathname !== "/api/admin/login") {
    const token = req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      await jwtVerify(token, secret);
    } catch (err) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}
