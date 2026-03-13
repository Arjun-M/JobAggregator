"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function ReportPage() {
  const { period } = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await apiFetch<any>(`/api/reports?period=${period}`);
        setReport(res);
      } catch (err) {
        console.error("Report fetch failed", err);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [period]);

  if (loading) return <div className="shell" style={{ padding: '4rem', textAlign: 'center' }}>Generating {period} report...</div>;

  const title = period === 'daily' ? 'The Daily Digest' : period === 'weekly' ? 'Weekly Market Wrap' : 'Monthly Industry Report';
  const subtitle = period === 'daily' ? 'Everything added in the last 24 hours.' : period === 'weekly' ? 'Insights and roles from the past 7 days.' : 'Comprehensive view of the past month.';

  return (
    <main className="shell page-stack" style={{ paddingTop: '2.5rem' }}>
      <nav className="report-nav" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
        <Link href="/reports/daily" className={`button ${period === 'daily' ? '' : 'secondary'} small`}>Daily</Link>
        <Link href="/reports/weekly" className={`button ${period === 'weekly' ? '' : 'secondary'} small`}>Weekly</Link>
        <Link href="/reports/monthly" className={`button ${period === 'monthly' ? '' : 'secondary'} small`}>Monthly</Link>
      </nav>
      <article className="report-article" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header className="report-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p className="eyebrow" style={{ color: 'var(--accent)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <h1 className="report-title-h1" style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>{title}</h1>
          <p className="hero-text report-subtitle" style={{ fontSize: '1rem', opacity: 0.8 }}>{subtitle}</p>
        </header>

        <div className="report-content" style={{ display: 'grid', gap: '4rem' }}>
          {report.items?.length > 0 ? report.items.map((job: any, index: number) => (
            <section key={job._id} className="report-section" style={{ borderBottom: index === report.items.length - 1 ? 'none' : '1px solid var(--line)', paddingBottom: '4rem' }}>
              <div className="report-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', gap: '1rem' }}>
                <h2 className="report-item-title" style={{ fontSize: '2rem', fontWeight: 700 }}>
                  <Link href={`/jobs/${job._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {job.job.title}
                  </Link>
                </h2>
                <span className="badge secondary report-item-badge" style={{ whiteSpace: 'nowrap' }}>{job.job.employment_type}</span>
              </div>
              
              <div className="report-item-meta muted" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem', flexWrap: 'wrap' }}>
                <strong>{job.job.organization}</strong>
                <span>&bull;</span>
                <span>{job.job.location}</span>
                {job.job.salary && (
                  <>
                    <span>&bull;</span>
                    <span style={{ color: 'var(--ink)' }}>{job.job.salary}</span>
                  </>
                )}
              </div>

              <div className="report-item-description" style={{ fontSize: '1.125rem', lineHeight: '1.8', color: 'var(--ink)', whiteSpace: 'pre-wrap', marginBottom: '2rem' }}>
                {job.job.description?.slice(0, 500)}...
              </div>

              <div className="report-item-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div className="tag-row">
                  {job.job.tags?.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="tag-mini">{tag}</span>
                  ))}
                </div>
                <Link href={`/jobs/${job._id}`} className="button secondary small report-read-more">Read Full Posting &rarr;</Link>
              </div>
            </section>
          )) : (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <p className="muted">No new roles found for this period.</p>
              <Link href="/explore" className="button" style={{ marginTop: '1.5rem' }}>Browse All Listings</Link>
            </div>
          )}
        </div>

        <footer style={{ marginTop: '6rem', padding: '4rem 0', borderTop: '4px solid var(--ink)', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Never miss an update.</h3>
          <p className="muted" style={{ marginBottom: '2rem' }}>Get these reports delivered straight to your inbox every week.</p>
          <Link href="/dashboard" className="button">Manage Subscriptions</Link>
        </footer>
      </article>
    </main>
  );
}
