"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { JobCard, JobCardSkeleton } from "@/components/JobCard";

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [draftQuery, setDraftQuery] = useState(initialQuery);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchJobs = useCallback(async (pageNum: number, currentQuery: string, isInitial: boolean) => {
    if (isInitial) setLoading(true);
    try {
      const res = await fetch(`/api/jobs?q=${encodeURIComponent(currentQuery)}&page=${pageNum}&limit=10`);
      const data = await res.json();
      
      if (isInitial) {
        setJobs(data.items || []);
      } else {
        setJobs(prev => [...prev, ...(data.items || [])]);
      }
      
      setHasMore(data.items?.length === 10);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  // Effect to handle URL query changes and initial load
  useEffect(() => {
    setPage(1);
    const currentQ = searchParams.get("q") || "";
    setQuery(currentQ);
    setDraftQuery(currentQ);
    fetchJobs(1, currentQ, true);
  }, [searchParams, fetchJobs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = draftQuery.trim();
    router.push(next ? `/explore?q=${encodeURIComponent(next)}` : "/explore");
  };

  const clearSearch = () => {
    setDraftQuery("");
    router.push("/explore");
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchJobs(nextPage, query, false);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--line)', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontWeight: 700 }}>
          {query ? `Results for "${query}"` : "All Opportunities"}
        </h1>
        <p className="muted" style={{ fontSize: '0.95rem' }}>
          {jobs.length > 0 ? `Showing ${jobs.length}+ verified job listings` : 'Browse our high-quality job board.'}
        </p>
      </header>

      {/* Static search bar for explore page */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <form onSubmit={handleSearchSubmit} className="search-bar-static" style={{ flex: 1 }}>
          <div className="search-input-wrap">
            <svg
              className="search-input-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search roles, skills, companies…"
              value={draftQuery}
              onChange={(e) => setDraftQuery(e.target.value)}
              className="search-input-static"
              aria-label="Search jobs"
            />
            {(draftQuery || query) && (
              <button
                type="button"
                className="search-clear"
                onClick={clearSearch}
                aria-label="Clear search"
                title="Clear"
              >
                ×
              </button>
            )}
          </div>
          <button type="submit" className="button search-submit" disabled={!draftQuery.trim()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <span style={{ marginLeft: '0.5rem' }}>Search</span>
          </button>
        </form>
      </div>

      <div className="explore-list">
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

      {!loading && jobs.length === 0 && (
        <div className="panel empty-state" style={{ padding: '6rem 4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.5rem' }}>No matches found</h3>
          <p className="muted">Try expanding your search or use keywords like "Remote", "Design", or "Senior".</p>
        </div>
      )}

      {hasMore && !loading && (
        <div style={{ textAlign: 'center', marginTop: '4rem', marginBottom: '4rem' }}>
          <button onClick={loadMore} className="button secondary" style={{ padding: '1rem 3rem' }}>
            Load More Results
          </button>
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <main className="shell page-stack" style={{ paddingTop: '3rem' }}>
      <Suspense fallback={
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <JobCardSkeleton />
          <JobCardSkeleton />
        </div>
      }>
        <ExploreContent />
      </Suspense>
    </main>
  );
}
