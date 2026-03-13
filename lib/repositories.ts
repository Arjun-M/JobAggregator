import type { Db } from "mongodb";
import { ObjectId } from "./db";

export async function ensureIndexes(db: Db) {
  await Promise.all([
    db.collection("raw_uploads").createIndex({ image_url: 1 }),
    db.collection("raw_uploads").createIndex({ status: 1, created_at: 1 }),
    db.collection("staging_jobs").createIndex({ "meta.ocr_hash": 1 }, { unique: false }),
    db.collection("staging_jobs").createIndex({ status: 1, created_at: -1 }),
    db.collection("jobs").createIndex({ "meta.ocr_hash": 1 }, { unique: false }),
    db.collection("jobs").createIndex({ archived_at: 1, "job.validity_date": 1 }),
    db.collection("processing_state").createIndex({ running: 1 }),
    db.collection("users").createIndex({ username: 1 }, { unique: true }),
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("user_profiles").createIndex({ userId: 1 }, { unique: true }),
  ]);
}

export async function createRawUpload(db: Db, imageUrl: string, uploadedAt: string) {
  const rawUpload = {
    image_url: imageUrl,
    uploaded_at: uploadedAt,
    status: "pending",
    error_reason: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const result = await db.collection("raw_uploads").insertOne(rawUpload);
  return { rawUploadId: result.insertedId };
}

export async function fetchStagingList(db: Db, params: { status?: string; page: number; limit: number }) {
  const filter: any = params.status ? { status: params.status } : {};
  const cursor = db
    .collection("staging_jobs")
    .find(filter)
    .sort({ updated_at: -1 })
    .skip((params.page - 1) * params.limit)
    .limit(params.limit);
  const [items, total] = await Promise.all([cursor.toArray(), db.collection("staging_jobs").countDocuments(filter)]);
  return { items, total };
}

export async function getStagingById(db: Db, id: string) {
  return db.collection("staging_jobs").findOne({ _id: new ObjectId(id) });
}

export async function updateStagingById(db: Db, id: string, update: Record<string, unknown>) {
  const allowed = {
    "job.title": update["job.title"],
    "job.organization": update["job.organization"],
    "job.location": update["job.location"],
    "job.employment_type": update["job.employment_type"],
    "job.salary": update["job.salary"],
    "job.validity_date": update["job.validity_date"],
    "job.about": update["job.about"],
    "job.description": update["job.description"],
    "job.tags": update["job.tags"],
    "job.application_url": update["job.application_url"],
    "job.website": update["job.website"],
    "job.email": update["job.email"],
    "job.phone": update["job.phone"],
    needs_manual_review: update.needs_manual_review
  };

  const sanitized = Object.fromEntries(Object.entries(allowed).filter(([, value]) => value !== undefined));

  await db.collection("staging_jobs").updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...sanitized, updated_at: new Date().toISOString() } as any }
  );

  return getStagingById(db, id);
}

export async function approveStagingById(db: Db, id: string) {
  const staging = await getStagingById(db, id);
  if (!staging) {
    return null;
  }

  const approvedAt = new Date().toISOString();
  const jobDoc = {
    ...staging,
    staging_id: staging._id,
    status: "approved",
    verified_at: approvedAt,
    archived_at: null,
    updated_at: approvedAt
  } as any;
  const { _id: _discarded, ...jobToInsert } = jobDoc;

  const insertResult = await db.collection("jobs").insertOne(jobToInsert);
  await db.collection("staging_jobs").updateOne(
    { _id: staging._id },
    { $set: { status: "approved", verified_at: approvedAt, updated_at: approvedAt } }
  );

  return db.collection("jobs").findOne({ _id: insertResult.insertedId });
}

export async function rejectStagingById(db: Db, id: string, reason?: string) {
  await db.collection("staging_jobs").updateOne(
    { _id: new ObjectId(id) },
    { $set: { status: "rejected", error_reason: reason ?? "Rejected by admin", updated_at: new Date().toISOString() } }
  );
  return getStagingById(db, id);
}

export async function bulkApprove(db: Db, params: { ids?: string[]; status?: string; threshold: number }) {
  const filter: any = params.ids?.length
    ? { _id: { $in: params.ids.map((id) => new ObjectId(id)) } }
    : { status: params.status ?? "pending_review" };
  filter["meta.confidence"] = { $gte: params.threshold };
  filter["needs_manual_review"] = { $ne: true };
  const items = await db.collection("staging_jobs").find(filter).toArray();
  const approved = [];
  for (const item of items) {
    const result = await approveStagingById(db, item._id.toString());
    if (result) {
      approved.push(result);
    }
  }
  return approved;
}

export async function autoArchiveExpiredJobs(db: Db) {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

  const result = await db.collection("jobs").updateMany(
    {
      archived_at: null,
      $or: [
        { "job.validity_date": { $lt: today } },
        { verified_at: { $lt: thirtyDaysAgoIso } }
      ]
    },
    { $set: { archived_at: new Date().toISOString(), updated_at: new Date().toISOString() } }
  );
  return result.modifiedCount;
}

export async function listArchivedJobs(db: Db, params: { page: number; limit: number }) {
  const filter = { archived_at: { $ne: null } };
  const [items, total] = await Promise.all([
    db.collection("jobs")
      .find(filter)
      .sort({ archived_at: -1 })
      .skip((params.page - 1) * params.limit)
      .limit(params.limit)
      .toArray(),
    db.collection("jobs").countDocuments(filter)
  ]);
  return { items, total };
}

export async function listPublicJobs(db: Db, params: { 
  page: number; 
  limit: number; 
  tags?: string[]; 
  location?: string; 
  employment_type?: string; 
  seniority_level?: string; 
  work_mode?: string;
  industries?: string[];
  functional_roles?: string[];
  seniority_levels?: string[];
}) {
  const filter: any = { archived_at: null, status: "approved" };
  
  const tagFilters: string[] = [];
  if (params.tags?.length) tagFilters.push(...params.tags);
  if (params.seniority_level) tagFilters.push(params.seniority_level);
  if (params.work_mode) tagFilters.push(params.work_mode);
  if (params.industries?.length) tagFilters.push(...params.industries);
  if (params.functional_roles?.length) tagFilters.push(...params.functional_roles);
  if (params.seniority_levels?.length) tagFilters.push(...params.seniority_levels);

  if (tagFilters.length > 0) {
    filter["job.tags"] = { $in: tagFilters };
  }

  if (params.location) {
    filter["job.location"] = new RegExp(params.location, "i");
  }
  
  if (params.employment_type) {
    filter["job.employment_type"] = params.employment_type;
  }

  const [items, total] = await Promise.all([
    db.collection("jobs").find(filter).sort({ verified_at: -1 }).skip((params.page - 1) * params.limit).limit(params.limit).toArray(),
    db.collection("jobs").countDocuments(filter)
  ]);

  return { items, total };
}

export async function toggleSavedJob(db: Db, userId: string, jobId: string) {
  const profile = await db.collection("user_profiles").findOne({ userId });
  if (!profile) return null;

  const savedJobs = profile.saved_jobs || [];
  const isSaved = savedJobs.includes(jobId);

  if (isSaved) {
    await db.collection("user_profiles").updateOne(
      { userId },
      { $pull: { saved_jobs: jobId } as any }
    );
  } else {
    await db.collection("user_profiles").updateOne(
      { userId },
      { $addToSet: { saved_jobs: jobId } as any }
    );
  }

  return { isSaved: !isSaved };
}

export async function getPublicJob(db: Db, id: string) {
  return db.collection("jobs").findOne({ _id: new ObjectId(id), status: "approved" });
}
