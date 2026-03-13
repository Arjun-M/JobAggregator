"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GlobalSearch } from "@/components/GlobalSearch";
import { JobCard, JobCardSkeleton } from "@/components/JobCard";
import { apiFetch } from "@/lib/api";

export default function HomePage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      try {
        const latestRes = await apiFetch<any>("/api/jobs?limit=5");
        setJobs(latestRes.items || []);
      } catch (err) {
        console.error("Failed to load jobs", err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  return (
    <main className="shell page-stack">
      <section className="hero" style={{ paddingBottom: '6rem' }}>
        <div className="hero-copy">
          <p className="eyebrow" style={{ color: 'var(--accent-soft)' }}>High-Signal Career Intelligence</p>
          <h1>Discover roles that matter.</h1>
          <p className="hero-text">
            No noise, no spam. A private, AI-driven aggregator for verified high-quality opportunities.
          </p>
        </div>
      </section>

      <GlobalSearch />

      <section style={{ maxWidth: '900px', margin: '4rem auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Latest Openings</h2>
          <Link href="/explore" className="button secondary small">View All Listing</Link>
        </div>

        <div className="recent-list">
          {loading ? (
            <>
              <JobCardSkeleton />
              <JobCardSkeleton />
            </>
          ) : (
            jobs.map((job) => (
              <JobCard key={job._id.toString()} job={job} />
            ))
          )}
        </div>
        
        {!loading && jobs.length === 5 && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/explore" className="button secondary">Browse Full Listing</Link>
          </div>
        )}
      </section>

      <section className="acknowledgement-section" style={{ maxWidth: '800px', margin: '4rem auto 8rem', textAlign: 'center' }}>
        <div className="panel acknowledgement-panel" style={{ padding: '3rem', borderTop: '4px solid var(--accent)' }}>
          <p className="eyebrow" style={{ color: 'var(--accent)', marginBottom: '1rem' }}>Initiative & Recognition</p>
          <h2 className="acknowledgement-title" style={{ fontSize: '1.75rem', marginBottom: '1.5rem', fontWeight: 700 }}>Acknowledgement</h2>
          <p className="acknowledgement-text" style={{ lineHeight: '1.8', fontSize: '1.125rem', color: 'var(--ink)' }}>
            We would like to express our deepest gratitude to <strong>Dr. Rajoo</strong> and <strong>Lt. Col. Shelley K. Das</strong> for their visionary leadership and initiative in spearheading this platform. 
            Their commitment to creating a high-signal environment for career growth has been the driving force behind this project.
          </p>
          <div className="acknowledgement-footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
            <div className="divider" style={{ height: '1px', background: 'var(--line)', width: '60px', alignSelf: 'center' }}></div>
            <span style={{ fontStyle: 'italic', color: 'var(--muted)', fontSize: '0.9rem' }}>Thank you for your guidance and support.</span>
            <div className="divider" style={{ height: '1px', background: 'var(--line)', width: '60px', alignSelf: 'center' }}></div>
          </div>
        </div>
      </section>
      
    </main>
  );
}
