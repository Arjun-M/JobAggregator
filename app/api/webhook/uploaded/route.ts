import { NextRequest, NextResponse } from "next/server";
import { createRawUpload } from "@/lib/repositories";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const db = await getDb();
  const body = await req.json();
  const { image_url, uploaded_at } = body;
  const result = await createRawUpload(db, image_url, uploaded_at ?? new Date().toISOString());

  return NextResponse.json(
    {
      message: "Upload recorded",
      raw_upload_id: result.rawUploadId.toString(),
    },
    { status: 201 }
  );
}
