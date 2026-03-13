"use client";

import Link from "next/link";
import { SaveJobButton } from "./SaveJobButton";

export function JobCard({ job }: { job: any }) {
  const tags = job.job.tags || [];
  const verifiedAt = job.verified_at ? new Date(job.verified_at) : null;
  const hasImage = Boolean(job.source.image_url);

  return (
    <Link href={`/jobs/${job._id}`} className="panel job-card-horizontal">
      <div className="job-card-image-container">
        {hasImage ? (
          <img src={job.source.image_url} alt={job.job.title} className="job-card-image" />
        ) : (
          <div className="job-card-image-placeholder">
            {job.job.organization?.slice(0, 1) || "J"}
          </div>
        )}
      </div>
      <div className="job-card-content">
        <div className="job-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="job-card-company">{job.job.organization || "Independent Listing"}</span>
            {verifiedAt && <span className="job-card-date">{verifiedAt.toLocaleDateString()}</span>}
          </div>
          <SaveJobButton jobId={job._id.toString()} initialIsSaved={job.is_saved} />
        </div>
        <h3 className="job-card-title">{job.job.title || "Untitled Role"}</h3>
        <p className="job-card-excerpt">{job.job.description?.slice(0, 120)}...</p>
        <div className="job-card-footer">
          <div className="job-card-location">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            {job.job.location || "Remote"}
          </div>
          <div className="job-card-tags">
            {tags.slice(0, 2).map((tag: string) => (
              <span key={tag} className="tag-mini">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="panel job-card-horizontal skeleton">
      <div className="job-card-image-container skeleton-box"></div>
      <div className="job-card-content">
        <div className="skeleton-line short"></div>
        <div className="skeleton-line medium"></div>
        <div className="skeleton-line long"></div>
        <div className="skeleton-line short"></div>
      </div>
    </div>
  );
}
