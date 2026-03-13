"use client";

import { AdminShell } from "@/components/AdminShell";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { DragEvent, useMemo, useRef, useState } from "react";

type UploadItem = {
  id: string;
  file?: File;
  localName: string;
  progress: number;
  imageUrl?: string;
  status: "idle" | "uploading" | "recorded" | "processing-started" | "error";
  error?: string;
};

export default function UploadPage() {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [processMessage, setProcessMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const queuedCount = useMemo(() => items.filter((item) => item.status === "idle").length, [items]);
  const uploadedCount = useMemo(() => items.filter((item) => item.status === "recorded").length, [items]);

  async function startProcessing() {
    const token = getToken();
    if (!token) return;

    try {
      const result = await apiFetch<{ started: boolean; reason?: string; pending_count: number }>(
        "/api/admin/process-pending",
        { method: "POST", body: JSON.stringify({}) },
        token
      );
      setProcessMessage(
        result.started
          ? "✅ Processing started successfully."
          : result.reason === "already_running"
            ? "ℹ️ Processing is already running."
            : "⚠️ No pending uploads found."
      );
      return result;
    } catch (error) {
      setProcessMessage(error instanceof Error ? `❌ ${error.message}` : "❌ Processing request failed.");
      return undefined;
    }
  }

  function addFiles(files: File[]) {
    const nextItems = files
      .filter((file) => file.type.startsWith("image/"))
      .map((file, index) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${index}-${Date.now()}`,
        file,
        localName: file.name,
        progress: 0,
        status: "idle" as const
      }));
    setItems((current) => [...current, ...nextItems]);
  }

  async function uploadFile(file: File, itemId: string) {
    const token = getToken();
    if (!token) return;

    setItems((current) => current.map((item) => (item.id === itemId ? { ...item, status: "uploading" } : item)));
    const signature = await apiFetch<{
      cloudName: string;
      apiKey: string;
      timestamp: number;
      folder: string;
      signature: string;
    }>("/api/admin/upload-sign", undefined, token);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signature.apiKey);
    formData.append("timestamp", String(signature.timestamp));
    formData.append("folder", signature.folder);
    formData.append("signature", signature.signature);

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`);
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        setItems((current) =>
          current.map((item) =>
            item.id === itemId ? { ...item, progress: Math.round((event.loaded / event.total) * 100) } : item
          )
        );
      };
      xhr.onload = async () => {
        if (xhr.status < 200 || xhr.status >= 300) {
          reject(new Error(xhr.responseText));
          return;
        }

        const payload = JSON.parse(xhr.responseText) as { secure_url: string };
        await apiFetch(
          "/api/webhook/uploaded",
          {
            method: "POST",
            body: JSON.stringify({ image_url: payload.secure_url })
          }
        );
        setItems((current) =>
          current.map((item) =>
            item.id === itemId ? { ...item, imageUrl: payload.secure_url, progress: 100, status: "recorded" } : item
          )
        );
        resolve();
      };
      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.send(formData);
    }).catch((error) => {
      setItems((current) =>
        current.map((item) =>
          item.id === itemId
            ? { ...item, status: "error", error: error instanceof Error ? error.message : "Upload failed" }
            : item
        )
      );
    });
  }

  async function uploadQueuedFiles() {
    if (!queuedCount) return;

    setIsUploading(true);
    const queue = items.filter((item) => item.file && item.status === "idle");
    for (const item of queue) {
      if (item.file) await uploadFile(item.file, item.id);
    }
    setIsUploading(false);

    const processResult = await startProcessing();
    if (processResult?.started) {
      setItems((current) =>
        current.map((item) => item.status === "recorded" ? { ...item, status: "processing-started" } : item)
      );
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  }

  return (
    <AdminShell>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>
        <div>
          <section
            className={`panel ${isDragging ? "is-dragging" : ""}`}
            style={{ 
              padding: "4rem 2rem", 
              textAlign: "center", 
              border: "2px dashed var(--line)",
              background: isDragging ? 'var(--accent-soft)' : 'white',
              cursor: 'pointer',
              marginBottom: '2rem',
              transition: 'all 0.2s'
            }}
            onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(event) => addFiles(Array.from(event.target.files ?? []))}
            />
            <div style={{ marginBottom: '1rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Drop job screenshots here</h2>
            <p className="muted" style={{ fontSize: '0.875rem' }}>Drag and drop images or click to browse files.</p>
          </section>

          {items.length > 0 && (
            <section className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {items.map((item) => (
                <article key={item.id} className="panel" style={{ overflow: 'hidden', padding: '0.75rem' }}>
                  <div style={{ position: 'relative', height: '140px', background: 'var(--panel-strong)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem' }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.localName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                    ) : (
                      <div style={{ height: '100%', display: 'grid', placeItems: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', height: '4px', background: 'rgba(0,0,0,0.1)' }}>
                      <div style={{ height: '100%', background: 'var(--accent)', width: `${item.progress}%`, transition: 'width 0.2s' }} />
                    </div>
                  </div>
                  <p style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.localName}</p>
                  <p className="muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.status.replace("-", " ")}</p>
                </article>
              ))}
            </section>
          )}
        </div>

        <aside>
          <div className="panel" style={{ padding: '1.5rem', position: 'sticky', top: '2rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Queue Summary</h3>
            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span className="muted">In Queue</span>
                <span style={{ fontWeight: '600' }}>{items.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span className="muted">Ready</span>
                <span style={{ fontWeight: '600' }}>{queuedCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span className="muted">Uploaded</span>
                <span style={{ fontWeight: '600' }}>{uploadedCount}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <button 
                className="button" 
                onClick={() => void uploadQueuedFiles()} 
                disabled={!queuedCount || isUploading}
                style={{ width: '100%' }}
              >
                {isUploading ? "Uploading..." : "Start Upload"}
              </button>
              <button 
                className="button secondary" 
                onClick={() => void startProcessing()}
                style={{ width: '100%' }}
              >
                Process Pending
              </button>
            </div>

            {processMessage && (
              <div style={{ marginTop: '1.5rem', fontSize: '0.8125rem', padding: '0.75rem', background: 'var(--panel-strong)', borderRadius: 'var(--radius-md)' }}>
                {processMessage}
              </div>
            )}
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}
