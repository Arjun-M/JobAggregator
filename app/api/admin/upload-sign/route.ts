import { NextRequest, NextResponse } from "next/server";
import { buildSignedUpload } from "@/lib/cloudinary";

export async function GET(_req: NextRequest) {
  const signedUpload = buildSignedUpload();
  return NextResponse.json(signedUpload);
}
