import Link from "next/link";

export default function ReportsLandingPage() {
  const reportTypes = [
    {
      id: 'daily',
      title: 'The Daily Digest',
      description: 'A focused look at every role and event added in the last 24 hours. Perfect for active seekers.',
      icon: '🌅'
    },
    {
      id: 'weekly',
      title: 'Weekly Market Wrap',
      description: 'The big picture. Trends, major hires, and curated roles from the past 7 days.',
      icon: '📈'
    },
    {
      id: 'monthly',
      title: 'Monthly Industry Report',
      description: 'Long-term movements and deep dives into the month\'s biggest opportunities.',
      icon: '🌍'
    }
  ];

  return (
    <main className="shell page-stack" style={{ paddingTop: '3rem' }}>
      <header style={{ maxWidth: '800px', margin: '0 auto 4rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Market Reports</h1>
        <p className="hero-text" style={{ fontSize: '1rem', color: 'var(--muted)' }}>
          High-signal industry analysis and curated job digests, generated specifically for your career growth.
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        {reportTypes.map((report) => (
          <Link key={report.id} href={`/reports/${report.id}`} className="panel report-card" style={{ textDecoration: 'none', color: 'inherit', padding: '2rem', transition: 'transform 0.2s, border-color 0.2s' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>{report.icon}</div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 700 }}>{report.title}</h2>
            <p className="muted" style={{ fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>{report.description}</p>
            <span className="button secondary small" style={{ width: '100%' }}>View Report</span>
          </Link>
        ))}
      </div>

      <div className="panel" style={{ maxWidth: '600px', margin: '6rem auto 0', padding: '2.5rem', textAlign: 'center', background: 'var(--panel-strong)' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>Personalized Reports</h3>
        <p className="muted" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Want reports tailored specifically to your saved industries and roles?
        </p>
        <Link href="/dashboard" className="button">Set Preferences</Link>
      </div>
    </main>
  );
}
