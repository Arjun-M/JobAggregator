import { NextRequest, NextResponse } from "next/server";
import { fetchStagingList } from "@/lib/repositories";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const db = await getDb();
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status");
  const page = searchParams.get("page");
  const limit = searchParams.get("limit");

  const items = await fetchStagingList(db, {
    status: status ?? undefined,
    page: Number(page ?? 1),
    limit: Number(limit ?? 20),
  });

  return NextResponse.json(items);
}
