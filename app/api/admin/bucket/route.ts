import { NextRequest, NextResponse } from "next/server";
import { configureCloudinary } from "@/lib/cloudinary";
import { getDb } from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
    const db = await getDb();
    const cloudinary = configureCloudinary();

    // 1. Fetch raw_uploads from MongoDB
    const rawUploads = await db.collection("raw_uploads")
      .find({})
      .sort({ created_at: -1 })
      .limit(100)
      .toArray();

    // 2. Fetch files from Cloudinary (referred to as S3 Bucket)
    // We'll look into the 'job-classifier/raw' folder as defined in lib/cloudinary.ts
    const bucketFiles = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'job-classifier/',
      max_results: 100
    });

    return NextResponse.json({
      database_records: rawUploads,
      bucket_assets: bucketFiles.resources
    });
  } catch (error: any) {
    console.error("Bucket API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch bucket data" }, { status: 500 });
  }
}
