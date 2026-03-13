"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { JobImage } from "@/components/JobImage";
import { SaveJobButton } from "@/components/SaveJobButton";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function JobDetailsPage() {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJob() {
      try {
        const res = await apiFetch<any>(`/api/jobs/${id}`);
        setJob(res);
      } catch (err) {
        console.error("Failed to load job", err);
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [id]);

  if (loading) return <div className="shell" style={{ padding: '4rem', textAlign: 'center' }}>Loading job details...</div>;

  if (!job) {
    return (
      <main className="shell empty-state">
        <section className="panel" style={{ padding: '4rem' }}>
          <h2>Job Posting Not Found</h2>
          <p className="muted">This listing may have expired or was removed.</p>
          <Link href="/" className="button" style={{ marginTop: '1.5rem' }}>Back to Listings</Link>
        </section>
      </main>
    );
  }

  const verifiedAt = job.verified_at ? new Date(job.verified_at) : null;
  const isArchived = Boolean(job.archived_at);

  return (
    <main className="shell page-stack" style={{ paddingTop: '2rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {isArchived && (
          <div className="panel" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', background: 'var(--panel-strong)', borderLeft: '4px solid var(--muted)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '1.25rem' }}>📁</span>
            <div>
              <p style={{ fontWeight: 700, margin: 0, fontSize: '0.9rem' }}>This listing is archived</p>
              <p className="muted" style={{ margin: 0, fontSize: '0.8rem' }}>It was moved to the archive on {new Date(job.archived_at).toLocaleDateString()}. Information may be outdated.</p>
            </div>
          </div>
        )}

        <header style={{ marginBottom: '3rem' }} className="job-details-page-header">
          <div className="job-details-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
            <Link href={isArchived ? "/archive" : "/"} className="button secondary small">
              &larr; Back to {isArchived ? "Archive" : "Listings"}
            </Link>
            <SaveJobButton jobId={job._id.toString()} initialIsSaved={job.is_saved} showLabel={true} />
          </div>
          <div className="job-details-title-area" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem' }}>
            <div style={{ opacity: isArchived ? 0.7 : 1 }}>
              <p className="eyebrow">{job.job.organization ?? "Independent Listing"}</p>
              <h1 className="job-title-h1" style={{ fontSize: '2.5rem', lineHeight: '1.1', marginBottom: '1rem' }}>{job.job.title ?? "Untitled Role"}</h1>
              <div className="job-meta-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.875rem' }}>
                <span className="muted" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  {job.job.location ?? "Remote / Global"}
                </span>
                {verifiedAt && (
                  <span className="muted" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Posted {verifiedAt.toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className={`badge ${isArchived ? 'muted' : 'secondary'} job-type-badge`} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
              {isArchived ? "Archived" : (job.job.employment_type ?? "Direct Listing")}
            </div>
          </div>
        </header>

        <div style={{ display: 'grid', gap: '3rem', opacity: isArchived ? 0.8 : 1 }}>
          <section className="job-description-section">
             <div className="panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.25rem', fontSize: '1.25rem' }}>About the Company</h3>
                <p style={{ lineHeight: '1.7', color: 'var(--ink)', fontSize: '1rem' }}>
                   {job.job.about || "Information about the company is not provided in this listing."}
                </p>
             </div>

             <div className="panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.25rem', fontSize: '1.25rem' }}>Job Description</h3>
                <div style={{ lineHeight: '1.7', color: 'var(--ink)', fontSize: '1.125rem', whiteSpace: 'pre-wrap' }}>
                   {job.job.description || "The job description was not extracted clearly from the source."}
                </div>

                <div className="tag-row" style={{ marginTop: '2.5rem' }}>
                  {job.job.tags?.map((tag: string) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
             </div>
          </section>

          <section className="job-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="panel" style={{ padding: '1.5rem' }}>
               <h4 className="eyebrow" style={{ fontSize: '0.7rem' }}>Compensation</h4>
               <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.5rem 0' }}>{job.job.salary || "Undisclosed"}</p>
               {job.job.validity_date && (
                 <p className="muted" style={{ fontSize: '0.8125rem' }}>Expires on {job.job.validity_date}</p>
               )}
            </div>

            <div className="panel" style={{ padding: '1.5rem' }}>
               <h4 className="eyebrow" style={{ fontSize: '0.7rem' }}>Contact Info</h4>
               <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.5rem' }}>
                  {job.job.email && (
                    <div style={{ fontSize: '0.875rem' }}><strong>Email:</strong> {job.job.email}</div>
                  )}
                  {job.job.phone && (
                    <div style={{ fontSize: '0.875rem' }}><strong>Phone:</strong> {job.job.phone}</div>
                  )}
                  {!job.job.email && !job.job.phone && (
                    <p className="muted" style={{ fontSize: '0.8125rem' }}>Use the company website or application URL for inquiries.</p>
                  )}
               </div>
            </div>
          </section>

          <section className="job-source-section">
            <h4 className="eyebrow" style={{ marginBottom: '1rem', textAlign: 'center' }}>Original Source Screenshot</h4>
            <JobImage src={job.source.image_url} alt={job.job.title} uploadedAt={job.source.uploaded_at} />
          </section>

          <div className="panel job-details-actions" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', background: 'var(--panel-strong)', border: '2px solid var(--accent-soft)' }}>
            {job.job.application_url ? (
              <a href={job.job.application_url} className="button" style={{ padding: '0.75rem 2rem' }} target="_blank" rel="noreferrer">
                Apply for this Role
              </a>
            ) : null}
            {job.job.website ? (
              <a href={job.job.website} className="button secondary" style={{ padding: '0.75rem 2rem' }} target="_blank" rel="noreferrer">
                Company Portal
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
