import type { Db } from "mongodb";
import { validateExtraction } from "./utils";
import { loadEnv } from "./config";
import { createLlmProvider } from "./providers-llm";
import { log } from "./logger";

const env = loadEnv();

const PROCESS_LOCK_ID = "main-extraction";
type ProcessingState = {
  _id: string;
  running?: boolean;
  started_at?: string | null;
  finished_at?: string | null;
};

export async function getProcessingStatus(db: Db) {
  const processingState = db.collection<ProcessingState>("processing_state");
  const state = await processingState.findOne({ _id: PROCESS_LOCK_ID });
  const pending_count = await db.collection("raw_uploads").countDocuments({ status: "pending" });
  return {
    running: Boolean(state?.running),
    started_at: state?.started_at ?? null,
    finished_at: state?.finished_at ?? null,
    pending_count
  };
}

async function claimProcessingLock(db: Db) {
  const processingState = db.collection<ProcessingState>("processing_state");
  const now = new Date().toISOString();
  
  // Strict atomic lock: Only update if running is false or doesn't exist
  const result = await processingState.findOneAndUpdate(
    { _id: PROCESS_LOCK_ID, $or: [{ running: { $exists: false } }, { running: false }] },
    { $set: { running: true, started_at: now, finished_at: null } },
    { upsert: true, returnDocument: "after" }
  );
  
  return Boolean(result?.running);
}

async function releaseProcessingLock(db: Db) {
  const processingState = db.collection<ProcessingState>("processing_state");
  await processingState.updateOne(
    { _id: PROCESS_LOCK_ID },
    { $set: { running: false, finished_at: new Date().toISOString() } }
  );
}

async function nextPendingUpload(db: Db) {
  return db.collection("raw_uploads").findOneAndUpdate(
    { status: "pending" },
    { $set: { status: "processing", processing_started_at: new Date().toISOString(), updated_at: new Date().toISOString() } },
    { sort: { created_at: 1 }, returnDocument: "after" }
  );
}

export async function triggerPendingProcessing(db: Db) {
  const currentStatus = await getProcessingStatus(db);
  if (currentStatus.running) {
    return { 
      started: false, 
      reason: "already_running", 
      message: "⚠️ Extraction is already in progress. Please wait for it to finish.",
      ...currentStatus 
    };
  }

  // Reset all 'failed' raw_uploads back to 'pending'
  const resetResult = await db.collection("raw_uploads").updateMany(
    { status: "failed" },
    { $set: { status: "pending", error_reason: null, updated_at: new Date().toISOString() } }
  );

  const pendingCount = await db.collection("raw_uploads").countDocuments({ status: "pending" });
  
  if (pendingCount === 0) {
    return { 
      started: false, 
      reason: "no_pending", 
      message: "ℹ️ No pending or failed uploads found to process.",
      ...currentStatus 
    };
  }

  const claimed = await claimProcessingLock(db);
  if (!claimed) {
    return { 
      started: false, 
      reason: "already_running", 
      message: "⚠️ Extraction was just started by another process.",
      ...currentStatus 
    };
  }

  log(`Starting processing: ${pendingCount} items (${resetResult.modifiedCount} were previously failed)`, "INFO");

  // Background execution
  void processPendingUploads(db).finally(async () => {
    await releaseProcessingLock(db);
    log("Finished bulk processing and released lock", "INFO");
  });

  return { 
    started: true, 
    message: `🚀 Started processing ${pendingCount} uploads (${resetResult.modifiedCount} retried).`,
    count: pendingCount,
    running: true
  };
}

async function processPendingUploads(db: Db) {
  const llmProvider = createLlmProvider();

  while (true) {
    const upload = await nextPendingUpload(db) as any;
    if (!upload) break;

    log(`Processing upload ${upload._id}`, "INFO", { url: upload.image_url });

    try {
      const { parsed, raw } = await llmProvider.extract(upload.image_url);
      const validated = validateExtraction(parsed, upload.image_url, upload.uploaded_at);

      // Auto-reject if the AI flags it as not relevant
      if (validated.meta.is_relevant === false) {
        await db.collection("staging_jobs").insertOne({
          raw_upload_id: upload._id,
          ...validated,
          status: "rejected",
          needs_manual_review: false,
          duplicate_of: null,
          error_reason: "AI determined content is not relevant.",
          raw_llm_output: raw,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          verified_at: new Date().toISOString() // Mark as instantly "verified" to remove from queues
        });

        await db.collection("raw_uploads").updateOne(
          { _id: upload._id },
          { $set: { status: "done", processed_at: new Date().toISOString(), updated_at: new Date().toISOString() } }
        );
        
        log(`Auto-rejected irrelevant upload ${upload._id}`, "INFO");
        continue; // Skip to the next upload
      }

      await db.collection("staging_jobs").insertOne({
        raw_upload_id: upload._id,
        ...validated,
        status: "pending_review",
        needs_manual_review: validated.meta.confidence < env.CONFIDENCE_APPROVE_THRESHOLD,
        duplicate_of: null,
        error_reason: null,
        raw_llm_output: raw,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        verified_at: null
      });

      await db.collection("raw_uploads").updateOne(
        { _id: upload._id },
        { $set: { status: "done", processed_at: new Date().toISOString(), updated_at: new Date().toISOString() } }
      );
      
      log(`Successfully processed upload ${upload._id}`, "INFO");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Extraction failed";
      log(`Processing failed for ${upload._id}`, "ERROR", { message });
      
      await db.collection("raw_uploads").updateOne(
        { _id: upload._id }, 
        { $set: { status: "failed", error_reason: message, updated_at: new Date().toISOString() } }
      );
    }
  }
}
