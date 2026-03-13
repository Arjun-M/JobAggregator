"use client";

import { useEffect, useState } from "react";
import { JobCard, JobCardSkeleton } from "@/components/JobCard";
import { apiFetch } from "@/lib/api";

function ArchiveContent() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function fetchArchived() {
      setLoading(true);
      try {
        const res = await apiFetch<any>(`/api/jobs/archive?page=${page}&limit=10`);
        if (page === 1) {
          setJobs(res.items || []);
        } else {
          setJobs(prev => [...prev, ...(res.items || [])]);
        }
        setHasMore(res.items?.length === 10);
      } catch (err) {
        console.error("Failed to fetch archive", err);
      } finally {
        setLoading(false);
      }
    }
    fetchArchived();
  }, [page]);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--line)', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontWeight: 700, color: 'var(--muted)' }}>
          Job Archive
        </h1>
        <p className="muted" style={{ fontSize: '0.95rem' }}>
          Historical listings that are over 30 days old or expired.
        </p>
      </header>

      <div className="explore-list" style={{ opacity: 0.7 }}>
        {jobs.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>

      {loading && (
        <>
          <JobCardSkeleton />
          <JobCardSkeleton />
        </>
      )}

      {hasMore && !loading && (
        <div style={{ textAlign: 'center', marginTop: '4rem', marginBottom: '4rem' }}>
          <button onClick={() => setPage(p => p + 1)} className="button secondary">
            Load More Archives
          </button>
        </div>
      )}
    </div>
  );
}

export default function ArchivePage() {
  return (
    <main className="shell page-stack" style={{ paddingTop: '3rem' }}>
      <ArchiveContent />
    </main>
  );
}
