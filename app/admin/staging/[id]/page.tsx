"use client";

import { AdminShell } from "@/components/AdminShell";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function StagingReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }
    void apiFetch(`/api/admin/staging/${params.id}`, undefined, token).then((data) => {
      setItem(data);
      setLoading(false);
    });
  }, [params.id]);

  async function save() {
    const token = getToken();
    if (!token || !item) {
      return;
    }
    await apiFetch(`/api/admin/staging/${params.id}`, {
      method: "PUT",
      body: JSON.stringify({
        "job.title": item.job.title,
        "job.organization": item.job.organization,
        "job.location": item.job.location,
        "job.employment_type": item.job.employment_type,
        "job.salary": item.job.salary,
        "job.validity_date": item.job.validity_date,
        "job.about": item.job.about,
        "job.description": item.job.description,
        "job.tags": item.job.tags,
        "job.application_url": item.job.application_url,
        "job.website": item.job.website,
        "job.email": item.job.email,
        "job.phone": item.job.phone,
        needs_manual_review: item.needs_manual_review
      })
    }, token);
  }

  async function approve() {
    const token = getToken();
    if (!token) {
      return;
    }
    await save();
    await apiFetch(`/api/admin/staging/${params.id}/approve`, { method: "POST", body: JSON.stringify({}) }, token);
    router.push("/admin/staging");
  }

  if (loading || !item) {
    return <AdminShell><div style={{ padding: "2rem 0" }}>Loading review item...</div></AdminShell>;
  }

  return (
    <AdminShell>
      <div className="review-grid">
        <section className="panel" style={{ padding: "1rem" }}>
          <img src={item.source.image_url} alt={item.job.title ?? "Job"} className="job-image" style={{ height: "auto", minHeight: 360 }} />
          <p className="muted">Confidence: {item.meta.confidence.toFixed(2)}</p>
          <label className="field">
            <span>OCR Text</span>
            <textarea value={item.source.ocr_text} readOnly />
          </label>
        </section>
        <section className="panel" style={{ padding: "1rem" }}>
          <h1>{item.job.title ?? "Untitled role"}</h1>
          {[
            ["Title", "title"],
            ["Organization", "organization"],
            ["Location", "location"],
            ["Employment Type", "employment_type"],
            ["Salary", "salary"],
            ["Validity Date", "validity_date"],
            ["About", "about"],
            ["Description", "description"],
            ["Application URL", "application_url"],
            ["Website", "website"],
            ["Email", "email"],
            ["Phone", "phone"]
          ].map(([label, key]) => {
            const jobKey = key as keyof typeof item.job;
            return (
              <label className="field" key={key}>
                <span>{label}</span>
                {key === "about" || key === "description" ? (
                  <textarea
                    value={item.job[jobKey] ?? ""}
                    onChange={(event) =>
                      setItem((current: any) => ({ ...current, job: { ...current.job, [jobKey]: event.target.value || null } }))
                    }
                  />
                ) : (
                  <input
                    value={item.job[jobKey] ?? ""}
                    onChange={(event) =>
                      setItem((current: any) => ({ ...current, job: { ...current.job, [jobKey]: event.target.value || null } }))
                    }
                  />
                )}
              </label>
            );
          })}
          <label className="field">
            <span>Tags (comma separated)</span>
            <input
              value={item.job.tags.join(", ")}
              onChange={(event) =>
                setItem((current: any) => ({
                  ...current,
                  job: {
                    ...current.job,
                    tags: event.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean)
                  }
                }))
              }
            />
          </label>
          <div className="toolbar">
            <button className="button secondary" onClick={() => void save()}>Save</button>
            <button className="button success" onClick={() => void approve()}>Approve</button>
            <button
              className="button danger"
              onClick={async () => {
                const token = getToken();
                if (!token) {
                  return;
                }
                await apiFetch(`/api/admin/staging/${params.id}/reject`, {
                  method: "POST",
                  body: JSON.stringify({ reason: "Rejected from review page" })
                }, token);
                router.push("/admin/staging");
              }}
            >
              Reject
            </button>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
