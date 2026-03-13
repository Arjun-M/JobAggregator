export default function AboutPage() {
  return (
    <main className="shell page-stack" style={{ paddingTop: '4rem' }}>
      <article className="about-article" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header className="about-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 className="about-title-h1" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1.5rem' }}>About JobAggregator</h1>
          <p className="hero-text about-subtitle" style={{ fontSize: '1.25rem' }}>
            A private, high-signal intelligence platform for career opportunities.
          </p>
        </header>

        <section className="panel about-panel" style={{ padding: '3rem', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Our Purpose</h2>
          <p style={{ lineHeight: '1.8', marginBottom: '1.5rem', fontSize: '1.125rem' }}>
            JobAggregator is a specialized internal tool designed to solve the noise problem in modern job searching. 
            By utilizing advanced OCR and AI-driven classification, we transform raw job postings from various 
            private sources into structured, searchable, and actionable data.
          </p>
          <p style={{ lineHeight: '1.8', fontSize: '1.125rem' }}>
            This platform is maintained as a closed-source initiative to ensure the highest standards of data 
            integrity and to focus purely on serving our specific user base without the distractions of public 
            job board spam.
          </p>
        </section>

        <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="panel about-panel-small" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>AI-Powered</h3>
            <p className="muted" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
              Every listing is processed through our proprietary extraction engine, ensuring salary bands, 
              tech stacks, and seniority levels are accurately mapped to our taxonomy.
            </p>
          </div>
          <div className="panel about-panel-small" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Verified Only</h3>
            <p className="muted" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
              Unlike public boards, every opportunity here has been reviewed for authenticity and relevance, 
              drastically reducing the "apply-to-void" ratio.
            </p>
          </div>
        </div>

        <section style={{ marginTop: '5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Closed Access</h2>
          <p className="muted" style={{ maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
            Access to JobAggregator is restricted to authorized members. If you have been provided with a registration 
            invite, please use your official credentials to sign up.
          </p>
        </section>

        <section className="acknowledgement-section" style={{ marginTop: '6rem', textAlign: 'center' }}>
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
      </article>
    </main>
  );
}
